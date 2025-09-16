import React from 'react'
import type { ZodType, infer as zInfer } from 'zod'

import { useLoadingState } from '../hooks/useLoadingState'
import { useURLState } from '../hooks/useURLState'
import type { CRUDActions, PagedData } from '../hooks/useWiseTable'
import {
  CRUDActionsProvider,
  EditingProvider,
  TableStoreProvider,
} from '../providers'
import type { ColumnType, SelectOption } from '../types/common'
import type { DefaultComponentProps } from '../types/ComponentInterfaces'
import { ErrorState } from '../ui/ErrorState'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { FilterBar } from './FilterBar'
import { TableActions, type TableActionsProps } from './TableActions'
import { TableBody } from './TableBody'
import { TableFooter } from './TableFooter'
import { TableHeader } from './TableHeader'
import { UnsavedChangesHelper } from './UnsavedChangesHelper'

// Generic type utility for Zod schema inference
export type InferSchema<T extends ZodType> = zInfer<T>

// Column value query result for pre-filling field values and options
export interface ColumnValueQueryResult<T = unknown> {
  data?: T
  options?: SelectOption<T>[]
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
  readonly?: boolean
  width?: string | number
  /**
   * Custom cell renderer with improved signature
   * @param value - The current cell value
   * @param row - The current row data
   * @param rows - All table rows data
   * @param rowIndex - The current row index
   */
  render?: (value: T[K], row: T, rows: T[], rowIndex: number) => React.ReactNode
  options?: SelectOption<T[K]>[]
  /**
   * Hook to fetch or compute an initial value for this column (e.g., server default).
   * Executed in both table cells and Create modal to pre-fill values.
   */
  useColumnQuery?: () => ColumnValueQueryResult<T[K]>
  type?: ColumnType
  dateFormat?: string
}

// Filter types
export interface FilterField<TQueryDTO = Record<string, unknown>> {
  key: keyof TQueryDTO
  label: string
  type: 'string' | 'number' | 'date-range' | 'boolean' | 'select'
  options?: Array<{ label: string; value: string | number | boolean }>
  // Hook-based options that will be called in React component context
  useOptions?: () => Array<{ label: string; value: string | number | boolean }>
  placeholder?: string
  // For date-range type: available date types for dropdown
  dateTypes?: Array<{ label: string; value: string }>
}

export type FilterParams<TQueryDTO = Record<string, unknown>> =
  Partial<TQueryDTO>

export interface FilterOptions<TQueryDTO = Record<string, unknown>> {
  readonly fields: readonly FilterField<TQueryDTO>[]
}

// Reason requirement configuration for CRUD operations
export interface ReasonRequirements {
  create?: boolean
  update?: boolean
  delete?: boolean
}

// Core component props
export interface WiseTableProps<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
  Q extends ZodType | undefined = undefined,
> {
  schema: S
  createSchema?: C
  /** Optional schema that defines and validates query/filter parameters */
  querySchema?: Q
  idColumn: keyof InferSchema<S>
  columns: WiseTableColumn<InferSchema<S>>[]
  /** Optional columns dedicated for Create modal. Falls back to columns when omitted. */
  createColumns?: WiseTableColumn<
    C extends ZodType ? InferSchema<C> : InferSchema<S>
  >[]
  useSearch?: boolean
  tableActions?: TableActionsProps
  crudActions?: CRUDActions<
    InferSchema<S>,
    C extends ZodType ? zInfer<C> : unknown,
    S,
    D
  >
  tableHeight?: string
  className?: string
  /**
   * Filter options are tied to the query parameters, not to create schema.
   * When a querySchema is provided, its inferred type will be used here.
   */
  filterOptions?: FilterOptions<Q extends ZodType ? zInfer<Q> : unknown>
  defaultFilters?: FilterParams<Q extends ZodType ? zInfer<Q> : unknown>
  requireReason?: ReasonRequirements
  componentProps?: DefaultComponentProps
}

function WiseTableCoreImpl<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
  Q extends ZodType | undefined = undefined,
>(props: WiseTableProps<S, D, C, Q>) {
  const urlState = useURLState()
  const loadingState = useLoadingState()

  // Build query parameters with schema validation
  const queryParams = React.useMemo(() => {
    // Base parameters
    const baseParams = {
      page: urlState.queryState.page,
      limit: urlState.queryState.limit,
      search: urlState.queryState.search,
    }

    // If querySchema is provided, filter and validate against it
    if (props.querySchema) {
      try {
        // Filter out empty values
        const filteredParams: Record<string, unknown> = {}

        Object.entries(urlState.queryState.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Handle date arrays: convert [startDate, endDate] to comma-separated string
            if (Array.isArray(value) && value.length > 0) {
              const [startDate, endDate] = value
              const validDates = [startDate, endDate].filter(
                (date) => date !== null && date !== undefined && date !== '',
              )
              if (validDates.length > 0) {
                // Join valid dates with comma for API
                filteredParams[key] = validDates.join(',')
              }
            } else {
              filteredParams[key] = value
            }
          }
        })

        // Validate the filtered params against the schema using safeParse
        const parseResult = props.querySchema.safeParse(filteredParams)

        if (!parseResult.success) {
          throw new Error(
            `Query schema validation failed: ${parseResult.error.message}`,
          )
        }

        const validatedParams = parseResult.data

        return {
          ...baseParams,
          ...(validatedParams as Record<string, unknown>),
        }
      } catch (error) {
        // Re-throw the error to be handled by the query error boundary
        throw new Error(
          `Query schema validation failed: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    // Fallback: if no querySchema, use all filters (current behavior)
    return {
      ...baseParams,
      ...urlState.queryState.filters,
    }
  }, [urlState.queryState, props.querySchema])

  const queryFromActions = props.crudActions?.useQuery?.(queryParams)

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
        requireReason={props.requireReason}
      >
        <TableStoreProvider>
          <div className={`wise-table relative ${props.className || ''}`}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800">
                {props.tableActions && <TableActions {...props.tableActions} />}
                <FilterBar />
                <UnsavedChangesHelper />
              </div>
              <div
                className={`overflow-x-auto overflow-y-auto ${props.tableHeight ? '' : 'max-h-96'}`}
                style={tableBodyStyle}
              >
                <table className="min-w-full table-fixed">
                  <TableHeader
                    columns={props.columns}
                    idColumn={props.idColumn}
                  />
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
