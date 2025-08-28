import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  URLStateContext,
  type URLState,
  type URLStateContextValue,
} from '../contexts/URLStateContext'

// URL state management for pagination, search, and filters
// Context and types moved to contexts/URLStateContext

// Parse URL search params into state
function parseURLState(): URLState {
  const sp = new URLSearchParams(window.location.search)

  const page = Math.max(1, Number(sp.get('page') || '1'))
  const limit = Math.max(1, Number(sp.get('limit') || '25'))
  const search = sp.get('search') || ''

  const filters: Record<string, unknown> = {}
  sp.forEach((value, key) => {
    if (key === 'page' || key === 'limit' || key === 'search') return
    if (!value) return

    // Parse different filter types
    if (key.startsWith('min') || key.startsWith('max')) {
      const num = Number(value)
      if (!Number.isNaN(num)) filters[key] = num
    } else if (key.startsWith('start_') || key.startsWith('end_')) {
      filters[key] = value
    } else if (key === 'isActive' || value === 'true' || value === 'false') {
      filters[key] = value === 'true'
    } else {
      filters[key] = value
    }
  })

  return { page, limit, search, filters }
}

// Sync state to URL without navigation
function syncToURL(state: URLState): void {
  const sp = new URLSearchParams()

  // Always set page and limit
  sp.set('page', String(state.page))
  sp.set('limit', String(state.limit))

  // Set search if not empty
  if (state.search) {
    sp.set('search', state.search)
  }

  // Set filters
  Object.entries(state.filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    sp.set(key, String(value))
  })

  const url = `${window.location.pathname}?${sp.toString()}`.replace(/\?$/, '')
  window.history.replaceState(null, '', url)
}

// Provider component
export function URLStateProvider({ children }: { children: React.ReactNode }) {
  // Confirmed state (used for queries and URL)
  const [confirmedState, setConfirmedState] = useState<URLState>(parseURLState)

  // UI state (used for immediate display)
  const [uiState, setUIState] = useState<URLState>(parseURLState)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync confirmed state to URL
  useEffect(() => {
    syncToURL(confirmedState)
  }, [confirmedState])

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const newState = parseURLState()
      setConfirmedState(newState)
      setUIState(newState)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Debounced confirmation of UI changes
  const confirmChanges = useCallback(
    (newUIState: URLState) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Check if only search/filters changed (not pagination)
      const onlySearchFiltersChanged =
        confirmedState.page === newUIState.page &&
        confirmedState.limit === newUIState.limit &&
        (confirmedState.search !== newUIState.search ||
          JSON.stringify(confirmedState.filters) !==
            JSON.stringify(newUIState.filters))

      if (onlySearchFiltersChanged) {
        // Debounce search/filter changes
        debounceTimerRef.current = setTimeout(() => {
          setConfirmedState(newUIState)
        }, 300)
      } else {
        // Immediate confirmation for pagination changes
        setConfirmedState(newUIState)
      }
    },
    [confirmedState],
  )

  // Stable callbacks that update UI immediately and confirm after debounce
  const setPage = useCallback(
    (page: number) => {
      const newState = { ...uiState, page: Math.max(1, page) }
      setUIState(newState)
      confirmChanges(newState)
    },
    [uiState, confirmChanges],
  )

  const setLimit = useCallback(
    (limit: number) => {
      const newState = { ...uiState, limit: Math.max(1, limit), page: 1 }
      setUIState(newState)
      confirmChanges(newState)
    },
    [uiState, confirmChanges],
  )

  // Debounced search confirmation to avoid rapid URL updates
  const debouncedConfirmSearch = useDebouncedCallback(
    (state: URLState) => {
      confirmChanges(state)
    },
    300,
    { leading: false, trailing: true },
  )

  const setSearch = useCallback(
    (search: string) => {
      const newState = { ...uiState, search, page: 1 }
      setUIState(newState)
      debouncedConfirmSearch(newState)
    },
    [uiState, debouncedConfirmSearch],
  )

  const setFilters = useCallback(
    (filters: Record<string, unknown>) => {
      const newState = { ...uiState, filters, page: 1 }
      setUIState(newState)
      confirmChanges(newState)
    },
    [uiState, confirmChanges],
  )

  const resetToFirstPage = useCallback(() => {
    const newState = { ...uiState, page: 1 }
    setUIState(newState)
    confirmChanges(newState)
  }, [uiState, confirmChanges])

  const clearAllFilters = useCallback(() => {
    const newState = { ...uiState, filters: {}, page: 1 }
    setUIState(newState)
    confirmChanges(newState)
  }, [uiState, confirmChanges])

  const clearSearch = useCallback(() => {
    const newState = { ...uiState, search: '', page: 1 }
    setUIState(newState)
    confirmChanges(newState)
  }, [uiState, confirmChanges])

  const nextPage = useCallback(() => {
    const newState = { ...uiState, page: uiState.page + 1 }
    setUIState(newState)
    confirmChanges(newState)
  }, [uiState, confirmChanges])

  const prevPage = useCallback(() => {
    const newState = { ...uiState, page: Math.max(1, uiState.page - 1) }
    setUIState(newState)
    confirmChanges(newState)
  }, [uiState, confirmChanges])

  // Memoize query state to prevent re-renders when only UI changes
  const queryState = useMemo(
    () => ({
      page: confirmedState.page,
      limit: confirmedState.limit,
      search: confirmedState.search,
      filters: confirmedState.filters,
    }),
    [
      confirmedState.page,
      confirmedState.limit,
      confirmedState.search,
      confirmedState.filters,
    ],
  )

  // Memoize UI state
  const memoizedUIState = useMemo(
    () => ({
      page: uiState.page,
      limit: uiState.limit,
      search: uiState.search,
      filters: uiState.filters,
    }),
    [uiState.page, uiState.limit, uiState.search, uiState.filters],
  )

  // Check if we're debouncing
  const isDebouncing =
    JSON.stringify(confirmedState) !== JSON.stringify(uiState)

  // Stable context value
  const value = useMemo(
    (): URLStateContextValue => ({
      queryState,
      uiState: memoizedUIState,
      isDebouncing,
      setPage,
      setLimit,
      setSearch,
      setFilters,
      resetToFirstPage,
      clearAllFilters,
      clearSearch,
      nextPage,
      prevPage,
    }),
    [
      queryState,
      memoizedUIState,
      isDebouncing,
      setPage,
      setLimit,
      setSearch,
      setFilters,
      resetToFirstPage,
      clearAllFilters,
      clearSearch,
      nextPage,
      prevPage,
    ],
  )

  return React.createElement(URLStateContext.Provider, { value }, children)
}
