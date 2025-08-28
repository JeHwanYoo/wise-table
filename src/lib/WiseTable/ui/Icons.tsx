import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export const PlusIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
)

export const SaveIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
)

export const DeleteIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

export const SearchIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
    />
  </svg>
)

export const ChevronDownIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
)

export const CloseIcon = ({
  size = 'md',
  className = '',
  ...props
}: IconProps) => (
  <svg
    className={`${sizeClasses[size]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
)
