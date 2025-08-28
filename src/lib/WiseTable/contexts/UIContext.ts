import { createContext } from 'react'

export interface UIContextValue {
  tableHeight?: string
  className?: string
  showCreateModal: boolean
  showUpdateModal: boolean
  showDeleteModal: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  openUpdateModal: () => void
  closeUpdateModal: () => void
  openDeleteModal: () => void
  closeDeleteModal: () => void
  isCompact: boolean
  setCompact: (compact: boolean) => void
}

export const UIContext = createContext<UIContextValue | null>(null)
