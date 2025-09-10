import type { ZodType, infer as zInfer } from 'zod'
import type { CRUDActions, PagedData } from './hooks/useWiseTable'
import {
  WiseTableCore,
  type WiseTableProps as CoreProps,
  type InferSchema,
  type WiseTableColumn,
} from './internal/WiseTableCore'
import {
  CRUDActionsProvider,
  EditingProvider,
  FilterProvider,
  LoadingStateProvider,
  TableStoreProvider,
  UIProvider,
  URLStateProvider,
} from './providers'

// Main component props (wrapper around core)
export type WiseTableProps<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
> = CoreProps<S, D, C>

/**
 * WiseTable main component
 *
 * Provides a ready-to-use table by automatically configuring all Providers.
 * Advanced users can directly use individual Providers and external components for finer control.
 */
export function WiseTable<
  S extends ZodType,
  D = PagedData<InferSchema<S>>,
  C extends ZodType | undefined = undefined,
>(props: WiseTableProps<S, D, C>) {
  const {
    useSearch = true,
    filterOptions,
    defaultFilters,
    tableHeight,
    className,
    crudActions,
    tableActions,
    componentProps,
    ...coreProps
  } = props

  return (
    <URLStateProvider>
      <LoadingStateProvider>
        <FilterProvider
          filterOptions={filterOptions}
          defaultFilters={defaultFilters}
          useSearch={useSearch}
          componentProps={componentProps}
        >
          <UIProvider
            tableHeight={tableHeight}
            className={`${className || ''}`.trim()}
          >
            <CRUDActionsProvider actions={crudActions || {}}>
              <TableStoreProvider>
                <EditingProvider
                  data={[]} // This will be handled by WiseTableCore
                  idColumn={coreProps.idColumn as keyof InferSchema<S>}
                  columns={
                    coreProps.columns as WiseTableColumn<InferSchema<S>>[]
                  }
                  schema={coreProps.schema}
                  createSchema={coreProps.createSchema}
                  requireReason={coreProps.requireReason}
                  componentProps={componentProps}
                >
                  <WiseTableCore
                    {...(coreProps as unknown as CoreProps<S, D, C>)}
                    useSearch={useSearch}
                    filterOptions={filterOptions}
                    tableHeight={tableHeight}
                    className={className}
                    crudActions={
                      crudActions as CRUDActions<
                        InferSchema<S>,
                        C extends ZodType ? zInfer<C> : unknown,
                        S,
                        D
                      >
                    }
                    tableActions={tableActions}
                    componentProps={componentProps}
                  />
                </EditingProvider>
              </TableStoreProvider>
            </CRUDActionsProvider>
          </UIProvider>
        </FilterProvider>
      </LoadingStateProvider>
    </URLStateProvider>
  )
}

export default WiseTable
