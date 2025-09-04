import React from 'react'

export interface RenderContextValue<T = unknown> {
  rowId: string | number
  columnKey: keyof T
  originalRow: T
  rowIndex: number
  updateFunction?: (value: T[keyof T]) => void
}

export const RenderContext = React.createContext<{
  rowId: string | number
  columnKey: string | number | symbol
  originalRow: unknown
  rowIndex: number
  updateFunction?: <T>(value: T[keyof T]) => void
} | null>(null)

export function useRenderContext<T = unknown>(): RenderContextValue<T> | null {
  return React.useContext(RenderContext) as RenderContextValue<T> | null
}
