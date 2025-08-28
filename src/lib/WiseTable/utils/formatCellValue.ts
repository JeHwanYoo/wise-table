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
  return value
}