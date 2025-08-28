import { useState } from 'react'
import type { DirtyRow } from '../hooks/useWiseTable'
import { WiseTableButton } from '../ui'
import { formatCellValue } from '../utils/formatCellValue'

interface UpdateSelectedModalProps<T> {
  isOpen: boolean
  dirtyRows: DirtyRow<T>[]
  validationErrors?: Array<{ itemId: string | number; errors: string[] }>
  onConfirm: (reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

export function UpdateSelectedModal<T>({
  isOpen,
  dirtyRows,
  validationErrors = [],
  onConfirm,
  onCancel,
  requireReason = false,
  idColumn,
}: UpdateSelectedModalProps<T>) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const hasChanges = dirtyRows.length > 0
  const hasValidationErrors = validationErrors.length > 0
  const canUpdate =
    hasChanges &&
    !hasValidationErrors &&
    (!requireReason || reason.trim().length > 0)

  const handleConfirm = () => {
    if (!hasChanges) {
      return // Don't allow update if no changes
    }
    if (requireReason && !reason.trim()) {
      alert('Please provide a reason for this update.')
      return
    }
    onConfirm(reason.trim() || undefined)
    setReason('')
  }

  const handleCancel = () => {
    onCancel()
    setReason('')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden dark:bg-gray-800 dark:text-gray-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Update Dirty Items
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {dirtyRows.length} dirty row{dirtyRows.length !== 1 ? 's' : ''}{' '}
              will be updated.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[80vh]">
            {/* Validation Errors */}
            {hasValidationErrors && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-red-900 mb-3 dark:text-red-300">
                  ❌ Validation Errors ({validationErrors.length} item
                  {validationErrors.length !== 1 ? 's' : ''})
                </h4>
                <div className="space-y-3">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className="border border-red-200 rounded-lg p-3 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="text-sm font-medium text-red-900 mb-2 dark:text-red-300">
                        ID: {formatCellValue(error.itemId)}
                      </div>
                      <div className="space-y-1">
                        {error.errors.map((errorMsg, errorIndex) => (
                          <div
                            key={errorIndex}
                            className="text-xs text-red-600 dark:text-red-400"
                          >
                            • {errorMsg}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changes Summary */}
            {dirtyRows.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 dark:text-gray-100">
                  📝 Unsaved Changes ({dirtyRows.length} row
                  {dirtyRows.length !== 1 ? 's' : ''})
                </h4>
                <div className="space-y-3">
                  {dirtyRows.map((dirtyRow, index) => (
                    <div
                      key={index}
                      className="border border-orange-200 rounded-lg p-3 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2 dark:text-gray-100">
                        {idColumn ? (
                          <>
                            ID:{' '}
                            {formatCellValue(dirtyRow.originalData[idColumn])}
                          </>
                        ) : (
                          <>Row #{dirtyRow.rowIndex + 1}</>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dirtyRow.changedFields.map((field) => (
                          <div
                            key={String(field)}
                            className="text-xs text-gray-600 dark:text-gray-300"
                          >
                            <span className="font-medium">
                              {String(field)}:
                            </span>{' '}
                            <span className="line-through text-red-600">
                              {formatCellValue(dirtyRow.originalData[field])}
                            </span>{' '}
                            →{' '}
                            <span className="text-green-600">
                              {formatCellValue(dirtyRow.modifiedData[field])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-gray-500 dark:text-gray-400">
                  No unsaved changes found
                </div>
                <div className="text-sm text-gray-400 mt-1 dark:text-gray-500">
                  This will update the selected items as-is
                </div>
              </div>
            )}

            {/* Reason Input */}
            {requireReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Update Reason{' '}
                  {requireReason && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for this update..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Dirty rows:</span>{' '}
                {dirtyRows.length}
                {hasValidationErrors && (
                  <span>
                    , <span className="font-medium text-red-600">Errors:</span>{' '}
                    <span className="text-red-600">
                      {validationErrors.length}
                    </span>
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {hasValidationErrors ? (
                  <span className="text-red-500">
                    ❌ Fix validation errors to continue
                  </span>
                ) : (
                  <span>⚠️ This action cannot be undone</span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <WiseTableButton
                variant="secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </WiseTableButton>
              <WiseTableButton
                variant="primary"
                type="button"
                onClick={handleConfirm}
                disabled={!canUpdate}
              >
                💾 Update {dirtyRows.length} Row
                {dirtyRows.length !== 1 ? 's' : ''}
                {!hasChanges && ' (No Changes)'}
                {hasValidationErrors && ' (Validation Errors)'}
                {hasChanges &&
                  !hasValidationErrors &&
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
