import { useRenderContext } from '../contexts/RenderContext'
import { useEditingContext } from './useWiseTable'

/**
 * Hook for setting column values in the current editing context
 * Must be used inside a render function to automatically infer row context.
 */
export function useSetColumn<T = unknown>() {
  const { commitEdit } = useEditingContext<T>()
  const renderContext = useRenderContext<T>()

  if (!renderContext) {
    throw new Error(
      'useSetColumn must be used within a render function context',
    )
  }

  const setColumn = (value: T[keyof T]) => {
    // Prefer the render-scoped update function when available (e.g., CreateModal)
    if (renderContext.updateFunction) {
      ;(renderContext.updateFunction as (v: T[keyof T]) => void)(value)
      return
    }

    // Fallback to editing-context commit (inline table editing)
    commitEdit(
      renderContext.rowId,
      renderContext.columnKey,
      value,
      renderContext.originalRow,
    )
  }

  return setColumn
}
