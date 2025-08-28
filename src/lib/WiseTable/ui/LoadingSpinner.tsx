import React from 'react'

export interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  overlay?: boolean
  className?: string
}

export const LoadingSpinner = React.memo(function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  overlay = false,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const spinner = (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {message}
      </span>
    </div>
  )

  if (overlay) {
    return (
      <div
        className={`absolute inset-0 bg-white/50 dark:bg-black/40 flex items-center justify-center z-50 ${className}`}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
          {spinner}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinner}
    </div>
  )
})
