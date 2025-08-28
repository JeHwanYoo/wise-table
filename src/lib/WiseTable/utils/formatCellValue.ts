import { normalizeDateString } from './dateUtils'

/**
 * Format cell values for display in table cells
 * Handles various data types and provides consistent formatting
 */
export function formatCellValue(value: unknown): string {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return ''
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Active' : 'Inactive'
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Check if it's an integer
    if (Number.isInteger(value)) {
      return value.toString()
    }
    // Format floating point numbers to 2 decimal places
    return value.toFixed(2)
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  // Handle objects (convert to JSON string)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }

  // Handle strings and other types
  return String(value)
}

export function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return ''

  // Normalize Date objects to a stable yyyy-MM-dd string
  if (value instanceof Date) {
    return normalizeDateString(value)
  }

  // Normalize likely date strings to a stable yyyy-MM-dd string
  if (typeof value === 'string') {
    // Korean date format pattern: YYYY. M. D or YYYY. MM. DD
    const koreanDatePattern = /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}$/
    // ISO date pattern: YYYY-MM-DD
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

    if (koreanDatePattern.test(value) || isoDatePattern.test(value)) {
      const normalized = normalizeDateString(value)
      return normalized || value
    }
  }

  return value
}
