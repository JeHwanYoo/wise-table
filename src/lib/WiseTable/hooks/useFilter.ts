import { useContext } from 'react'
import {
  FilterContext,
  type FilterContextValue,
} from '../contexts/FilterContext'

export function useFilter<
  TQueryDTO = Record<string, unknown>,
>(): FilterContextValue<TQueryDTO> {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider')
  }
  return context as FilterContextValue<TQueryDTO>
}
