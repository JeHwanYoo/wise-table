export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={`wise-table ${className || ''}`}>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Loading...
        </span>
      </div>
    </div>
  )
}
