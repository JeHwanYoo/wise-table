// Type definitions for component interfaces
import type { ZodType } from 'zod'
import type { DirtyRow } from '../hooks/useWiseTable'
import type { WiseTableColumn } from '../internal/WiseTableCore'

// Modal Component Interfaces
export interface ConfirmModalComponent {
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

export interface CreateModalComponent<T, TSchema extends ZodType = ZodType> {
  isOpen: boolean
  columns: WiseTableColumn<T>[]
  schema: TSchema
  defaultValues?: Partial<T>
  onConfirm: (items: T[], reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

export interface UpdateSelectedModalComponent<T> {
  isOpen: boolean
  dirtyRows: DirtyRow<T>[]
  validationErrors?: Array<{ itemId: string | number; errors: string[] }>
  onConfirm: (reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

export interface DeleteSelectedModalComponent<T> {
  isOpen: boolean
  selectedItems: T[]
  onConfirm: (reason?: string) => void
  onCancel: () => void
  requireReason?: boolean
  idColumn?: keyof T
}

// UI Component Interfaces
export interface FilterBarComponent {
  className?: string
}

export interface LoadingSpinnerComponent {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  overlay?: boolean
  className?: string
}

export interface ErrorStateComponent {
  error: Error
  className?: string
}

export interface SearchBoxComponent {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Component interfaces for type safety and customization props

// Props for customizing default components
export interface DefaultComponentProps {
  // Modal customizations (Note: confirmModal moved to ui/)
  createModal?: {
    title?: string
    addRowText?: string
    createText?: string
  }
  updateModal?: {
    title?: string
    updateText?: string
  }
  deleteModal?: {
    title?: string
    deleteText?: string
  }

  // UI customizations
  filterBar?: Partial<Pick<FilterBarComponent, 'className'>>
  loadingSpinner?: Partial<Pick<LoadingSpinnerComponent, 'message' | 'size'>>
  errorState?: Partial<Pick<ErrorStateComponent, 'className'>>
  searchBox?: Partial<Pick<SearchBoxComponent, 'placeholder' | 'className'>>
}
