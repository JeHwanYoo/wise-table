import { createContext } from 'react'

export interface FilterField<TQueryDTO = Record<string, unknown>> {
  key: keyof TQueryDTO
  label: string
  type: 'string' | 'number' | 'date-range' | 'boolean' | 'select'
  options?: Array<{ label: string; value: string | number | boolean }>
  // Hook-based options that will be called in React component context
  useOptions?: () => Array<{ label: string; value: string | number | boolean }>
  placeholder?: string
  // For date-range type: available date types
  dateTypes?: string[]
}

export type FilterParams<TQueryDTO = Record<string, unknown>> =
  Partial<TQueryDTO>

export interface FilterOptions<TQueryDTO = Record<string, unknown>> {
  readonly fields: readonly FilterField<TQueryDTO>[]
}

export interface FilterContextValue<TQueryDTO = Record<string, unknown>> {
  filterOptions: FilterOptions<TQueryDTO>
  searchValue: string
  searchPlaceholder: string
  updateFilter: (key: string, value: unknown) => void
  removeFilter: (key: string) => void
  clearAllFilters: () => void
  updateSearch: (search: string) => void
  clearSearch: () => void
  enableFilters: boolean
  useSearch: boolean
}

export const FilterContext = createContext<FilterContextValue<unknown> | null>(
  null,
)
