import React, { type ReactNode, useMemo, useState } from 'react'
import { useLoadingState } from '../hooks/useLoadingState'
import {
  type DirtyRow,
  EditingContext,
  type EditingContextValue,
  type EditingState,
  useCRUDActions,
} from '../hooks/useWiseTable'
import { CreateModal } from '../modals/CreateModal'
import { DeleteSelectedModal } from '../modals/DeleteSelectedModal'
import { UpdateSelectedModal } from '../modals/UpdateSelectedModal'
import type { DefaultComponentProps } from '../types/ComponentInterfaces'
import { normalize } from '../utils/formatCellValue'

import { z, type ZodType } from 'zod'
import type {
  ReasonRequirements,
  WiseTableColumn,
} from '../internal/WiseTableCore'

interface EditingProviderProps<T, TCreate = T> {
  children: ReactNode
  data: T[]
  idColumn: keyof T
  columns: WiseTableColumn<T>[]
  /** Optional columns dedicated for Create modal */
  createColumns?: WiseTableColumn<TCreate>[]
  schema: ZodType
  createSchema?: ZodType
  createDefaultValues?: Partial<T>
  requireReason?: ReasonRequirements
  componentProps?: DefaultComponentProps
}

/**
 * Compare two values while treating empty string and null/undefined as equivalent.
 * This prevents falsely marking a cell dirty when a user focuses an empty input and blurs without changes.
 */
function areValuesEffectivelyEqual<TValue>(
  a: TValue | null | undefined,
  b: TValue | null | undefined,
): boolean {
  return Object.is(normalize(a), normalize(b))
}

export function EditingProvider<T, TCreate = T>({
  children,
  data,
  idColumn,
  createColumns,
  schema,
  createSchema,
  createDefaultValues,
  requireReason,
  componentProps,
}: EditingProviderProps<T, TCreate>) {
  const crudActions = useCRUDActions<T, TCreate>()
  const loadingState = useLoadingState()
  const createMutation = crudActions.useCreateMutation?.()
  const updateMutation = crudActions.useUpdateMutation?.()
  const deleteMutation = crudActions.useDeleteMutation?.()

  // Modal components for CRUD operations

  // Track mutation loading states
  React.useEffect(() => {
    loadingState.setCreating(createMutation?.isPending ?? false)
  }, [createMutation?.isPending, loadingState])

  React.useEffect(() => {
    loadingState.setUpdating(updateMutation?.isPending ?? false)
  }, [updateMutation?.isPending, loadingState])

  React.useEffect(() => {
    loadingState.setDeleting(deleteMutation?.isPending ?? false)
  }, [deleteMutation?.isPending, loadingState])
  const [currentEdit, setCurrentEdit] = useState<EditingState<T> | null>(null)
  const [dirtyRows, setDirtyRows] = useState<Map<string | number, DirtyRow<T>>>(
    new Map(),
  )
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set(),
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [resetVersion, setResetVersion] = useState(0)

  const contextValue: EditingContextValue<T> = useMemo(
    () => ({
      currentEdit,
      setCurrentEdit,
      dirtyRows,
      setDirtyRows,
      selectedRowIds,
      setSelectedRowIds,
      selectedRows: data.filter((item) => {
        const itemId = (item as Record<string, unknown>)[idColumn as string]
        return selectedRowIds.has(itemId as string | number)
      }),

      // Helper functions
      isDirty: (rowId: string | number) => dirtyRows.has(rowId),
      isSelected: (rowId: string | number) => selectedRowIds.has(rowId),
      hasUnsavedChanges: () => dirtyRows.size > 0,
      __resetVersion: resetVersion,

      // Cell editing operations
      startEdit: (
        rowIndex: number,
        columnKey: keyof T,
        currentValue: T[keyof T],
      ) => {
        setCurrentEdit({
          rowIndex,
          columnKey,
          oldValue: currentValue,
          newValue: currentValue,
        })
      },

      commitEdit: (
        rowId: string | number,
        columnKey: keyof T,
        newValue: T[keyof T],
        originalRow: T,
      ) => {
        const existingDirty = dirtyRows.get(rowId)

        if (existingDirty) {
          // Update existing dirty row
          const updatedModified = {
            ...existingDirty.modifiedData,
            [columnKey]: newValue,
          }
          const changedFields = Object.keys(updatedModified).filter(
            (key) =>
              !areValuesEffectivelyEqual(
                updatedModified[key as keyof T] as T[keyof T],
                existingDirty.originalData[key as keyof T],
              ),
          ) as (keyof T)[]

          if (changedFields.length === 0) {
            // No more changes, remove from dirty
            const newDirtyRows = new Map(dirtyRows)
            newDirtyRows.delete(rowId)
            setDirtyRows(newDirtyRows)
          } else {
            // Update dirty row
            const newDirtyRows = new Map(dirtyRows)
            newDirtyRows.set(rowId, {
              ...existingDirty,
              modifiedData: updatedModified,
              changedFields,
            })
            setDirtyRows(newDirtyRows)
          }
        } else {
          // Check if value actually changed
          if (!areValuesEffectivelyEqual(originalRow[columnKey], newValue)) {
            // Create new dirty row
            const modifiedData = { ...originalRow, [columnKey]: newValue }
            const newDirtyRows = new Map(dirtyRows)
            newDirtyRows.set(rowId, {
              rowIndex: currentEdit?.rowIndex || 0,
              originalData: originalRow,
              modifiedData,
              changedFields: [columnKey],
            })
            setDirtyRows(newDirtyRows)
          }
        }

        setCurrentEdit(null)
      },

      cancelEdit: () => {
        setCurrentEdit(null)
      },

      // State management
      discardChanges: () => {
        // Hard reset all editing state
        setDirtyRows(new Map())
        setSelectedRowIds(new Set())
        setCurrentEdit(null)
        // Bump version to force re-mount of rows and inputs, avoiding any stale refs/state
        setResetVersion((v) => (v + 1) % Number.MAX_SAFE_INTEGER)
      },

      // Batch operations (modal-based)
      openCreateModal: () => {
        // Only open when createSchema and createColumns are provided
        if (createSchema && createColumns && createColumns.length > 0) {
          setShowCreateModal(true)
        }
      },

      openUpdateModal: () => {
        setShowUpdateModal(true)
      },

      openDeleteModal: () => {
        setShowDeleteModal(true)
      },

      // Get selected items automatically
      getSelectedItems: () => {
        return data.filter((item) => {
          const itemId = (item as Record<string, unknown>)[idColumn as string]
          return selectedRowIds.has(itemId as string | number)
        })
      },

      getRowId: (item: T) =>
        (item as Record<string, unknown>)[idColumn as string] as
          | string
          | number,

      // Pre-generated mutations
      updateMutation,
      deleteMutation,
    }),
    [
      currentEdit,
      dirtyRows,
      selectedRowIds,
      data,
      idColumn,
      resetVersion,
      updateMutation,
      deleteMutation,
      createColumns,
      createSchema,
    ],
  )

  const handleCreateConfirm = (items: TCreate[]) => {
    createMutation?.mutate(items)
    setShowCreateModal(false)
  }

  const handleCreateCancel = () => {
    setShowCreateModal(false)
  }

  // Validate dirty rows for update modal
  const getUpdateValidationErrors = () => {
    if (dirtyRows.size === 0) return []

    const dirtyRowsArray = Array.from(dirtyRows.values())
    const validationErrors: Array<{
      itemId: string | number
      errors: string[]
    }> = []

    dirtyRowsArray.forEach((dirtyRow) => {
      // Validate only changed fields using a subset object schema
      // Unwrap effects to reach the base object schema
      function isZodEffects(value: unknown): value is {
        _def: { typeName?: string; schema?: unknown }
      } {
        return (
          typeof value === 'object' &&
          value !== null &&
          '_def' in (value as { _def?: unknown }) &&
          (value as { _def?: { typeName?: string } })._def?.typeName ===
            'ZodEffects'
        )
      }

      let baseSchema: unknown = schema
      while (isZodEffects(baseSchema)) {
        baseSchema = (baseSchema as { _def: { schema: unknown } })._def.schema
      }

      function getObjectShape(
        value: unknown,
      ): Record<string, z.ZodTypeAny> | null {
        const maybe = value as {
          _def?: { typeName?: string; shape?: unknown }
        }
        if (!maybe || !maybe._def || maybe._def.typeName !== 'ZodObject') {
          return null
        }
        const rawShape = (
          maybe._def as unknown as {
            shape?: unknown
          }
        ).shape
        if (typeof rawShape === 'function') {
          const fn = rawShape as () => Record<string, unknown>
          const result = fn()
          return result as Record<string, z.ZodTypeAny>
        }
        if (rawShape && typeof rawShape === 'object') {
          return rawShape as Record<string, z.ZodTypeAny>
        }
        return null
      }

      const objectShape = getObjectShape(baseSchema)
      if (!objectShape) {
        // If not an object schema, skip validation
        return
      }

      // Build subset shape for only changed fields present in the schema
      const subsetEntries = dirtyRow.changedFields
        .filter((key) =>
          Object.prototype.hasOwnProperty.call(objectShape, key as string),
        )
        .map((key) => [
          key as string,
          objectShape[key as string].optional(),
        ]) as Array<[string, z.ZodTypeAny]>

      if (subsetEntries.length === 0) {
        return
      }

      const subsetObject = z.object(Object.fromEntries(subsetEntries))

      const changedSubset = dirtyRowsArray
        ? dirtyRow.changedFields.reduce(
            (acc, key) => {
              ;(acc as Record<string, unknown>)[key as string] = (
                dirtyRow.modifiedData as unknown as Record<string, unknown>
              )[key as string]
              return acc
            },
            {} as Record<string, unknown>,
          )
        : {}

      const result = subsetObject.safeParse(changedSubset)
      if (!result.success) {
        const itemId = (dirtyRow.originalData as Record<string, unknown>)[
          idColumn as string
        ] as string | number
        validationErrors.push({
          itemId,
          errors: result.error.issues.map((issue: z.ZodIssue) => issue.message),
        })
      }
    })

    return validationErrors
  }

  const handleUpdateConfirm = async (reason?: string) => {
    if (dirtyRows.size > 0) {
      const dirtyRowsArray = Array.from(dirtyRows.values())

      try {
        await updateMutation?.mutateAsync({
          items: dirtyRowsArray.map((dr) => ({
            data: dr.modifiedData,
            changedColumns: dr.changedFields as (keyof T)[],
          })),
          reason,
        })
        // Success: clear dirty state and selection
        setDirtyRows(new Map())
        setSelectedRowIds(new Set())
        setShowUpdateModal(false)
      } catch (error) {
        console.error('Update failed:', error)
      }
    }
  }

  const handleUpdateCancel = () => {
    setShowUpdateModal(false)
  }

  const handleDeleteConfirm = async (reason?: string) => {
    const selectedItems = data.filter((item) => {
      const itemId = (item as Record<string, unknown>)[idColumn as string]
      return selectedRowIds.has(itemId as string | number)
    })

    if (selectedItems.length > 0) {
      try {
        await deleteMutation?.mutateAsync({ items: selectedItems, reason })
        // Success: clear selection
        setSelectedRowIds(new Set())
        setShowDeleteModal(false)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  return (
    <EditingContext.Provider
      value={contextValue as EditingContextValue<unknown>}
    >
      {children}

      {/* Create Modal (render only when both schema and createColumns are provided) */}
      {createSchema && createColumns && createColumns.length > 0 && (
        <CreateModal
          isOpen={showCreateModal}
          columns={createColumns}
          schema={createSchema}
          defaultValues={createDefaultValues as unknown as Partial<TCreate>}
          onConfirm={handleCreateConfirm}
          onCancel={handleCreateCancel}
          idColumn={undefined}
          {...(componentProps?.createModal || {})}
        />
      )}

      {/* Update Selected Modal */}
      <UpdateSelectedModal
        isOpen={showUpdateModal}
        dirtyRows={Array.from(dirtyRows.values())}
        validationErrors={getUpdateValidationErrors()}
        onConfirm={handleUpdateConfirm}
        onCancel={handleUpdateCancel}
        requireReason={requireReason?.update ?? true}
        idColumn={idColumn}
        {...(componentProps?.updateModal || {})}
      />

      {/* Delete Selected Modal */}
      <DeleteSelectedModal
        isOpen={showDeleteModal}
        selectedItems={data.filter((item) => {
          const itemId = (item as Record<string, unknown>)[idColumn as string]
          return selectedRowIds.has(itemId as string | number)
        })}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        requireReason={requireReason?.delete ?? true}
        idColumn={idColumn}
        {...(componentProps?.deleteModal || {})}
      />
    </EditingContext.Provider>
  )
}
