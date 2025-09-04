import type { ReactNode } from 'react'
import { useCRUDActions, useWiseTable } from '../hooks/useWiseTable'
import { DeleteIcon, PlusIcon, SaveIcon, WiseTableButton } from '../ui'

export interface TableActionButton {
  /** Button text */
  text: string
  /** Button icon */
  icon?: ReactNode
  /** Button title (tooltip) */
  title?: string
  /** Custom click handler - if not provided, uses default */
  onClick?: () => void
  /** Custom disabled condition - if not provided, uses default */
  disabled?: boolean | (() => boolean)
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Hide this button completely */
  hidden?: boolean | (() => boolean)
}

export interface TableActionsProps {
  /** Create button configuration */
  createButton?: Partial<TableActionButton>
  /** Save button configuration */
  saveButton?: Partial<TableActionButton>
  /** Delete button configuration */
  deleteButton?: Partial<TableActionButton>
  /** Additional custom buttons */
  customButtons?: TableActionButton[]
  /** Custom right side content */
  rightContent?: ReactNode
  /** Custom wrapper className */
  className?: string
}

/**
 * Default table actions component with create, save, and delete functionality
 *
 * Users can customize button texts, icons, and handlers, or provide completely custom implementation
 */
export function TableActions({
  createButton,
  saveButton,
  deleteButton,
  customButtons = [],
  rightContent,
  className = '',
}: TableActionsProps = {}) {
  const {
    onCreateModal,
    onUpdateSelected,
    onDeleteSelected,
    selectedRows,
    hasUnsavedChanges,
    dirtyRows,
  } = useWiseTable()

  // Detect which mutations are available; render buttons only when provided
  const crudActions = useCRUDActions()
  const hasCreate = Boolean(crudActions.useCreateMutation)
  const hasUpdate = Boolean(crudActions.useUpdateMutation)
  const hasDelete = Boolean(crudActions.useDeleteMutation)

  // Default create button config
  const defaultCreateButton: TableActionButton = {
    text: 'New Item',
    icon: <PlusIcon />,
    title: 'Create new item',
    onClick: onCreateModal,
    disabled: () => hasUnsavedChanges(),
    variant: 'primary',
    size: 'md',
  }

  // Default save button config
  const defaultSaveButton: TableActionButton = {
    text: `Save Changes`,
    icon: <SaveIcon />,
    title: 'Save changes',
    onClick: () => onUpdateSelected?.(),
    disabled: () => !hasUnsavedChanges(),
    variant: 'secondary',
    size: 'md',
  }

  // Default delete button config
  const defaultDeleteButton: TableActionButton = {
    text: 'Delete Selected',
    icon: <DeleteIcon />,
    title: 'Delete selected items',
    onClick: () => onDeleteSelected?.(),
    disabled: () => selectedRows.length === 0,
    variant: 'danger',
    size: 'md',
  }

  // Merge configs
  const finalCreateButton = { ...defaultCreateButton, ...createButton }
  const finalSaveButton = { ...defaultSaveButton, ...saveButton }
  const finalDeleteButton = { ...defaultDeleteButton, ...deleteButton }

  // Helper to check if button should be hidden
  const isHidden = (hidden?: boolean | (() => boolean)) => {
    if (typeof hidden === 'function') return hidden()
    return hidden === true
  }

  // Helper to check if button should be disabled
  const isDisabled = (disabled?: boolean | (() => boolean)) => {
    if (typeof disabled === 'function') return disabled()
    return disabled === true
  }

  // Dynamic save button text with dirty count
  const saveButtonText = hasUnsavedChanges()
    ? `${finalSaveButton.text} (${dirtyRows.size})`
    : finalSaveButton.text

  // Dynamic delete button text with selected count
  const deleteButtonText =
    selectedRows.length > 0
      ? `${finalDeleteButton.text} (${selectedRows.length})`
      : finalDeleteButton.text

  // Dynamic delete button title
  const deleteButtonTitle =
    selectedRows.length === 0
      ? 'Select items to delete'
      : `Delete ${selectedRows.length} selected item${selectedRows.length !== 1 ? 's' : ''}`

  return (
    <div
      className={`bg-white border-b border-gray-200 px-6 py-3 dark:bg-gray-800 dark:border-gray-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Create Button (render only if create mutation exists) */}
        {hasCreate && !isHidden(finalCreateButton.hidden) && (
          <WiseTableButton
            variant={finalCreateButton.variant}
            size={finalCreateButton.size}
            disabled={isDisabled(finalCreateButton.disabled)}
            onClick={finalCreateButton.onClick}
            title={finalCreateButton.title}
            icon={finalCreateButton.icon}
          >
            {finalCreateButton.text}
          </WiseTableButton>
        )}

        {/* Save Button (render only if update mutation exists) */}
        {hasUpdate && !isHidden(finalSaveButton.hidden) && (
          <WiseTableButton
            variant={finalSaveButton.variant}
            size={finalSaveButton.size}
            disabled={isDisabled(finalSaveButton.disabled)}
            onClick={finalSaveButton.onClick}
            title={finalSaveButton.title}
            icon={finalSaveButton.icon}
          >
            {saveButtonText}
          </WiseTableButton>
        )}

        {/* Delete Button (render only if delete mutation exists) */}
        {hasDelete && !isHidden(finalDeleteButton.hidden) && (
          <WiseTableButton
            variant={finalDeleteButton.variant}
            size={finalDeleteButton.size}
            disabled={isDisabled(finalDeleteButton.disabled)}
            onClick={finalDeleteButton.onClick}
            title={deleteButtonTitle}
            icon={finalDeleteButton.icon}
          >
            {deleteButtonText}
          </WiseTableButton>
        )}

        {/* Custom Buttons */}
        {customButtons.map(
          (button, index) =>
            !isHidden(button.hidden) && (
              <WiseTableButton
                key={index}
                variant={button.variant || 'secondary'}
                size={button.size || 'md'}
                disabled={isDisabled(button.disabled)}
                onClick={button.onClick}
                title={button.title}
                icon={button.icon}
              >
                {button.text}
              </WiseTableButton>
            ),
        )}

        <div className="flex-1" />

        {/* Right Content */}
        {rightContent || (
          <div className="text-xs text-gray-500 dark:text-gray-300">
            Wise Table
          </div>
        )}
      </div>
    </div>
  )
}
