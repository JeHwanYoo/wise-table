import type { Locale } from 'date-fns'
import { format, isValid, parse, parseISO } from 'date-fns'

/**
 * Format date using date-fns format string
 */
export function formatDate(
  value: string | Date | null | undefined,
  dateFormat: string = 'yyyy-MM-dd',
  locale?: Locale,
): string {
  if (!value) {
    return ''
  }

  let date: Date

  if (typeof value === 'string') {
    // Try parsing ISO string first
    date = parseISO(value)
    if (!isValid(date)) {
      // If not ISO, try parsing with common formats including Korean format
      const commonFormats = [
        'yyyy-MM-dd',
        'yyyy. MM. dd',
        'yyyy. M. d',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'MM-dd-yyyy',
      ]
      for (const fmt of commonFormats) {
        try {
          date = parse(value, fmt, new Date())
          if (isValid(date)) break
        } catch {
          continue
        }
      }
    }
  } else {
    date = value
  }

  if (!isValid(date)) {
    return value?.toString() || ''
  }

  try {
    return format(date, dateFormat, { locale })
  } catch {
    return value?.toString() || ''
  }
}

/**
 * Parse date input string to Date object
 */
export function parseDateInput(
  input: string,
  dateFormat: string = 'yyyy-MM-dd',
): Date | null {
  if (!input || input.trim() === '') {
    return null
  }

  try {
    // Try parsing with the specified format first
    let date = parse(input, dateFormat, new Date())
    if (isValid(date)) {
      return date
    }

    // Try parsing as ISO string
    date = parseISO(input)
    if (isValid(date)) {
      return date
    }

    // Try common formats as fallback including Korean format
    const commonFormats = [
      'yyyy-MM-dd',
      'yyyy. MM. dd',
      'yyyy. M. d',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'MM-dd-yyyy',
    ]
    for (const fmt of commonFormats) {
      try {
        date = parse(input, fmt, new Date())
        if (isValid(date)) {
          return date
        }
      } catch {
        continue
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Format date for editing (use specified format or default)
 */
export function formatDateForEditing(
  value: string | Date | null | undefined,
  dateFormat: string = 'yyyy-MM-dd',
): string {
  if (!value) {
    return ''
  }

  let date: Date

  if (typeof value === 'string') {
    date = parseISO(value)
    if (!isValid(date)) {
      // Try parsing with common formats including Korean format
      const commonFormats = [
        'yyyy-MM-dd',
        'yyyy. MM. dd',
        'yyyy. M. d',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
      ]
      for (const fmt of commonFormats) {
        try {
          date = parse(value, fmt, new Date())
          if (isValid(date)) break
        } catch {
          continue
        }
      }
    }
  } else {
    date = value
  }

  if (!isValid(date)) {
    return value?.toString() || ''
  }

  try {
    return format(date, dateFormat)
  } catch {
    return value?.toString() || ''
  }
}

/**
 * Convert Date to local date string (yyyy-MM-dd) without timezone conversion
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Validate date input format
 */
export function isValidDateInput(
  input: string,
  dateFormat: string = 'yyyy-MM-dd',
): boolean {
  if (!input || input.trim() === '') {
    return true // Empty is valid
  }

  const date = parseDateInput(input, dateFormat)
  return date !== null
}

/**
 * Normalize date string to ISO format for comparison
 */
export function normalizeDateString(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return ''
  }

  let date: Date

  if (typeof value === 'string') {
    // Try parsing ISO string first
    date = parseISO(value)
    if (!isValid(date)) {
      // Try parsing with common formats including Korean format
      const commonFormats = [
        'yyyy-MM-dd',
        'yyyy. MM. dd',
        'yyyy. M. d',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'MM-dd-yyyy',
      ]
      for (const fmt of commonFormats) {
        try {
          date = parse(value, fmt, new Date())
          if (isValid(date)) break
        } catch {
          continue
        }
      }
    }
  } else {
    date = value
  }

  if (!isValid(date)) {
    return value?.toString() || ''
  }

  // Return ISO date string for consistent comparison
  return format(date, 'yyyy-MM-dd')
}
