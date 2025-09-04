import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface WiseTableButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: ReactNode
  children: ReactNode
}

export const WiseTableButton = forwardRef<
  HTMLButtonElement,
  WiseTableButtonProps
>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 active:scale-95'

    const variantClasses = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500',
      secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:ring-blue-500 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700',
      danger:
        'bg-white text-red-700 border border-red-300 hover:bg-red-50 hover:border-red-400 hover:shadow-md focus:ring-red-500 shadow-sm dark:bg-gray-800 dark:text-red-400 dark:border-red-700/60 dark:hover:bg-gray-700',
      ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:shadow-sm focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
    }

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3 py-2 text-sm gap-2',
      lg: 'px-4 py-2.5 text-base gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    )
  },
)

WiseTableButton.displayName = 'WiseTableButton'
