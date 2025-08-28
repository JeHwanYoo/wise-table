export interface ErrorStateProps {
  error: Error
  className?: string
}

export function ErrorState({ error, className }: ErrorStateProps) {
  return (
    <div className={`wise-table ${className || ''}`}>
      <div className="flex items-center justify-center py-12 text-red-600 dark:text-red-400">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-medium">Error loading data</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {error.message}
          </div>
        </div>
      </div>
    </div>
  )
}
