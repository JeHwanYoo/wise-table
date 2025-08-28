import { useState } from 'react'
import { ModalContainer } from './ModalContainer'
import { WiseTableButton } from './WiseTableButton'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: (reason?: string) => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
  requireReason?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
  requireReason = false,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      alert('Please provide a reason.')
      return
    }
    onConfirm(reason.trim() || undefined)
    setReason('')
  }

  const handleCancel = () => {
    onCancel()
    setReason('')
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton:
            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        }
      default:
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <ModalContainer isOpen={isOpen} onClose={handleCancel} maxWidth="md">
      {/* Content */}
      <div className="px-6 py-4">
        <div className="flex items-start">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-4 dark:bg-opacity-20`}
          >
            <span className={`text-lg ${styles.iconColor} dark:text-current`}>
              {styles.icon}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 mb-2 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
              {message}
            </p>

            {/* Reason Input */}
            {requireReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Reason{' '}
                  {requireReason && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 dark:border-gray-800">
        <WiseTableButton variant="secondary" onClick={handleCancel}>
          {cancelText}
        </WiseTableButton>
        <WiseTableButton
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmText}
        </WiseTableButton>
      </div>
    </ModalContainer>
  )
}
