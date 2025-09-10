import React, { useCallback, useMemo } from 'react'
import type {
  FilterContextValue,
  FilterOptions,
} from '../contexts/FilterContext'
import { FilterContext } from '../contexts/FilterContext'
import { useURLState } from '../hooks/useURLState'
import type { DefaultComponentProps } from '../types/ComponentInterfaces'

interface FilterProviderProps<TQueryDTO = Record<string, unknown>> {
  children: React.ReactNode
  filterOptions?: FilterOptions<TQueryDTO>
  defaultFilters?: Record<string, unknown>
  useSearch?: boolean
  componentProps?: DefaultComponentProps
}

export function FilterProvider<TQueryDTO = Record<string, unknown>>({
  children,
  filterOptions = { fields: [] },
  defaultFilters = {},
  useSearch = true,
  componentProps,
}: FilterProviderProps<TQueryDTO>) {
  const urlState = useURLState()

  // Get current filters from URL state (merged with defaults when needed)
  const getCurrentFilters = useCallback(
    () => ({
      ...defaultFilters,
      ...urlState.queryState.filters,
    }),
    [defaultFilters, urlState.queryState.filters],
  )

  const updateFilter = useCallback(
    (key: string, value: unknown) => {
      const newFilters = { ...getCurrentFilters() }
      if (value === undefined || value === null || value === '') {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }
      urlState.setFilters(newFilters)
    },
    [getCurrentFilters, urlState],
  )

  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...getCurrentFilters() }
      delete newFilters[key]
      urlState.setFilters(newFilters)
    },
    [getCurrentFilters, urlState],
  )

  const clearAllFilters = useCallback(() => {
    urlState.clearAllFilters()
  }, [urlState])

  const updateSearch = useCallback(
    (search: string) => {
      urlState.setSearch(search)
    },
    [urlState],
  )

  const clearSearch = useCallback(() => {
    urlState.clearSearch()
  }, [urlState])

  const enableFilters = Boolean(
    filterOptions && filterOptions.fields.length > 0,
  )

  const value = useMemo(
    (): FilterContextValue<TQueryDTO> => ({
      filterOptions,
      searchValue: urlState.uiState.search,
      searchPlaceholder:
        componentProps?.searchBox?.placeholder || 'Type to search...',
      updateFilter,
      removeFilter,
      clearAllFilters,
      updateSearch,
      clearSearch,
      enableFilters,
      useSearch,
    }),
    [
      filterOptions,
      urlState.uiState.search,
      componentProps?.searchBox?.placeholder,
      enableFilters,
      useSearch,
      updateFilter,
      removeFilter,
      clearAllFilters,
      updateSearch,
      clearSearch,
    ],
  )

  return React.createElement(
    FilterContext.Provider,
    { value: value as FilterContextValue<unknown> },
    children,
  )
}
