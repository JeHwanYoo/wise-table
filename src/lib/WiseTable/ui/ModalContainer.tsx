import type { ReactNode } from 'react'

export interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  maxHeight?: string
  children: ReactNode
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
}

export function ModalContainer({
  isOpen,
  onClose,
  maxWidth = 'md',
  maxHeight = '90vh',
  children,
  className = '',
}: ModalContainerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[${maxHeight}] overflow-hidden ${className} dark:bg-gray-800 dark:text-gray-100`}
          style={{ maxHeight }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
