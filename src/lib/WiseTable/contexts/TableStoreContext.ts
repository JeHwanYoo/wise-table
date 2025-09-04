import React from 'react'

export interface TableStoreValue {
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
  clear: () => void
}

export const TableStoreContext = React.createContext<TableStoreValue | null>(
  null,
)

export function useTableStore(): TableStoreValue {
  const context = React.useContext(TableStoreContext)
  if (!context) {
    throw new Error('useTableStore must be used within TableStoreProvider')
  }
  return context
}
