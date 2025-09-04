// Main library exports (will be published to npm)
export { WiseTable } from './WiseTable'
export type {
  FilterField,
  FilterOptions,
  FilterParams,
  InferSchema,
  WiseTableColumn,
  WiseTableProps,
} from './WiseTable'

// Helper functions for column definition
export { defineColumns } from './WiseTable'
export { useTableStore } from './WiseTable/contexts/TableStoreContext'

// Table components
export {
  EditableCell,
  FilterBar,
  TableActions,
  TableBody,
  TableFooter,
  TableHeader,
  WiseTableCore,
} from './WiseTable/internal'

// UI components
export {
  ConfirmModal,
  ErrorState,
  LoadingSpinner,
  ModalContainer,
  SearchableSelect,
  SearchBox,
  WiseTableButton,
} from './WiseTable/ui'

// Main hook and types
export { useSetColumn } from './WiseTable/hooks/useSetColumn'
export {
  useCRUDActions,
  useEditingContext,
  useWiseTable,
} from './WiseTable/hooks/useWiseTable'
export type {
  CRUDActions,
  DeleteItemsPayload,
  DirtyRow,
  EditingState,
  PagedData,
  QueryParams,
  UpdateItemsPayload,
  WiseTableHook,
} from './WiseTable/hooks/useWiseTable'
export type { ColumnType, SelectOption } from './WiseTable/types/common'
export type { DefaultComponentProps } from './WiseTable/types/ComponentInterfaces'

// Utility functions
export {
  formatCurrency,
  formatCurrencyForEditing,
  isValidCurrencyInput,
  parseCurrencyInput,
} from './WiseTable/utils/currencyUtils'
export {
  formatDate,
  formatDateForEditing,
  isValidDateInput,
  parseDateInput,
} from './WiseTable/utils/dateUtils'

// Re-exports for consumer-controlled dependencies
// Consumers can import `z` and React Query APIs directly from this package
export * from '@tanstack/react-query'
export { z } from 'zod'
export type { infer as zInfer, ZodType, ZodTypeAny } from 'zod'

// CSS: ship prebuilt scoped Tailwind utilities so consumers don't need Tailwind
// Importing ensures bundlers include the stylesheet in the published package
import './styles.css'
