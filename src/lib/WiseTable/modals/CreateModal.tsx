import { useEffect, useRef, useState } from 'react'
import type { ZodType } from 'zod'
import type { WiseTableColumn } from '../index'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../ui/SearchableSelect'
import { WiseTableButton } from '../ui/WiseTableButton'

interface CreateModalProps<T, TSchema extends ZodType> {
  isOpen: boolean
  columns: WiseTableColumn<T>[]
  schema: TSchema
  defaultValues?: Partial<T>
  onConfirm: (items: T[], reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

interface FormItem<T> {
  id: string
  data: Partial<T>
  errors: Record<keyof T, string>
}

export function CreateModal<T, TSchema extends ZodType>({
  isOpen,
  columns,
  schema,
  defaultValues = {},
  onConfirm,
  onCancel,
  requireReason = false,
  idColumn,
}: CreateModalProps<T, TSchema>) {
  const [reason, setReason] = useState('')
  const [formItems, setFormItems] = useState<FormItem<T>[]>([
    {
      id: crypto.randomUUID(),
      data: { ...defaultValues },
      errors: {} as Record<keyof T, string>,
    },
  ])
  const [hasInteracted, setHasInteracted] = useState(false)
  const cellStoreRef = useRef<Record<string, unknown>>({})

  // Call useSelectQuery for all columns that have it to respect Rules of Hooks
  const columnOptionsMap = new Map<
    keyof T,
    {
      options: SearchableSelectOption[]
      isLoading: boolean
      hasError: boolean
    }
  >()

  columns.forEach((column) => {
    const queryResult = column.useSelectQuery?.()
    const originalOptions = queryResult?.data ?? column.options ?? []
    const isLoading = queryResult?.isLoading ?? false
    const hasError = queryResult?.isError ?? false

    // Convert to SearchableSelectOption format
    const options: SearchableSelectOption[] = originalOptions.map((opt) => ({
      value: opt.value as string | number,
      label: opt.label,
      // If a custom render is provided for this column, do not surface badges in CreateModal
      badge: column.render ? undefined : opt.badge,
    }))

    columnOptionsMap.set(column.key, { options, isLoading, hasError })
  })

  // Collect column value results via hooks (stable order)
  const columnValueResults = columns.map((column) => column.useColumnQuery?.())

  // Apply initial defaults after render to avoid setState during render
  const defaultsSignature = JSON.stringify(
    columnValueResults.map((r) => r?.data ?? null),
  )
  useEffect(() => {
    setFormItems((prev) => {
      if (prev.length === 0) return prev
      const first = prev[0]
      let updated = false
      const nextData = { ...first.data }
      columns.forEach((column, idx) => {
        const res = columnValueResults[idx]
        if (
          res &&
          res.data !== undefined &&
          nextData[column.key] === undefined
        ) {
          ;(nextData as Record<string, unknown>)[column.key as string] =
            res.data as unknown
          updated = true
        }
      })
      if (!updated) return prev
      const nextFirst: FormItem<T> = { ...first, data: nextData }
      return [nextFirst, ...prev.slice(1)]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsSignature])

  // Check if field is required using Zod's official safeParse method
  const isFieldRequired = (fieldName: keyof T): boolean => {
    // Test with empty object to see which fields are required
    const emptyResult = schema.safeParse({})

    if (emptyResult.success) {
      return false // All fields are optional if empty object succeeds
    }

    // Simply check if this field appears in the validation errors
    return emptyResult.error.issues.some(
      (issue) => issue.path.length > 0 && issue.path[0] === fieldName,
    )
  }

  const editableColumns = columns.filter(
    (col) =>
      col.type !== 'hidden' &&
      col.editable !== false &&
      col.autoGenerate !== true &&
      col.key !== (idColumn || 'id'),
  )

  const addNewItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        data: { ...defaultValues },
        errors: {} as Record<keyof T, string>,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (formItems.length > 1) {
      setFormItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const updateItemField = (id: string, field: keyof T, value: T[keyof T]) => {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const nextData = { ...item.data, [field]: value }
        if (!hasInteracted) {
          // Before first Create click: just update data, keep errors empty/hidden
          return { ...item, data: nextData, errors: item.errors }
        }
        // After first Create click: re-validate this row to help user fix
        const result = schema.safeParse(nextData)
        if (result.success) {
          return {
            ...item,
            data: nextData,
            errors: {} as Record<keyof T, string>,
          }
        }
        const fieldErrors = {} as Record<keyof T, string>
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const key = issue.path[0] as keyof T
            fieldErrors[key] = issue.message
          }
        })
        return { ...item, data: nextData, errors: fieldErrors }
      }),
    )
  }

  const validateAll = () => {
    let anyErrors = false
    const itemsWithErrors = formItems.map((item) => {
      const result = schema.safeParse(item.data)
      if (result.success) {
        return { ...item, errors: {} as Record<keyof T, string> }
      }
      anyErrors = true
      const fieldErrors = {} as Record<keyof T, string>
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const key = issue.path[0] as keyof T
          fieldErrors[key] = issue.message
        }
      })
      return { ...item, errors: fieldErrors }
    })
    return { anyErrors, itemsWithErrors }
  }

  const totalErrors = formItems.reduce(
    (count, item) => count + Object.keys(item.errors).length,
    0,
  )

  const getColumnLabel = (key: keyof T): string => {
    const col = columns.find((c) => c.key === key)
    return col ? col.label : String(key)
  }

  const aggregatedErrors = formItems.flatMap((item, idx) =>
    Object.entries(item.errors).map(([k, message]) => ({
      rowIndex: idx + 1,
      fieldKey: k as keyof T,
      fieldLabel: getColumnLabel(k as keyof T),
      message: message as string,
    })),
  )

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      alert('Please provide a reason for creating these items.')
      return
    }

    // Validate on submit; reveal errors only now
    const { anyErrors, itemsWithErrors } = validateAll()
    setFormItems(itemsWithErrors)
    setHasInteracted(true)
    if (anyErrors) {
      return
    }

    const validItems = formItems.map((item) => item.data as T)
    onConfirm(validItems, reason.trim() || undefined)

    // Reset form
    setFormItems([
      {
        id: crypto.randomUUID(),
        data: { ...defaultValues },
        errors: {} as Record<keyof T, string>,
      },
    ])
    setReason('')
    setHasInteracted(false)
  }

  const handleCancel = () => {
    onCancel()
    setFormItems([
      {
        id: crypto.randomUUID(),
        data: { ...defaultValues },
        errors: {} as Record<keyof T, string>,
      },
    ])
    setReason('')
    setHasInteracted(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h:[90vh] overflow-hidden dark:bg-gray-800 dark:text-gray-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 sticky top-0 z-10 bg-white/80 backdrop-blur supports-backdrop-blur:bg-white dark:bg-gray-800/80 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Create New Items
              </h3>
              <WiseTableButton
                type="button"
                onClick={addNewItem}
                size="sm"
                variant="secondary"
              >
                + Add New Row
              </WiseTableButton>
            </div>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Creating {formItems.length} item
              {formItems.length !== 1 ? 's' : ''}
              {hasInteracted && totalErrors > 0 && (
                <span className="text-red-600 ml-2">
                  ({totalErrors} validation error{totalErrors !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-x-auto overflow-y-auto max-h-[60vh]">
            <div className="border border-gray-300 rounded-lg min-w-max dark:border-gray-700">
              <table className="min-w-max">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap dark:text-gray-300">
                      Row
                    </th>
                    {editableColumns.map((column) => (
                      <th
                        key={String(column.key)}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap dark:text-gray-300"
                      >
                        {column.label}
                        {isFieldRequired(column.key) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </th>
                    ))}
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-800">
                  {formItems.map((item, idx) => {
                    const hasRowErrors = Object.keys(item.errors).length > 0
                    return (
                      <tr
                        key={item.id}
                        className={
                          hasInteracted && hasRowErrors
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : ''
                        }
                      >
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap ">
                          {idx + 1}
                        </td>
                        {editableColumns.map((column) => (
                          <td
                            key={String(column.key)}
                            className="px-3 py-2 whitespace-nowrap align-top"
                          >
                            {/* cell input without label */}
                            {(() => {
                              const value = item.data[column.key]
                              const error = item.errors[column.key]
                              const isReadOnly = column.readonly === true
                              const baseClasses = `w-full px-2 py-1 h-[30px] text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 ${
                                error
                                  ? 'border-red-300 focus:border-red-500 dark:border-red-800'
                                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-700'
                              }`

                              const columnOptions = columnOptionsMap.get(
                                column.key,
                              )
                              const availableOptions =
                                columnOptions?.options || []
                              const isOptionsLoading =
                                columnOptions?.isLoading || false
                              const hasOptionsError =
                                columnOptions?.hasError || false

                              // Hidden fields: do not render UI, keep value only
                              if (column.type === 'hidden') {
                                return null
                              }

                              // Render non-editable display for readonly columns
                              if (isReadOnly) {
                                if (availableOptions.length > 0) {
                                  const matched = availableOptions.find(
                                    (opt) =>
                                      String(opt.value) === String(value),
                                  )
                                  return (
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                      {matched
                                        ? matched.label
                                        : String(value ?? '')}
                                    </div>
                                  )
                                }
                                if (column.type === 'textArea') {
                                  return (
                                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                      {String(value ?? '')}
                                    </div>
                                  )
                                }
                                return (
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {String(value ?? '')}
                                  </div>
                                )
                              }

                              // Custom render for CreateModal editing cell (overrides defaults)
                              if (column.render) {
                                const wrapper = (
                                  content?: React.ReactNode,
                                  className?: string,
                                ) => {
                                  const c = content ?? null
                                  return className ? (
                                    <span className={className}>{c}</span>
                                  ) : (
                                    c
                                  )
                                }
                                const setValue = (next: T[keyof T]) =>
                                  updateItemField(item.id, column.key, next)
                                const storeKey = `${item.id}:${String(column.key)}`
                                const setStore = (key: string, v: unknown) => {
                                  cellStoreRef.current[`${storeKey}:${key}`] = v
                                }
                                const getStoreValue = (key: string) =>
                                  cellStoreRef.current[`${storeKey}:${key}`]
                                const custom = column.render(
                                  value as T[keyof T],
                                  (item.data as T) ?? ({} as T),
                                  wrapper,
                                  setValue,
                                  setStore,
                                  getStoreValue,
                                )
                                if (custom !== undefined && custom !== null) {
                                  return <>{custom}</>
                                }
                              }

                              if (availableOptions.length > 0) {
                                return (
                                  <div>
                                    <SearchableSelect
                                      options={availableOptions}
                                      value={
                                        value as
                                          | string
                                          | number
                                          | Array<string | number>
                                      }
                                      onChange={(newValue) => {
                                        let converted: T[keyof T]
                                        if (Array.isArray(newValue)) {
                                          converted =
                                            newValue as unknown as T[keyof T]
                                        } else if (
                                          typeof availableOptions[0]?.value ===
                                          'boolean'
                                        ) {
                                          converted = (String(newValue) ===
                                            'true') as T[keyof T]
                                        } else {
                                          converted =
                                            newValue as unknown as T[keyof T]
                                        }
                                        updateItemField(
                                          item.id,
                                          column.key,
                                          converted,
                                        )
                                      }}
                                      multiple={column.type === 'multiselect'}
                                      searchable={true}
                                      useBadge={!column.render}
                                      renderOption={
                                        column.render
                                          ? (opt) => {
                                              const setValue = (
                                                next: T[keyof T],
                                              ) =>
                                                updateItemField(
                                                  item.id,
                                                  column.key,
                                                  next,
                                                )
                                              return (
                                                column.render?.(
                                                  opt.value as T[keyof T],
                                                  (item.data as T) ?? ({} as T),
                                                  (content?: React.ReactNode) =>
                                                    content ?? null,
                                                  setValue,
                                                ) ?? opt.label
                                              )
                                            }
                                          : undefined
                                      }
                                      placeholder={
                                        isOptionsLoading
                                          ? 'Loading options...'
                                          : hasOptionsError
                                            ? 'Error loading options'
                                            : `Select ${column.label}`
                                      }
                                      disabled={
                                        isOptionsLoading ||
                                        hasOptionsError ||
                                        isReadOnly
                                      }
                                      className="w-full [&>div]:min-h-[28px] [&>div]:py-1 [&>div]:px-2 [&_span.inline-flex]:!bg-transparent [&_span.inline-flex]:!text-gray-900 dark:[&_span.inline-flex]:!text-gray-100 [&_span.inline-flex]:!px-0 [&_span.inline-flex]:!py-0 [&_span.inline-flex]:!rounded-none [&_span.inline-flex]:!font-normal"
                                    />
                                  </div>
                                )
                              }
                              if (column.type === 'textArea') {
                                return (
                                  <div>
                                    <textarea
                                      value={String(value || '')}
                                      onChange={(e) =>
                                        updateItemField(
                                          item.id,
                                          column.key,
                                          e.target.value as T[keyof T],
                                        )
                                      }
                                      className={`${baseClasses} resize-none min-h-[30px] max-h-[30px] overflow-hidden focus:min-h-[72px] focus:max-h-[200px] focus:overflow-auto`}
                                      readOnly={isReadOnly}
                                      disabled={isReadOnly}
                                      rows={1}
                                      placeholder={`Enter ${column.label.toLowerCase()}...`}
                                    />
                                  </div>
                                )
                              }
                              const inputType =
                                column.type === 'number' ||
                                column.type === 'currency'
                                  ? 'number'
                                  : column.type === 'date'
                                    ? 'date'
                                    : 'text'
                              return (
                                <div>
                                  <input
                                    type={inputType}
                                    value={String(value || '')}
                                    onChange={(e) => {
                                      let convertedValue: T[keyof T]
                                      if (
                                        column.type === 'number' ||
                                        column.type === 'currency'
                                      ) {
                                        const inputValue = e.target.value.trim()
                                        if (inputValue === '') {
                                          convertedValue =
                                            undefined as T[keyof T]
                                        } else {
                                          const numValue =
                                            parseFloat(inputValue)
                                          convertedValue = (
                                            isNaN(numValue)
                                              ? undefined
                                              : numValue
                                          ) as T[keyof T]
                                        }
                                      } else {
                                        convertedValue = e.target
                                          .value as T[keyof T]
                                      }
                                      updateItemField(
                                        item.id,
                                        column.key,
                                        convertedValue,
                                      )
                                    }}
                                    readOnly={isReadOnly}
                                    disabled={isReadOnly}
                                    className={baseClasses}
                                    placeholder={`Enter ${column.label.toLowerCase()}...`}
                                  />
                                </div>
                              )
                            })()}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center align-top">
                          {formItems.length > 1 && (
                            <WiseTableButton
                              type="button"
                              size="xs"
                              variant="danger"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </WiseTableButton>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Reason Input */}
            {requireReason && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creation Reason{' '}
                  {requireReason && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for creating these items..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Items to create:</span>{' '}
                {formItems.length}
                {hasInteracted && totalErrors > 0 && (
                  <span className="text-red-600 ml-2">
                    • <span className="font-medium">Errors:</span> {totalErrors}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {hasInteracted && totalErrors > 0 ? (
                  <span className="text-red-500">
                    ❌ Fix validation errors to continue
                  </span>
                ) : null}
              </div>
            </div>
            {hasInteracted && totalErrors > 0 && (
              <div className="mb-3 max-h-28 overflow-auto rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <ul className="text-xs text-red-700 space-y-1 dark:text-red-300">
                  {aggregatedErrors.map((err, i) => (
                    <li key={`${err.rowIndex}-${String(err.fieldKey)}-${i}`}>
                      Row {err.rowIndex} • {err.fieldLabel}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <WiseTableButton
                type="button"
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel
              </WiseTableButton>
              <WiseTableButton
                type="button"
                onClick={handleConfirm}
                disabled={
                  (hasInteracted && totalErrors > 0) ||
                  (requireReason && !reason.trim())
                }
                variant={
                  (!hasInteracted || totalErrors === 0) &&
                  (!requireReason || reason.trim())
                    ? 'primary'
                    : 'secondary'
                }
              >
                ✨ Create {formItems.length} Item
                {formItems.length !== 1 ? 's' : ''}
                {hasInteracted && totalErrors > 0 && ' (Validation Errors)'}
                {!hasInteracted &&
                  requireReason &&
                  !reason.trim() &&
                  ' (Reason Required)'}
                {hasInteracted &&
                  totalErrors === 0 &&
                  requireReason &&
                  !reason.trim() &&
                  ' (Reason Required)'}
              </WiseTableButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
