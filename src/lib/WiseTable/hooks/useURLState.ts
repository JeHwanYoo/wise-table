import { useContext } from 'react'
import {
  URLStateContext,
  type URLState,
  type URLStateContextValue,
} from '../contexts/URLStateContext'

export type { URLState, URLStateContextValue }

export function useURLState(): URLStateContextValue {
  const context = useContext(URLStateContext)
  if (!context) {
    throw new Error('useURLState must be used within URLStateProvider')
  }
  return context
}
