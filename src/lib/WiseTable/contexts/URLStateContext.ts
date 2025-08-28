import { createContext } from 'react'

// URL state models
export interface URLState {
  page: number
  limit: number
  search: string
  filters: Record<string, unknown>
}

export interface URLStateContextValue {
  queryState: URLState
  uiState: URLState
  isDebouncing: boolean
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setFilters: (filters: Record<string, unknown>) => void
  resetToFirstPage: () => void
  clearAllFilters: () => void
  clearSearch: () => void
  nextPage: () => void
  prevPage: () => void
}

export const URLStateContext = createContext<URLStateContextValue | null>(null)
