import type { WiseTableColumn } from '../internal/WiseTableCore'

/**
 * Helper function to define multiple columns with proper type inference
 * Ensures that each column's render function has the correct type
 */
export function defineColumns<T>(
  ...columns: {
    [K in keyof T]: WiseTableColumn<T, K>
  }[keyof T][]
): WiseTableColumn<T>[] {
  return columns
}
