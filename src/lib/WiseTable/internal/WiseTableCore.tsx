import React, { type ComponentType } from 'react'
import type { ZodType, infer as zInfer } from 'zod'

import { useLoadingState } from '../hooks/useLoadingState'
import { useURLState } from '../hooks/useURLState'
import type { CRUDActions, FilterType, PagedData } from '../hooks/useWiseTable'
import {
  CRUDActionsProvider,
  EditingProvider,
  TableStoreProvider,
} from '../providers'
import type { ColumnType, CurrencyOptions, SelectOption } from '../types/common'
import type { DefaultComponentProps } from '../types/ComponentInterfaces'
import { ErrorState } from '../ui/ErrorState'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { FilterBar } from './FilterBar'
import { TableActions, type TableActionsProps } from './TableActions'
import { TableBody } from './TableBody'
import { TableFooter } from './TableFooter'
import { TableHeader } from './TableHeader'

// Generic type utility for Zod schema inference
export type InferSchema<T extends ZodType> = zInfer<T>

// Query result type for useSelectQuery
export interface SelectQueryResult<T = unknown> {
  data?: SelectOption<T>[]
  isLoading?: boolean
  error?: unknown
  isError?: boolean
}

// Column value query result for pre-filling field values
export interface ColumnValueQueryResult<T = unknown> {
  data?: T
  isLoading?: boolean
  error?: unknown
  isError?: boolean
}

// Column definition interface
export interface WiseTableColumn<
  T = Record<string, unknown>,
  K extends keyof T = keyof T,
> {
  key: K
  label: string
  editable?: boolean
  readonly?: boolean
  width?: string | number
  autoGenerate?: boolean
  /**
   * Custom cell renderer. The third argument provides a wrapper that
   * reproduces the library's default badge styling for option-based columns.
   * For non-option columns, it will simply return the provided content or
   * a basic formatted fallback when content is omitted.
   */
  render?: (
    value: T[K],
    row: T,
    originalWrapper: (
      content?: React.ReactNode,
      className?: string,
    ) => React.ReactNode,
    setValue?: (value: T[K]) => void,
  ) => React.ReactNode
  options?: SelectOption<T[K]>[]
  useSelectQuery?: () => SelectQueryResult<T[K]>
  /**
   * Hook to fetch or compute an initial value for this column (e.g., server default).
   * Executed in both table cells and Create modal to pre-fill values.
   */
  useColumnQuery?: () => ColumnValueQueryResult<T[K]>
  type?: ColumnType
  locale?: string
  currencyOptions?: CurrencyOptions
  dateFormat?: string
}

// Filter types
export interface FilterField {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'
  options?: Array<{ label: string; value: string | number | boolean }>
  placeholder?: string
}

export type FilterParams<TQueryDTO = Record<string, unknown>> =
  Partial<TQueryDTO>

export interface FilterOptions<TQueryDTO = Record<string, unknown>> {
  readonly fields: readonly FilterField[]
  enableQuickFilters?: boolean
  quickFilters?: ReadonlyArray<{
    label: string
    params: FilterParams<TQueryDTO>
  }>
}

// Reason requirement configuration for CRUD operations
export interface ReasonRequirements {
  create?: boolean
  update?: boolean
  delete?: boolean
}

// Create default values for the schema
export type CreateDefaultValues<TSchema extends ZodType> = Partial<
  InferSchema<TSchema>
>

// Core component props
export interface WiseTableProps<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
> {
  schema: S
  createSchema?: C
  querySchema?: ZodType
  idColumn: keyof InferSchema<S>
  columns: WiseTableColumn<InferSchema<S>>[]
  /** Optional columns dedicated for Create modal. Falls back to columns when omitted. */
  createColumns?: WiseTableColumn<
    C extends ZodType ? InferSchema<C> : InferSchema<S>
  >[]
  createDefaultValues?: CreateDefaultValues<S>
  enableFilters?: boolean
  useSearch?: boolean
  ActionsComponent?: ComponentType
  tableActions?: TableActionsProps
  crudActions?: CRUDActions<
    InferSchema<S>,
    C extends ZodType ? zInfer<C> : unknown,
    S,
    D
  >
  tableHeight?: string
  className?: string
  filterOptions?: FilterOptions<unknown>
  defaultFilters?: FilterParams<unknown>
  requireReason?: ReasonRequirements

  componentProps?: DefaultComponentProps
  onFilterChange?: (
    filterParams: FilterParams<unknown>,
    searchParams: URLSearchParams,
  ) => void
}

function WiseTableCoreImpl<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
>(props: WiseTableProps<S, D, C>) {
  const urlState = useURLState()
  const loadingState = useLoadingState()

  const queryFromActions = props.crudActions?.useQuery?.({
    page: urlState.queryState.page,
    limit: urlState.queryState.limit,
    filters: urlState.queryState.filters as FilterType<S>,
    search: urlState.queryState.search,
  })

  const rawData = queryFromActions?.data as unknown
  const data =
    (Array.isArray(rawData)
      ? rawData
      : (rawData as { data?: Array<InferSchema<S>> })?.data) || []
  const pagination = Array.isArray(rawData)
    ? undefined
    : (
        rawData as {
          pagination?: {
            page: number
            pageSize: number
            total: number
            totalPages: number
          }
        }
      )?.pagination
  const isLoading = queryFromActions?.isLoading ?? false
  const error = (queryFromActions?.error as Error | undefined) || undefined

  // Track query loading state
  React.useEffect(() => {
    loadingState.setQuerying(isLoading)
  }, [isLoading, loadingState])

  // Loading state management

  const ActionsComponent =
    props.ActionsComponent || (() => <TableActions {...props.tableActions} />)
  const crudActions = props.crudActions || {}

  // Default UI components for error and loading states

  if (error) {
    return (
      <ErrorState
        error={error}
        className={props.className}
        {...props.componentProps?.errorState}
      />
    )
  }

  const tableBodyStyle = props.tableHeight
    ? { maxHeight: props.tableHeight }
    : undefined

  return (
    <CRUDActionsProvider<
      InferSchema<S>,
      C extends ZodType ? zInfer<C> : unknown,
      S,
      D
    >
      actions={
        crudActions as CRUDActions<
          InferSchema<S>,
          C extends ZodType ? zInfer<C> : unknown,
          S,
          D
        >
      }
    >
      <EditingProvider
        data={data || []}
        idColumn={props.idColumn}
        columns={props.columns}
        createColumns={props.createColumns}
        schema={props.schema}
        createSchema={props.createSchema}
        createDefaultValues={props.createDefaultValues}
        requireReason={props.requireReason}
      >
        <TableStoreProvider>
          <div className={`wise-table relative ${props.className || ''}`}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              {ActionsComponent && (
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800">
                  <ActionsComponent />
                </div>
              )}

              <div
                className={`sticky ${ActionsComponent ? 'top-[68px]' : 'top-0'} z-20 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800`}
              >
                <FilterBar />
              </div>
              <div
                className={`overflow-x-auto overflow-y-auto ${props.tableHeight ? '' : 'max-h-96'}`}
                style={tableBodyStyle}
              >
                <table className="min-w-full table-fixed">
                  <TableHeader columns={props.columns} />
                  <TableBody
                    data={data}
                    columns={props.columns}
                    idColumn={props.idColumn}
                  />
                </table>
              </div>

              <TableFooter
                data={data}
                pagination={
                  pagination || {
                    page: urlState.uiState.page,
                    pageSize: urlState.uiState.limit,
                    total: Array.isArray(data) ? data.length : 0,
                    totalPages: Math.max(
                      1,
                      Math.ceil(
                        (Array.isArray(data) ? data.length : 0) /
                          urlState.uiState.limit,
                      ),
                    ),
                  }
                }
                onPrevPage={urlState.prevPage}
                onNextPage={urlState.nextPage}
                onPageSizeChange={urlState.setLimit}
                onPageChange={urlState.setPage}
              />
            </div>

            {/* Loading overlays */}
            {(loadingState.isAnyLoading || isLoading) && (
              <LoadingSpinner
                message={
                  loadingState.isCreating
                    ? 'Creating...'
                    : loadingState.isUpdating
                      ? 'Updating...'
                      : loadingState.isDeleting
                        ? 'Deleting...'
                        : 'Loading...'
                }
                size="md"
                overlay={true}
                {...props.componentProps?.loadingSpinner}
              />
            )}
          </div>
        </TableStoreProvider>
      </EditingProvider>
    </CRUDActionsProvider>
  )
}

export const WiseTableCore = WiseTableCoreImpl
