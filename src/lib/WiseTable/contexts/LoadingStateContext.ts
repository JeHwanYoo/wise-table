import { createContext } from 'react'

export interface LoadingStateContextValue {
  isQuerying: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isAnyLoading: boolean
  setQuerying: (loading: boolean) => void
  setCreating: (loading: boolean) => void
  setUpdating: (loading: boolean) => void
  setDeleting: (loading: boolean) => void
}

export const LoadingStateContext =
  createContext<LoadingStateContextValue | null>(null)
