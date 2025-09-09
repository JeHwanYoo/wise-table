import { useState } from 'react'
import { ConfirmModal, WiseTableButton } from '../ui'
import { formatCellValue } from '../utils/formatCellValue'

interface DeleteSelectedModalProps<T> {
  isOpen: boolean
  selectedItems: T[]
  onConfirm: (reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

export function DeleteSelectedModal<T>({
  isOpen,
  selectedItems,
  onConfirm,
  onCancel,
  requireReason = false,
  idColumn,
}: DeleteSelectedModalProps<T>) {
  const [reason, setReason] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (!isOpen) return null

  const canDelete = selectedItems.length > 0

  const handleConfirm = () => {
    if (!canDelete) return

    // Open final confirmation modal; actual deletion will be executed on confirm
    setIsConfirmOpen(true)
  }

  const handleCancel = () => {
    onCancel()
    setReason('')
  }

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden dark:bg-gray-800 dark:text-gray-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{' '}
              selected for deletion.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[80vh]">
            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-700/20 dark:border-red-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Are you sure you want to delete {selectedItems.length}{' '}
                    selected item{selectedItems.length !== 1 ? 's' : ''}? All
                    data associated with{' '}
                    {selectedItems.length === 1 ? 'this item' : 'these items'}{' '}
                    will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Items Preview */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3 dark:text-gray-100">
                🗑️ Items to Delete ({selectedItems.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedItems.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded dark:bg-red-700/20 dark:border-red-600"
                  >
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      {idColumn ? (
                        <>
                          ID:{' '}
                          {formatCellValue(
                            (item as Record<string, unknown>)[
                              idColumn as string
                            ],
                          )}
                        </>
                      ) : (
                        <>Item #{index + 1}</>
                      )}
                    </span>
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ))}
                {selectedItems.length > 10 && (
                  <div className="text-xs text-gray-500 text-center py-2 dark:text-gray-300">
                    ... and {selectedItems.length - 10} more items
                  </div>
                )}
              </div>
            </div>

            {/* Reason Input */}
            {requireReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Deletion Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for deleting these items..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-400"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Selected:</span>{' '}
                {selectedItems.length} item
                {selectedItems.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-red-500">
                ⚠️ This action cannot be undone
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
                variant="danger"
                type="button"
                onClick={handleConfirm}
                disabled={!canDelete}
              >
                🗑️ Delete {selectedItems.length} Item
                {selectedItems.length !== 1 ? 's' : ''}
                {requireReason && !reason.trim() && ' (Reason Required)'}
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
      {/* Final confirmation modal before deleting */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Items"
        message={`Delete ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        requireReason={false}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onConfirm(requireReason ? reason : reason.trim() || undefined)
          setReason('')
          setIsConfirmOpen(false)
        }}
      />
    </>
  )
}
