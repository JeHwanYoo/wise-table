import React, { useMemo, useRef } from 'react'
import {
  TableStoreContext,
  type TableStoreValue,
} from '../contexts/TableStoreContext'

interface TableStoreProviderProps {
  children: React.ReactNode
}

export function TableStoreProvider({ children }: TableStoreProviderProps) {
  const storeRef = useRef<Record<string, unknown>>({})

  const value: TableStoreValue = useMemo(
    () => ({
      get: (key: string) => storeRef.current[key],
      set: (key: string, v: unknown) => {
        storeRef.current[key] = v
      },
      clear: () => {
        storeRef.current = {}
      },
    }),
    [],
  )

  return (
    <TableStoreContext.Provider value={value}>
      {children}
    </TableStoreContext.Provider>
  )
}
