import React, { useCallback, useMemo } from 'react'
import type {
  FilterContextValue,
  FilterOptions,
} from '../contexts/FilterContext'
import { FilterContext } from '../contexts/FilterContext'
import { useURLState } from '../hooks/useURLState'
import type { DefaultComponentProps } from '../types/ComponentInterfaces'

interface FilterProviderProps {
  children: React.ReactNode
  filterOptions?: FilterOptions<unknown>
  defaultFilters?: Record<string, unknown>
  useSearch?: boolean
  componentProps?: DefaultComponentProps
}

export function FilterProvider({
  children,
  filterOptions = { fields: [] },
  defaultFilters = {},
  useSearch = true,
  componentProps,
}: FilterProviderProps) {
  const urlState = useURLState()

  // Merge default filters with URL filters
  const currentFilters = useMemo(
    () => ({
      ...defaultFilters,
      ...urlState.queryState.filters,
    }),
    [defaultFilters, urlState.queryState.filters],
  )

  const updateFilter = useCallback(
    (key: string, value: unknown) => {
      const newFilters = { ...currentFilters }
      if (value === undefined || value === null || value === '') {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }
      urlState.setFilters(newFilters)
    },
    [currentFilters, urlState],
  )

  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...currentFilters }
      delete newFilters[key]
      urlState.setFilters(newFilters)
    },
    [currentFilters, urlState],
  )

  const clearAllFilters = useCallback(() => {
    urlState.clearAllFilters()
  }, [urlState])

  const applyQuickFilter = useCallback(
    (params: Record<string, unknown>) => {
      const newFilters = { ...currentFilters, ...params }
      urlState.setFilters(newFilters)
    },
    [currentFilters, urlState],
  )

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
    (): FilterContextValue => ({
      filterOptions,
      currentFilters,
      searchValue: urlState.uiState.search,
      searchPlaceholder:
        componentProps?.searchBox?.placeholder || 'Type to search...',
      updateFilter,
      removeFilter,
      clearAllFilters,
      applyQuickFilter,
      updateSearch,
      clearSearch,
      enableFilters,
      useSearch,
    }),
    [
      filterOptions,
      currentFilters,
      urlState.uiState.search,
      componentProps?.searchBox?.placeholder,
      enableFilters,
      useSearch,
      updateFilter,
      removeFilter,
      clearAllFilters,
      applyQuickFilter,
      updateSearch,
      clearSearch,
    ],
  )

  return React.createElement(FilterContext.Provider, { value }, children)
}
