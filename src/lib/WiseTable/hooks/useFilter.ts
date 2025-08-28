import { useContext } from 'react'
import {
  FilterContext,
  type FilterContextValue,
} from '../contexts/FilterContext'

export function useFilter(): FilterContextValue {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider')
  }
  return context
}
