import { useContext } from 'react'
import {
  LoadingStateContext,
  type LoadingStateContextValue,
} from '../contexts/LoadingStateContext'

export type { LoadingStateContextValue }

export function useLoadingState(): LoadingStateContextValue {
  const context = useContext(LoadingStateContext)
  if (!context) {
    throw new Error('useLoadingState must be used within LoadingStateProvider')
  }
  return context
}
