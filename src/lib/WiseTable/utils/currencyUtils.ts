/**
 * Format number as currency with commas
 */
export function formatCurrency(
  value: number | string | null | undefined,
  locale: string = 'en-US',
  options: {
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string {
  if (value === null || value === undefined || value === '') {
    const defaultCurrency = options.currency || 'USD'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: defaultCurrency,
    }).format(0)
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) {
    const defaultCurrency = options.currency || 'USD'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: defaultCurrency,
    }).format(0)
  }

  // Format with locale and currency options
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: options.currency || 'USD',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(numValue)
}

/**
 * Parse currency input (remove commas, handle +/- signs)
 */
export function parseCurrencyInput(input: string): number {
  if (!input || input.trim() === '') {
    return 0
  }

  // Remove all non-digit characters except +, -, and decimal point
  const cleaned = input.replace(/[^0-9+\-.]/g, '')
  const numValue = parseFloat(cleaned)

  return isNaN(numValue) ? 0 : numValue
}

/**
 * Validate currency input (allow numbers, +, -, decimal point)
 */
export function isValidCurrencyInput(input: string): boolean {
  // Allow empty string
  if (input === '') return true

  // Allow only numbers, +, -, and decimal point
  const currencyRegex = /^[+-]?\d*\.?\d*$/
  return currencyRegex.test(input)
}

/**
 * Format currency input for editing (no commas, preserve +/-)
 */
export function formatCurrencyForEditing(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) {
    return ''
  }

  return String(numValue)
}
