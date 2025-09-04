import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { CloseIcon, SearchIcon } from './Icons'

export interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Type to search...',
  className,
}: SearchBoxProps) {
  // Keep local state for smooth typing; mirror external value
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep input focused across parent re-renders
  useEffect(() => {
    const el = inputRef.current
    if (!el) {
      if (inputValue !== value) setInputValue(value)
      return
    }
    const isFocused = document.activeElement === el
    const start = el.selectionStart
    const end = el.selectionEnd
    if (inputValue !== value) {
      setInputValue(value)
      if (isFocused) {
        requestAnimationFrame(() => {
          try {
            el.setSelectionRange(start ?? value.length, end ?? value.length)
          } catch {
            /* ignore */
          }
        })
      }
    }
  }, [value, inputValue])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      // Immediate update to UI state; Provider applies debounce for URL/query
      onChange(newValue)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [onChange])

  return (
    <div className={`relative ${className || ''}`}>
      {/* Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-300">
        <SearchIcon />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full max-w-sm pl-9 pr-9 py-2 text-gray-800 text-sm bg-white border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
      />

      {/* Clear button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <CloseIcon size="sm" />
        </button>
      )}
    </div>
  )
}
