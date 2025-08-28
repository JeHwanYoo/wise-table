import { createContext } from 'react'

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

export interface FilterContextValue {
  filterOptions: FilterOptions<unknown>
  currentFilters: Record<string, unknown>
  searchValue: string
  updateFilter: (key: string, value: unknown) => void
  removeFilter: (key: string) => void
  clearAllFilters: () => void
  applyQuickFilter: (params: Record<string, unknown>) => void
  updateSearch: (search: string) => void
  clearSearch: () => void
  enableFilters: boolean
  useSearch: boolean
}

export const FilterContext = createContext<FilterContextValue | null>(null)
