import { type ReactNode } from 'react'
import type { ZodType } from 'zod'
import type { PagedData } from '../hooks/useWiseTable'
import { CRUDActionsContext, type CRUDActions } from '../hooks/useWiseTable'

interface CRUDActionsProviderProps<
  T = unknown,
  TCreate = unknown,
  TQuerySchema extends ZodType | undefined = undefined,
  TData = PagedData<T>,
> {
  children: ReactNode
  actions: CRUDActions<T, TCreate, TQuerySchema, TData>
}

export function CRUDActionsProvider<
  T = unknown,
  TCreate = unknown,
  TQuerySchema extends ZodType | undefined = undefined,
  TData = PagedData<T>,
>({
  children,
  actions,
}: CRUDActionsProviderProps<T, TCreate, TQuerySchema, TData>) {
  return (
    <CRUDActionsContext.Provider
      value={
        actions as CRUDActions<unknown, unknown, undefined, PagedData<unknown>>
      }
    >
      {children}
    </CRUDActionsContext.Provider>
  )
}
