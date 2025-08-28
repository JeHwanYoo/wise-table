// Common column types supported by WiseTable
export type ColumnType =
  | 'text'
  | 'textArea'
  | 'number'
  | 'currency'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'hidden'

// Currency formatting options
export interface CurrencyOptions {
  currency?: string // e.g., 'USD', 'EUR', 'KRW'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

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
