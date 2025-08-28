import React, { useMemo, useState } from 'react'
import {
  LoadingStateContext,
  type LoadingStateContextValue,
} from '../contexts/LoadingStateContext.ts'

export function LoadingStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isQuerying, setQuerying] = useState(false)
  const [isCreating, setCreating] = useState(false)
  const [isUpdating, setUpdating] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  const value = useMemo((): LoadingStateContextValue => {
    const isAnyLoading = isQuerying || isCreating || isUpdating || isDeleting

    return {
      isQuerying,
      isCreating,
      isUpdating,
      isDeleting,
      isAnyLoading,
      setQuerying,
      setCreating,
      setUpdating,
      setDeleting,
    }
  }, [isQuerying, isCreating, isUpdating, isDeleting])

  return React.createElement(LoadingStateContext.Provider, { value }, children)
}
