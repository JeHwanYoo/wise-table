import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import type { ZodType, infer as zInfer } from 'zod'

// Update payload type for bulk updates with changed columns
export interface UpdateItemsPayload<T> {
  items: Array<{ data: Partial<T>; changedColumns: (keyof T)[] }>
  reason?: string
}

// Delete payload type for bulk deletions
export interface DeleteItemsPayload<T> {
  items: T[]
  reason?: string
}

// Single cell editing state
export interface EditingState<T> {
  rowIndex: number
  columnKey: keyof T
  oldValue: T[keyof T]
  newValue: T[keyof T]
}

// Dirty row information (unsaved changes)
export interface DirtyRow<T> {
  rowIndex: number
  originalData: T
  modifiedData: T
  changedFields: (keyof T)[]
}

// Common query parameters type for external use
export interface QueryParams<TFilters = Record<string, unknown>> {
  page: number
  limit: number
  filters?: TFilters
  search?: string
}

// Schema-based filter inference utility
export type InferFilters<TSchema extends ZodType> = Partial<zInfer<TSchema>>

// Fallback to any for non-schema cases (loose partial with index signature)
export type FilterType<TSchema extends ZodType | undefined> =
  TSchema extends ZodType
    ? { [K in keyof zInfer<TSchema>]?: zInfer<TSchema>[K] } & Record<
        string,
        unknown
      >
    : Record<string, unknown>

// CRUD Actions interface - All operations are bulk by default
export type PagedData<T> = {
  data: T[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CRUDActions<
  T = unknown,
  TCreate = unknown,
  TQuerySchema extends ZodType | undefined = undefined,
  TData = PagedData<T>,
> {
  /**
   * Unified query hook. WiseTable will pass table-driven params (e.g., filters).
   */
  useQuery?: (
    params: QueryParams<FilterType<TQuerySchema>>,
  ) => UseQueryResult<TData, Error>
  useCreateMutation?: () => UseMutationResult<void, Error, TCreate[]>
  useUpdateMutation?: () => UseMutationResult<
    void,
    Error,
    UpdateItemsPayload<T>
  >
  useDeleteMutation?: () => UseMutationResult<
    void,
    Error,
    DeleteItemsPayload<T>
  >
}

// URL state is now managed by URLStateProvider

// Editing context interface
export interface EditingContextValue<T = unknown> {
  // Current cell being edited
  currentEdit: EditingState<T> | null
  setCurrentEdit: (edit: EditingState<T> | null) => void

  // Dirty rows tracking
  dirtyRows: Map<string | number, DirtyRow<T>>
  setDirtyRows: (rows: Map<string | number, DirtyRow<T>>) => void

  // Selected rows (auto-selected when dirty)
  selectedRowIds: Set<string | number>
  setSelectedRowIds: (ids: Set<string | number>) => void
  selectedRows: unknown[] // Actual selected row objects

  // Helper functions
  isDirty: (rowId: string | number) => boolean
  isSelected: (rowId: string | number) => boolean
  hasUnsavedChanges: () => boolean

  // Internal: forces a hard re-mount of table body after resets
  __resetVersion?: number

  // Cell editing operations
  startEdit: (
    rowIndex: number,
    columnKey: keyof T,
    currentValue: T[keyof T],
  ) => void
  commitEdit: (
    rowId: string | number,
    columnKey: keyof T,
    newValue: T[keyof T],
    originalRow: T,
  ) => void
  cancelEdit: () => void

  // State management
  discardChanges: () => void

  // Batch operations (modal-based)
  openCreateModal: () => void
  openUpdateModal?: () => void
  openDeleteModal?: () => void

  // Get selected items (requires data context)
  getSelectedItems?: () => unknown[]
  // Get row id for an item
  getRowId?: (item: T) => string | number

  // Pre-generated mutations (to avoid hook call issues)
  updateMutation?: UseMutationResult<void, Error, UpdateItemsPayload<T>>
  deleteMutation?: UseMutationResult<void, Error, DeleteItemsPayload<T>>
}

// Contexts
export const CRUDActionsContext = createContext<CRUDActions<
  unknown,
  unknown
> | null>(null)
export const EditingContext =
  createContext<EditingContextValue<unknown> | null>(null)

// Hook to access CRUD actions
export function useCRUDActions<
  T = unknown,
  TCreate = unknown,
  TQuerySchema extends ZodType | undefined = undefined,
>(): CRUDActions<T, TCreate, TQuerySchema> {
  const context = useContext(CRUDActionsContext)

  if (!context) {
    // Return empty actions if no provider is found (graceful fallback)
    return {}
  }

  return context as CRUDActions<T, TCreate, TQuerySchema>
}

// Hook to use editing context
export function useEditingContext<T = unknown>(): EditingContextValue<T> {
  const context = useContext(EditingContext)
  if (!context) {
    throw new Error('useEditingContext must be used within EditingProvider')
  }
  return context as EditingContextValue<T>
}

// Unified hook interface combining all WiseTable functionality
export interface WiseTableHook<T = unknown> {
  // CRUD Operations - Modal-based
  onCreateModal?: () => void // Opens create modal
  onUpdateSelected?: () => void // Opens update modal
  onDeleteSelected?: () => void // Opens delete modal

  // Selection State
  selectedRowIds: Set<string | number>
  setSelectedRowIds: (ids: Set<string | number>) => void
  selectedRows: T[] // Actual selected row objects

  // Editing State
  currentEdit: EditingState<T> | null
  setCurrentEdit: (edit: EditingState<T> | null) => void
  dirtyRows: Map<string | number, DirtyRow<T>>
  setDirtyRows: (rows: Map<string | number, DirtyRow<T>>) => void

  // Helper Functions
  isDirty: (rowId: string | number) => boolean
  isSelected: (rowId: string | number) => boolean
  hasUnsavedChanges: () => boolean

  // Cell Editing Operations
  startEdit: (
    rowIndex: number,
    columnKey: keyof T,
    currentValue: T[keyof T],
  ) => void
  commitEdit: (
    rowId: string | number,
    columnKey: keyof T,
    newValue: T[keyof T],
    originalRow: T,
  ) => void
  cancelEdit: () => void

  // State Management
  discardChanges: () => void
}

/**
 * Unified hook for all WiseTable functionality
 * All CRUD operations trigger modals for user confirmation
 */
export function useWiseTable<T = unknown>(): WiseTableHook<T> {
  const editingContext = useEditingContext<T>()

  const onCreateModal = () => {
    editingContext.openCreateModal?.()
  }

  const onUpdateSelected = () => {
    editingContext.openUpdateModal?.()
  }

  const onDeleteSelected = () => {
    editingContext.openDeleteModal?.()
  }

  return {
    // CRUD Operations - Modal-based
    onCreateModal,
    onUpdateSelected,
    onDeleteSelected,

    // Selection State
    selectedRowIds: editingContext.selectedRowIds,
    setSelectedRowIds: editingContext.setSelectedRowIds,
    selectedRows: editingContext.selectedRows as T[],

    // Editing State
    currentEdit: editingContext.currentEdit,
    setCurrentEdit: editingContext.setCurrentEdit,
    dirtyRows: editingContext.dirtyRows,
    setDirtyRows: editingContext.setDirtyRows,

    // Helper Functions
    isDirty: editingContext.isDirty,
    isSelected: editingContext.isSelected,
    hasUnsavedChanges: editingContext.hasUnsavedChanges,

    // Cell Editing Operations
    startEdit: editingContext.startEdit,
    commitEdit: editingContext.commitEdit,
    cancelEdit: editingContext.cancelEdit,

    // State Management
    discardChanges: editingContext.discardChanges,
  }
}
