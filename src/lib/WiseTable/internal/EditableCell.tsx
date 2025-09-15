import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { RenderContext } from '../contexts/RenderContext'
import { useEditingContext } from '../hooks/useWiseTable'
import type { WiseTableColumn } from '../index'
import { SearchableSelect } from '../ui/SearchableSelect'
import { getBadgeColor, getBadgeColorFrom } from '../utils/badgeColors'
import {
  formatDate,
  formatDateForEditing,
  isValidDateInput,
  parseDateInput,
} from '../utils/dateUtils'
import { formatCellValue } from '../utils/formatCellValue'

interface EditableCellProps<T> {
  row: T
  rowId: string | number
  rowIndex: number
  column: WiseTableColumn<T>
  value: T[keyof T]
  idColumn: keyof T
}

export function EditableCell<T>({
  row,
  rowId,
  rowIndex,
  column,
  value,
  idColumn,
}: EditableCellProps<T>) {
  const {
    data,
    currentEdit,
    setCurrentEdit,
    startEdit,
    commitEdit,
    cancelEdit,
    dirtyRows,
  } = useEditingContext<T>()

  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryResult = column.useColumnQuery?.()
  const availableOptions = queryResult?.options ?? column.options ?? []
  const isOptionsLoading = queryResult?.isLoading ?? false
  const hasOptionsError = queryResult?.isError ?? false

  const isEditing =
    currentEdit?.rowIndex === rowIndex && currentEdit?.columnKey === column.key

  const dirtyRecord = dirtyRows.get(rowId)
  const effectiveValue = (
    dirtyRecord
      ? (dirtyRecord.modifiedData as Record<string, unknown>)[
          column.key as string
        ]
      : undefined
  ) as T[keyof T]
  const currentCellValue = (dirtyRecord ? effectiveValue : value) as T[keyof T]

  useEffect(() => {
    if (isEditing) {
      if (column.type === 'textArea' && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, column.type])

  useEffect(() => {
    if (
      isEditing &&
      currentEdit?.rowIndex === rowIndex &&
      currentEdit?.columnKey === column.key
    ) {
      const base = (currentEdit?.newValue ??
        currentEdit?.oldValue ??
        currentCellValue) as unknown

      if (column.type === 'date') {
        setInputValue(
          formatDateForEditing(
            base as string | Date | null | undefined,
            column.dateFormat,
          ),
        )
      } else {
        setInputValue(String(base ?? ''))
      }
    }
  }, [
    isEditing,
    currentEdit,
    rowIndex,
    column.key,
    column.type,
    column.dateFormat,
    currentCellValue,
  ])

  const handleCellClick = () => {
    const isIdColumn = column.key === idColumn
    const canEdit = column.readonly !== true && !isIdColumn
    if (!canEdit || isEditing) return

    startEdit(rowIndex, column.key, currentCellValue)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleCommit()
    }
  }

  const handleCommit = () => {
    if (!isEditing) return
    const isIdColumn = column.key === idColumn
    if (column.readonly === true || isIdColumn) {
      setCurrentEdit(null)
      return
    }

    let newValue: T[keyof T]

    if (column.type === 'date') {
      if (inputValue.trim() === '') {
        // For empty date input, use null for nullable schema compatibility
        newValue = null as T[keyof T]
      } else {
        const dateValue = parseDateInput(inputValue, column.dateFormat)
        if (dateValue) {
          // Store as Date object to satisfy z.date() schema; equality handled by normalize()
          newValue = dateValue as T[keyof T]
        } else {
          // Invalid date format, keep original value
          newValue = value
        }
      }
    } else if (column.type === 'number' || typeof value === 'number') {
      if (inputValue.trim() === '') {
        // For empty number input, use null for nullable schema compatibility
        newValue = null as T[keyof T]
      } else {
        const numValue = parseFloat(inputValue)
        newValue = (isNaN(numValue) ? value : numValue) as T[keyof T]
      }
    } else if (typeof value === 'boolean') {
      newValue = (inputValue === 'true') as T[keyof T]
    } else {
      // For string fields, convert empty string to null for nullable schema compatibility
      newValue = (inputValue.trim() === '' ? null : inputValue) as T[keyof T]
    }

    commitEdit(rowId, column.key, newValue, row)
  }

  const handleInputBlur = () => {
    handleCommit()
  }

  if (!isEditing) {
    let displayContent: React.ReactNode

    const dirtyRow = dirtyRows.get(rowId)
    const currentValue = dirtyRow?.modifiedData[column.key] ?? value

    if (column.render) {
      const renderContextValue = {
        rowId,
        columnKey: column.key,
        originalRow: row,
        rowIndex,
      }

      displayContent = (
        <RenderContext.Provider value={renderContextValue}>
          {column.render(
            currentValue,
            dirtyRow?.modifiedData ?? row,
            data,
            rowIndex,
          )}
        </RenderContext.Provider>
      )
    } else if (availableOptions.length > 0) {
      const optionIndex = availableOptions.findIndex(
        (opt) => String(opt.value) === String(currentValue),
      )
      const matchedOption =
        optionIndex >= 0 ? availableOptions[optionIndex] : undefined
      const label = matchedOption
        ? matchedOption.label
        : formatCellValue(currentValue)
      const explicitBadge = matchedOption?.badge
        ? getBadgeColorFrom(
            matchedOption.badge.color,
            matchedOption.badge.intensity,
          )
        : null
      const colorScheme =
        optionIndex >= 0 ? getBadgeColor(optionIndex) : getBadgeColor(0)
      displayContent = (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            explicitBadge
              ? `${explicitBadge.bg} ${explicitBadge.text}`
              : `${colorScheme.bg} ${colorScheme.text}`
          }`}
        >
          {label}
        </span>
      )
    } else if (column.type === 'date') {
      displayContent = formatDate(currentValue as string, column.dateFormat)
    } else if (column.type === 'textArea') {
      const text = formatCellValue(currentValue)
      displayContent = (
        <div className="max-w-xs">
          <div className="text-sm line-clamp-2">{text || '-'}</div>
        </div>
      )
    } else {
      displayContent = formatCellValue(currentValue)
    }

    const isIdColumn = column.key === idColumn
    const canEdit = column.readonly !== true && !isIdColumn

    return (
      <td
        className={`px-3 py-1 border-b border-gray-200 text-sm dark:border-gray-600 mx-auto ${
          canEdit ? 'cursor-pointer' : ''
        }`}
        onClick={canEdit ? handleCellClick : undefined}
        onMouseDown={canEdit ? undefined : (e) => e.preventDefault()}
        tabIndex={canEdit ? 0 : -1}
        aria-disabled={!canEdit}
        title={canEdit ? 'Click to edit' : undefined}
        style={column.width !== undefined ? { width: column.width } : undefined}
      >
        {displayContent}
      </td>
    )
  }

  return (
    <td className="px-4 py-2 whitespace-nowrap text-sm bg-blue-50 dark:bg-blue-700/20">
      {column.type === 'select' || column.type === 'multiselect' ? (
        <SearchableSelect
          options={availableOptions.map((opt) => ({
            value: opt.value as string | number,
            label: opt.label,
            badge: opt.badge,
          }))}
          value={currentCellValue as string | number | Array<string | number>}
          onChange={(newValue) => {
            commitEdit(rowId, column.key, newValue as T[keyof T], row)
          }}
          onBlur={() => setCurrentEdit(null)}
          multiple={Array.isArray(currentCellValue as unknown)}
          searchable={true}
          placeholder={
            isOptionsLoading
              ? 'Loading options...'
              : hasOptionsError
                ? 'Error loading options'
                : `Select ${column.label.toLowerCase()}...`
          }
          disabled={isOptionsLoading || hasOptionsError}
        />
      ) : availableOptions.length > 0 ? (
        <SearchableSelect
          options={availableOptions.map((opt) => ({
            value: opt.value as string | number,
            label: opt.label,
            badge: opt.badge,
          }))}
          value={currentCellValue as string | number | Array<string | number>}
          onChange={(newValue) => {
            let convertedValue: T[keyof T]
            if (Array.isArray(newValue)) {
              convertedValue = newValue as unknown as T[keyof T]
            } else if (typeof value === 'boolean') {
              convertedValue = (String(newValue) === 'true') as T[keyof T]
            } else {
              convertedValue = newValue as T[keyof T]
            }
            commitEdit(rowId, column.key, convertedValue, row)
          }}
          onBlur={() => setCurrentEdit(null)}
          multiple={Array.isArray(currentCellValue as unknown)}
          searchable={true}
          placeholder={
            isOptionsLoading
              ? 'Loading options...'
              : hasOptionsError
                ? 'Error loading options'
                : `Select ${column.label.toLowerCase()}...`
          }
          disabled={isOptionsLoading || hasOptionsError}
          className="w-full"
        />
      ) : column.type === 'textArea' ? (
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              cancelEdit()
            } else if (e.key === 'Enter' && e.ctrlKey) {
              handleCommit()
            }
          }}
          onBlur={handleInputBlur}
          className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[72px] resize-none bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-blue-800"
          placeholder="Enter multi-line text (Ctrl+Enter to save)"
          rows={3}
        />
      ) : (
        <input
          ref={inputRef}
          type={column.type === 'date' ? 'date' : 'text'}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value
            if (column.type === 'date') {
              if (isValidDateInput(newValue, 'yyyy-MM-dd')) {
                setInputValue(newValue)
              }
            } else {
              setInputValue(newValue)
            }
          }}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[36px] bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-blue-800"
          placeholder={undefined}
        />
      )}
    </td>
  )
}
