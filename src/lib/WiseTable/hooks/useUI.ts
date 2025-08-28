import { useContext } from 'react'
import { UIContext, type UIContextValue } from '../contexts/UIContext'

export function useUI(): UIContextValue {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
