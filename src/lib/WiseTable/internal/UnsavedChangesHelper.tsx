import React from 'react'
import { useEditingContext } from '../hooks/useWiseTable'
import { WiseTableButton } from '../ui'

export interface UnsavedChangesHelperProps {
  className?: string
}

/**
 * Helper component that displays unsaved changes warning and discard button
 * Separated from FilterBar to maintain single responsibility principle
 */
export const UnsavedChangesHelper = React.memo(function UnsavedChangesHelper({
  className = '',
}: UnsavedChangesHelperProps) {
  const { hasUnsavedChanges, discardChanges } = useEditingContext()

  if (!hasUnsavedChanges()) return null

  return (
    <div
      className={`p-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800 ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-800 dark:bg-yellow-700/20 dark:border-yellow-600 dark:text-yellow-300">
        <svg
          className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="font-medium">You have unsaved changes</span>
        <WiseTableButton
          onClick={discardChanges}
          size="sm"
          variant="secondary"
          className="ml-auto"
        >
          Discard Changes
        </WiseTableButton>
      </div>
    </div>
  )
})
