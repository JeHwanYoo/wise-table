import { useEffect, useState } from 'react'
import type { ZodType } from 'zod'
import { RenderContext } from '../contexts/RenderContext'
import type { WiseTableColumn } from '../index'
import { ConfirmModal } from '../ui/ConfirmModal'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../ui/SearchableSelect'
import { WiseTableButton } from '../ui/WiseTableButton'

interface CreateModalProps<T, TSchema extends ZodType> {
  isOpen: boolean
  columns: WiseTableColumn<T>[]
  schema: TSchema
  onConfirm: (items: T[]) => void
  onCancel: () => void
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
  onConfirm,
  onCancel,
  idColumn,
}: CreateModalProps<T, TSchema>) {
  const [formItems, setFormItems] = useState<FormItem<T>[]>([
    {
      id: crypto.randomUUID(),
      data: {},
      errors: {} as Record<keyof T, string>,
    },
  ])
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const columnOptionsMap = new Map<
    keyof T,
    {
      options: SearchableSelectOption[]
      isLoading: boolean
      hasError: boolean
    }
  >()

  columns.forEach((column) => {
    const queryResult = column.useColumnQuery?.()
    const originalOptions = queryResult?.options ?? column.options ?? []
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

  // Build default row data using useColumnQuery results
  const buildDefaultRowData = (): Partial<T> => {
    const next = {} as Partial<T>
    columns.forEach((column, idx) => {
      const res = columnValueResults[idx]
      if (res && res.data !== undefined) {
        ;(next as Record<string, unknown>)[column.key as string] =
          res.data as unknown
      }
    })
    return next
  }

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

  const editableColumns = columns.filter((col) => {
    const isHidden = col.type === 'hidden'
    const isReadonly = col.readonly === true
    const isIdField = idColumn ? col.key === idColumn : false
    return !(isHidden || isReadonly || isIdField)
  })

  const addNewItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        data: buildDefaultRowData(),
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
    // Validate on submit; reveal errors only now
    const { anyErrors, itemsWithErrors } = validateAll()
    setFormItems(itemsWithErrors)
    setHasInteracted(true)
    if (anyErrors) {
      return
    }
    // Open final confirmation modal; actual POST will be executed on confirm
    setIsConfirmOpen(true)
  }

  const handleCancel = () => {
    onCancel()
    setFormItems([
      {
        id: crypto.randomUUID(),
        data: buildDefaultRowData(),
        errors: {} as Record<keyof T, string>,
      },
    ])
    setHasInteracted(false)
  }

  if (!isOpen) return null

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 dark:bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-[80vw] w-full max-h:[90vh] overflow-hidden border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 sticky top-0 z-10 bg-white dark:bg-gray-800 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
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
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
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
            <div className="border border-gray-200 rounded-lg min-w-max dark:border-gray-700">
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
                            ? 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-100'
                            : ''
                        }
                      >
                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap ">
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
                              const baseClasses = `w-full px-2 py-1 h-[30px] text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
                                error
                                  ? 'border-red-400 focus:border-red-600 dark:border-red-700'
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
                                    <div className="text-sm text-gray-800 dark:text-gray-100">
                                      {matched
                                        ? matched.label
                                        : String(value ?? '')}
                                    </div>
                                  )
                                }
                                if (column.type === 'textArea') {
                                  return (
                                    <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                                      {String(value ?? '')}
                                    </div>
                                  )
                                }
                                return (
                                  <div className="text-sm text-gray-800 dark:text-gray-100">
                                    {String(value ?? '')}
                                  </div>
                                )
                              }

                              // Custom render for CreateModal editing cell (overrides defaults)
                              if (column.render) {
                                const allItemsData = formItems.map(
                                  (formItem) => formItem.data as T,
                                )
                                const renderContextValue = {
                                  rowId: item.id,
                                  columnKey: column.key,
                                  originalRow: (item.data as T) ?? ({} as T),
                                  rowIndex: idx,
                                  updateFunction: (value: unknown) =>
                                    updateItemField(
                                      item.id,
                                      column.key,
                                      value as T[keyof T],
                                    ),
                                }

                                const custom = (
                                  <RenderContext.Provider
                                    value={renderContextValue}
                                  >
                                    {column.render(
                                      value as T[keyof T],
                                      (item.data as T) ?? ({} as T),
                                      allItemsData,
                                      idx,
                                    )}
                                  </RenderContext.Provider>
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
                                              const allItemsData =
                                                formItems.map(
                                                  (formItem) =>
                                                    formItem.data as T,
                                                )
                                              return (
                                                column.render?.(
                                                  opt.value as T[keyof T],
                                                  (item.data as T) ?? ({} as T),
                                                  allItemsData,
                                                  idx,
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
                                column.type === 'number'
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
                                      if (column.type === 'number') {
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

            {/* Reason input removed by design */}
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
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {hasInteracted && totalErrors > 0 ? (
                  <span className="text-red-500">
                    ❌ Fix validation errors to continue
                  </span>
                ) : null}
              </div>
            </div>
            {hasInteracted && totalErrors > 0 && (
              <div className="mb-3 max-h-28 overflow-auto rounded-md border border-red-300 bg-red-100 p-3 dark:border-red-700 dark:bg-red-800/30">
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
                disabled={hasInteracted && totalErrors > 0}
                variant={
                  !hasInteracted || totalErrors === 0 ? 'primary' : 'secondary'
                }
              >
                ✨ Create {formItems.length} Item
                {formItems.length !== 1 ? 's' : ''}
                {hasInteracted && totalErrors > 0 && ' (Validation Errors)'}
              </WiseTableButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {modal}
      {/* Final confirmation modal before creating */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Create Items"
        message={`Create ${formItems.length} item${formItems.length !== 1 ? 's' : ''}?`}
        confirmText="Create"
        cancelText="Cancel"
        variant="info"
        requireReason={false}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          const validItems = formItems.map((item) => item.data as T)
          onConfirm(validItems)
          // Reset form after submission
          setFormItems([
            {
              id: crypto.randomUUID(),
              data: buildDefaultRowData(),
              errors: {} as Record<keyof T, string>,
            },
          ])
          setHasInteracted(false)
          setIsConfirmOpen(false)
        }}
      />
    </>
  )
}
