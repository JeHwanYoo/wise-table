import React, { useMemo, useState } from 'react'
import { UIContext, type UIContextValue } from '../contexts/UIContext'

interface UIProviderProps {
  children: React.ReactNode
  tableHeight?: string
  className?: string
  defaultCompact?: boolean
}

export function UIProvider({
  children,
  tableHeight,
  className,
  defaultCompact = false,
}: UIProviderProps) {
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Other UI state
  const [isCompact, setCompact] = useState(defaultCompact)

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)
  const openUpdateModal = () => setShowUpdateModal(true)
  const closeUpdateModal = () => setShowUpdateModal(false)
  const openDeleteModal = () => setShowDeleteModal(true)
  const closeDeleteModal = () => setShowDeleteModal(false)

  const value = useMemo(
    (): UIContextValue => ({
      tableHeight,
      className,
      showCreateModal,
      showUpdateModal,
      showDeleteModal,
      openCreateModal,
      closeCreateModal,
      openUpdateModal,
      closeUpdateModal,
      openDeleteModal,
      closeDeleteModal,
      isCompact,
      setCompact,
    }),
    [
      tableHeight,
      className,
      showCreateModal,
      showUpdateModal,
      showDeleteModal,
      isCompact,
    ],
  )

  return React.createElement(UIContext.Provider, { value }, children)
}
