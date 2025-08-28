// Main component export
export { default, WiseTable, type WiseTableProps } from './WiseTable'

// Core types
export type {
  FilterField,
  FilterOptions,
  FilterParams,
  InferSchema,
  ReasonRequirements,
  SelectQueryResult,
  WiseTableColumn,
  WiseTableProps as WiseTableCoreProps,
} from './internal/WiseTableCore'

// Helper functions for column definition
export { defineColumns } from './utils/defineColumns'

// Query and CRUD types
export type {
  CRUDActions,
  FilterType,
  InferFilters,
  PagedData,
  QueryParams,
} from './hooks/useWiseTable'

// Component interfaces
export type { DefaultComponentProps } from './types/ComponentInterfaces'

// Context providers
export {
  CRUDActionsProvider,
  EditingProvider,
  FilterProvider,
  LoadingStateProvider,
  UIProvider,
  URLStateProvider,
} from './providers'

// Custom hooks
export { useFilter } from './hooks/useFilter'
export { useLoadingState } from './hooks/useLoadingState'
export { useUI } from './hooks/useUI'
export { useURLState } from './hooks/useURLState'
