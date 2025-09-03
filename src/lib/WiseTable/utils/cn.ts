import clsx, { type ClassValue } from 'clsx'

/**
 * Utility function to combine class names
 * Uses clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
