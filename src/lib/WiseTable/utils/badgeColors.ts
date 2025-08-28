/**
 * Badge color utility
 * - Colors traverse a shuffled BASE_COLORS order (offset + stride) to avoid adjacent similar hues
 * - Tones cycle independently through INTENSITY_LEVELS (800 → 100)
 * - Input is the option index; the same index always maps to the same badge colors
 */

export interface BadgeColorScheme {
  bg: string
  text: string
}

// Base color palette
export const BASE_COLORS = [
  'violet', // 0: Violet (shortest wavelength)
  'purple', // 1: Purple
  'indigo', // 2: Indigo
  'blue', // 3: Blue
  'sky', // 4: Sky blue
  'cyan', // 5: Cyan
  'teal', // 6: Teal
  'emerald', // 7: Emerald
  'green', // 8: Green
  'lime', // 9: Lime
  'yellow', // 10: Yellow
  'amber', // 11: Amber
  'orange', // 12: Orange
  'red', // 13: Red
  'rose', // 14: Rose
  'pink', // 15: Pink
  'fuchsia', // 16: Fuchsia
] as const

// Intensity levels from dark to light (800 -> 100)
export const INTENSITY_LEVELS = [
  800, 700, 600, 500, 400, 300, 200, 100,
] as const

export type BaseColor = (typeof BASE_COLORS)[number]
export type IntensityLevel = (typeof INTENSITY_LEVELS)[number]

/**
 * Calculate color scheme from index (shuffled order for better separation)
 */
function calculateColorScheme(index: number): BadgeColorScheme {
  const colorCount = BASE_COLORS.length
  const intensityCount = INTENSITY_LEVELS.length

  // Shuffle parameters
  const START_OFFSET = Math.max(0, colorCount - 4) // start near the end (e.g., red/rose/pink/fuchsia)
  const STRIDE = 5 // coprime to 17 → full permutation

  // Shuffled color index for better visual separation
  const unpermuted = index % colorCount
  const colorIndex = (START_OFFSET + unpermuted * STRIDE) % colorCount

  // Intensity cycles independently to provide tone variety
  const intensityIndex = Math.floor(index / colorCount) % intensityCount

  const baseColor = BASE_COLORS[colorIndex]
  const bgIntensity = INTENSITY_LEVELS[intensityIndex]
  const textIntensity = bgIntensity <= 400 ? 800 : 100

  return {
    bg: `bg-${baseColor}-${bgIntensity}`,
    text: `text-${baseColor}-${textIntensity}`,
  }
}

// Only support index-based color selection
export function getBadgeColor(optionIndex: number): BadgeColorScheme {
  return calculateColorScheme(optionIndex)
}

/**
 * Build a color scheme from explicit color and intensity.
 */
export function getBadgeColorFrom(
  color: BaseColor,
  intensity: IntensityLevel,
): BadgeColorScheme {
  const textIntensity = intensity <= 400 ? 800 : 100
  return {
    bg: `bg-${color}-${intensity}`,
    text: `text-${color}-${textIntensity}`,
  }
}

// Static safelist of all bg/text combinations used by badges.
export const BADGE_CLASS_SAFELIST: string[] = [
  // 800
  'bg-violet-800 text-violet-100',
  'bg-purple-800 text-purple-100',
  'bg-indigo-800 text-indigo-100',
  'bg-blue-800 text-blue-100',
  'bg-sky-800 text-sky-100',
  'bg-cyan-800 text-cyan-100',
  'bg-teal-800 text-teal-100',
  'bg-emerald-800 text-emerald-100',
  'bg-green-800 text-green-100',
  'bg-lime-800 text-lime-100',
  'bg-yellow-800 text-yellow-100',
  'bg-amber-800 text-amber-100',
  'bg-orange-800 text-orange-100',
  'bg-red-800 text-red-100',
  'bg-rose-800 text-rose-100',
  'bg-pink-800 text-pink-100',
  'bg-fuchsia-800 text-fuchsia-100',
  // 700
  'bg-violet-700 text-violet-100',
  'bg-purple-700 text-purple-100',
  'bg-indigo-700 text-indigo-100',
  'bg-blue-700 text-blue-100',
  'bg-sky-700 text-sky-100',
  'bg-cyan-700 text-cyan-100',
  'bg-teal-700 text-teal-100',
  'bg-emerald-700 text-emerald-100',
  'bg-green-700 text-green-100',
  'bg-lime-700 text-lime-100',
  'bg-yellow-700 text-yellow-100',
  'bg-amber-700 text-amber-100',
  'bg-orange-700 text-orange-100',
  'bg-red-700 text-red-100',
  'bg-rose-700 text-rose-100',
  'bg-pink-700 text-pink-100',
  'bg-fuchsia-700 text-fuchsia-100',
  // 600
  'bg-violet-600 text-violet-100',
  'bg-purple-600 text-purple-100',
  'bg-indigo-600 text-indigo-100',
  'bg-blue-600 text-blue-100',
  'bg-sky-600 text-sky-100',
  'bg-cyan-600 text-cyan-100',
  'bg-teal-600 text-teal-100',
  'bg-emerald-600 text-emerald-100',
  'bg-green-600 text-green-100',
  'bg-lime-600 text-lime-100',
  'bg-yellow-600 text-yellow-100',
  'bg-amber-600 text-amber-100',
  'bg-orange-600 text-orange-100',
  'bg-red-600 text-red-100',
  'bg-rose-600 text-rose-100',
  'bg-pink-600 text-pink-100',
  'bg-fuchsia-600 text-fuchsia-100',
  // 500
  'bg-violet-500 text-violet-100',
  'bg-purple-500 text-purple-100',
  'bg-indigo-500 text-indigo-100',
  'bg-blue-500 text-blue-100',
  'bg-sky-500 text-sky-100',
  'bg-cyan-500 text-cyan-100',
  'bg-teal-500 text-teal-100',
  'bg-emerald-500 text-emerald-100',
  'bg-green-500 text-green-100',
  'bg-lime-500 text-lime-100',
  'bg-yellow-500 text-yellow-100',
  'bg-amber-500 text-amber-100',
  'bg-orange-500 text-orange-100',
  'bg-red-500 text-red-100',
  'bg-rose-500 text-rose-100',
  'bg-pink-500 text-pink-100',
  'bg-fuchsia-500 text-fuchsia-100',
  // 400 (light background → dark text)
  'bg-violet-400 text-violet-800',
  'bg-purple-400 text-purple-800',
  'bg-indigo-400 text-indigo-800',
  'bg-blue-400 text-blue-800',
  'bg-sky-400 text-sky-800',
  'bg-cyan-400 text-cyan-800',
  'bg-teal-400 text-teal-800',
  'bg-emerald-400 text-emerald-800',
  'bg-green-400 text-green-800',
  'bg-lime-400 text-lime-800',
  'bg-yellow-400 text-yellow-800',
  'bg-amber-400 text-amber-800',
  'bg-orange-400 text-orange-800',
  'bg-red-400 text-red-800',
  'bg-rose-400 text-rose-800',
  'bg-pink-400 text-pink-800',
  'bg-fuchsia-400 text-fuchsia-800',
  // 300
  'bg-violet-300 text-violet-800',
  'bg-purple-300 text-purple-800',
  'bg-indigo-300 text-indigo-800',
  'bg-blue-300 text-blue-800',
  'bg-sky-300 text-sky-800',
  'bg-cyan-300 text-cyan-800',
  'bg-teal-300 text-teal-800',
  'bg-emerald-300 text-emerald-800',
  'bg-green-300 text-green-800',
  'bg-lime-300 text-lime-800',
  'bg-yellow-300 text-yellow-800',
  'bg-amber-300 text-amber-800',
  'bg-orange-300 text-orange-800',
  'bg-red-300 text-red-800',
  'bg-rose-300 text-rose-800',
  'bg-pink-300 text-pink-800',
  'bg-fuchsia-300 text-fuchsia-800',
  // 200
  'bg-violet-200 text-violet-800',
  'bg-purple-200 text-purple-800',
  'bg-indigo-200 text-indigo-800',
  'bg-blue-200 text-blue-800',
  'bg-sky-200 text-sky-800',
  'bg-cyan-200 text-cyan-800',
  'bg-teal-200 text-teal-800',
  'bg-emerald-200 text-emerald-800',
  'bg-green-200 text-green-800',
  'bg-lime-200 text-lime-800',
  'bg-yellow-200 text-yellow-800',
  'bg-amber-200 text-amber-800',
  'bg-orange-200 text-orange-800',
  'bg-red-200 text-red-800',
  'bg-rose-200 text-rose-800',
  'bg-pink-200 text-pink-800',
  'bg-fuchsia-200 text-fuchsia-800',
  // 100
  'bg-violet-100 text-violet-800',
  'bg-purple-100 text-purple-800',
  'bg-indigo-100 text-indigo-800',
  'bg-blue-100 text-blue-800',
  'bg-sky-100 text-sky-800',
  'bg-cyan-100 text-cyan-800',
  'bg-teal-100 text-teal-800',
  'bg-emerald-100 text-emerald-800',
  'bg-green-100 text-green-800',
  'bg-lime-100 text-lime-800',
  'bg-yellow-100 text-yellow-800',
  'bg-amber-100 text-amber-800',
  'bg-orange-100 text-orange-800',
  'bg-red-100 text-red-800',
  'bg-rose-100 text-rose-800',
  'bg-pink-100 text-pink-800',
  'bg-fuchsia-100 text-fuchsia-800',
]
