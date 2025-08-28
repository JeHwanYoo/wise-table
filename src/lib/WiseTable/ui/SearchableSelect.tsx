import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getBadgeColor, getBadgeColorFrom } from '../utils/badgeColors'
import { ChevronDownIcon } from './Icons'

export interface SearchableSelectOption {
  value: string | number
  label: string
  badge?: {
    color: import('../utils/badgeColors').BaseColor
    intensity: import('../utils/badgeColors').IntensityLevel
  }
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string | number | Array<string | number>
  onChange: (value: string | number | Array<string | number>) => void
  onBlur?: () => void
  placeholder?: string
  multiple?: boolean
  searchable?: boolean
  disabled?: boolean
  className?: string
  /** Dropdown panel placement direction. Default is 'bottom'. */
  placement?: 'bottom' | 'top'
  /** Whether to render colored badges for options and selected display. */
  useBadge?: boolean
  /** Custom renderer for each option (used in selected display and dropdown). */
  renderOption?: (
    option: SearchableSelectOption,
    state: { selected: boolean; focused: boolean },
  ) => React.ReactNode
}

export const SearchableSelect = React.memo(function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select...',
  multiple = false,
  searchable = true,
  disabled = false,
  className = '',
  placement = 'bottom',
  useBadge = true,
  renderOption,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [panelStyle, setPanelStyle] = useState<{
    top: number
    left: number
    triggerWidth: number
  }>({ top: 0, left: 0, triggerWidth: 0 })

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : options

  const selectedOptions = multiple
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.value))
    : options.filter((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef.current
      const panel = panelRef.current
      const target = event.target as Node
      const insideContainer = !!(container && container.contains(target))
      const insidePanel = !!(panel && panel.contains(target))
      if (insideContainer || insidePanel) return
      setIsOpen(false)
      setSearchTerm('')
      onBlur?.()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  useEffect(() => {
    if (!isOpen) return
    const update = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const estimatedHeight = panelRef.current?.offsetHeight ?? 240
      const topPos =
        placement === 'top'
          ? rect.top + window.scrollY - 4 - estimatedHeight
          : rect.bottom + window.scrollY + 4
      setPanelStyle({
        top: topPos,
        left: rect.left + window.scrollX,
        triggerWidth: rect.width,
      })
    }
    // Run twice to catch initial mount and content size changes
    update()
    requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, placement, searchTerm, options])

  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setIsOpen(false)
      setSearchTerm('')
      onBlur?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) =>
            Math.min(prev + 1, filteredOptions.length - 1),
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex].value)
        } else {
          setIsOpen(!isOpen)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        onBlur?.()
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const renderSelectedDisplay = () => {
    if (multiple && selectedOptions.length > 0) {
      if (renderOption || !useBadge) {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <span key={option.value} className="text-xs">
                {renderOption
                  ? renderOption(option, { selected: true, focused: false })
                  : option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(option.value)
                  }}
                  className="ml-1 text-xs hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )
      }
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => {
            const originalIndex = options.findIndex(
              (opt) => opt.value === option.value,
            )
            const colorScheme = option.badge
              ? getBadgeColorFrom(option.badge.color, option.badge.intensity)
              : getBadgeColor(originalIndex >= 0 ? originalIndex : 0)

            return (
              <span
                key={option.value}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorScheme.bg} ${colorScheme.text}`}
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(option.value)
                  }}
                  className="ml-1 text-xs hover:text-red-600"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )
    } else if (!multiple && selectedOptions.length > 0) {
      const option = selectedOptions[0]
      if (renderOption || !useBadge) {
        return (
          <span className="text-sm">
            {renderOption
              ? renderOption(option, { selected: true, focused: false })
              : option.label}
          </span>
        )
      }
      const originalIndex = options.findIndex(
        (opt) => opt.value === option.value,
      )
      const colorScheme = option.badge
        ? getBadgeColorFrom(option.badge.color, option.badge.intensity)
        : getBadgeColor(originalIndex >= 0 ? originalIndex : 0)

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorScheme.bg} ${colorScheme.text}`}
        >
          {option.label}
        </span>
      )
    }

    return (
      <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`min-h-[36px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between dark:bg-gray-800 dark:border-gray-700 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/60'
            : 'hover:border-gray-400 dark:hover:border-gray-600'
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500 dark:ring-blue-600 dark:border-blue-600' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex-1 min-w-0">{renderSelectedDisplay()}</div>

        <ChevronDownIcon
          className={`text-gray-400 transition-transform dark:text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[2000] dark:bg-gray-800 dark:border-gray-700"
            style={{
              top: panelStyle.top,
              left: panelStyle.left,
              minWidth: panelStyle.triggerWidth,
              width: 'max-content',
            }}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
            )}

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : option.value === value
                  const isFocused = index === focusedIndex
                  const originalIndex = options.findIndex(
                    (opt) => opt.value === option.value,
                  )
                  const colorScheme = option.badge
                    ? getBadgeColorFrom(
                        option.badge.color,
                        option.badge.intensity,
                      )
                    : getBadgeColor(originalIndex >= 0 ? originalIndex : index)

                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                        isFocused
                          ? 'bg-blue-50 dark:bg-blue-800/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      } ${isSelected ? 'bg-blue-100 dark:bg-blue-800/40' : ''}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {renderOption || !useBadge ? (
                        <span className="text-sm whitespace-pre-wrap">
                          {renderOption
                            ? renderOption(option, {
                                selected: isSelected,
                                focused: isFocused,
                              })
                            : option.label}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorScheme.bg} ${colorScheme.text}`}
                        >
                          {option.label}
                        </span>
                      )}

                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
})
