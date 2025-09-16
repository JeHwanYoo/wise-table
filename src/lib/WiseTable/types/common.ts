// Common column types supported by WiseTable
export type ColumnType =
  | 'text'
  | 'textArea'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'hidden'

// Option for dropdown selections (boolean/enum columns)
export interface SelectOption<T = unknown> {
  label: string
  value: T
  /** Optional explicit badge color override */
  badge?: {
    color: import('../utils/badgeColors').BaseColor
    intensity: import('../utils/badgeColors').IntensityLevel
  }
}

// Pagination interface
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Pagination configuration for WiseTable
export interface PaginationConfig {
  initialPageNumber?: number // default: 1
  initialLimitSize?: number // default: 25
  maxLimitSize?: number // default: 100
}
