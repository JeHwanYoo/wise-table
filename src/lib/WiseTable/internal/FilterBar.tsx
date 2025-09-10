import React, { useState } from 'react'
import { useFilter } from '../hooks/useFilter'
import { useURLState } from '../hooks/useURLState'
import { useEditingContext } from '../hooks/useWiseTable'
import { CloseIcon, SearchBox, SearchableSelect, WiseTableButton } from '../ui'

// Active filter display type
type ActiveFilter = {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'
  // mutually exclusive by type
  value?: string
  bool?: boolean
  start?: string
  end?: string
}

export interface FilterBarProps {
  className?: string
}

export const FilterBar = React.memo(function FilterBar({
  className = '',
}: FilterBarProps) {
  const { hasUnsavedChanges, discardChanges } = useEditingContext()
  const filter = useFilter()
  const urlState = useURLState()

  const [selectedKey, setSelectedKey] = useState<string>(
    filter.filterOptions.fields[0]?.key as string,
  )
  const [value, setValue] = useState<string>('')
  const [boolValue, setBoolValue] = useState<boolean>(false)
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')

  // Pre-compute all field options to ensure hooks are called unconditionally
  const fieldOptionsResults: Record<
    string,
    Array<{ label: string; value: string | number | boolean }>
  > = {}

  filter.filterOptions.fields.forEach((field) => {
    if (field.useOptions) {
      try {
        fieldOptionsResults[field.key as string] = field.useOptions()
      } catch {
        fieldOptionsResults[field.key as string] = []
      }
    } else {
      fieldOptionsResults[field.key as string] = field.options || []
    }
  })

  // Convert current filters to active filter array
  const activeFilters: ActiveFilter[] = []
  Object.entries(urlState.queryState.filters).forEach(([key, value]) => {
    const field = filter.filterOptions.fields.find(
      (f: {
        key: string
        type: 'string' | 'number' | 'date' | 'boolean' | 'select'
        label: string
      }) => f.key === key,
    )
    if (!field) return

    if (field.type === 'date' && Array.isArray(value)) {
      // Handle date array: [startDate, endDate]
      activeFilters.push({
        key,
        label: field.label,
        type: 'date',
        start: value[0] || '',
        end: value[1] || '',
      })
    } else if (field.type === 'boolean') {
      activeFilters.push({
        key,
        label: field.label,
        type: 'boolean',
        bool: Boolean(value),
      })
    } else {
      activeFilters.push({
        key,
        label: field.label,
        type: field.type,
        value: String(value),
      })
    }
  })

  if (!filter.enableFilters) return null

  // Check if current filter input has valid value
  const canAddFilter = () => {
    const field = filter.filterOptions.fields.find((f) => f.key === selectedKey)
    if (!field || !selectedKey) return false

    if (field.type === 'boolean') {
      return true // Boolean always has a value
    } else if (field.type === 'date') {
      return dateStart.trim() !== '' || dateEnd.trim() !== ''
    } else {
      return value.trim() !== ''
    }
  }

  const handleAddFilter = () => {
    const field = filter.filterOptions.fields.find((f) => f.key === selectedKey)
    if (!field || !selectedKey) return

    if (field.type === 'boolean') {
      filter.updateFilter(selectedKey, boolValue)
    } else if (field.type === 'date') {
      // Store date as array: always [startDate, endDate] format
      const dateRange = [dateStart || '', dateEnd || '']
      // Only update if at least one date is provided
      if (dateRange.some((date) => date !== '')) {
        filter.updateFilter(selectedKey, dateRange)
      }
    } else {
      // For select and other types, ensure we have a valid non-empty value
      const trimmedValue = value.trim()
      if (trimmedValue && trimmedValue !== '') {
        filter.updateFilter(selectedKey, trimmedValue)
      }
    }

    // Reset form
    setValue('')
    setBoolValue(false)
    setDateStart('')
    setDateEnd('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFilter()
    }
  }

  const removeFilter = (filterToRemove: ActiveFilter) => {
    // For all filter types including date arrays, just remove the key
    filter.removeFilter(filterToRemove.key)
  }

  const getDisplayValue = (activeFilter: ActiveFilter): string => {
    if (activeFilter.type === 'boolean') {
      return activeFilter.bool ? 'True' : 'False'
    }
    if (activeFilter.type === 'date') {
      const parts = []
      if (activeFilter.start) parts.push(`From: ${activeFilter.start}`)
      if (activeFilter.end) parts.push(`To: ${activeFilter.end}`)
      return parts.join(', ')
    }
    if (activeFilter.type === 'select') {
      // Find the corresponding field to get options
      const field = filter.filterOptions.fields.find(
        (f) => f.key === activeFilter.key,
      )
      if (field) {
        // Handle static array and hook-based options
        let options: Array<{
          label: string
          value: string | number | boolean
        }> = []

        // Get pre-computed options from fieldOptionsResults
        options = fieldOptionsResults[field.key as string] || []

        const option = options.find(
          (opt: { label: string; value: string | number | boolean }) =>
            String(opt.value) === String(activeFilter.value),
        )
        return option?.label || String(activeFilter.value || '')
      }
    }
    return activeFilter.value || ''
  }

  const selectedField = filter.filterOptions.fields.find(
    (f) => f.key === selectedKey,
  )

  const renderFilterInput = () => {
    if (!selectedField) return null

    switch (selectedField.type) {
      case 'boolean':
        return (
          <select
            value={boolValue ? 'true' : 'false'}
            onChange={(e) => setBoolValue(e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        )

      case 'select': {
        // Get pre-computed options from fieldOptionsResults
        const options = fieldOptionsResults[selectedField.key as string] || []

        // Convert to SearchableSelect format
        const searchableOptions = options.map((option) => ({
          label: option.label,
          value: option.value as string | number, // SearchableSelect expects string | number
        }))

        return (
          <SearchableSelect
            options={searchableOptions}
            value={value}
            onChange={(newValue) => setValue(String(newValue))}
            placeholder="Select..."
            searchable={true}
            useBadge={false}
            className="min-w-0 max-w-xs"
          />
        )
      }

      case 'date':
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              placeholder="From"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              placeholder="To"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedField.placeholder || 'Enter number...'}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedField.placeholder || 'Enter value...'}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />
        )
    }
  }

  return (
    <div
      className={`p-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800 ${className}`}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {filter.useSearch && (
            <SearchBox
              value={filter.searchValue}
              onChange={filter.updateSearch}
              placeholder={filter.searchPlaceholder}
              className="flex-1 min-w-64"
            />
          )}

          {filter.filterOptions.fields.length > 0 && (
            <>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-32 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              >
                <option value="">Select field...</option>
                {filter.filterOptions.fields.map(
                  (field: { key: string; label: string }) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ),
                )}
              </select>

              {renderFilterInput()}

              <WiseTableButton
                onClick={handleAddFilter}
                disabled={!selectedKey || !canAddFilter()}
              >
                Add Filter
              </WiseTableButton>

              {activeFilters.length > 0 && (
                <WiseTableButton
                  onClick={filter.clearAllFilters}
                  variant="secondary"
                >
                  Clear All
                </WiseTableButton>
              )}
            </>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((activeFilter, index) => (
              <div
                key={`${activeFilter.key}-${index}`}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-700/30 dark:text-blue-200"
              >
                <span className="font-medium">{activeFilter.label}:</span>
                <span className="ml-1">{getDisplayValue(activeFilter)}</span>
                <WiseTableButton
                  variant="ghost"
                  size="xs"
                  onClick={() => removeFilter(activeFilter)}
                  aria-label={`Remove ${activeFilter.label} filter`}
                  className="ml-1 !p-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  <CloseIcon size="sm" />
                </WiseTableButton>
              </div>
            ))}
          </div>
        )}

        {hasUnsavedChanges() && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-800 dark:bg-yellow-700/20 dark:border-yellow-600 dark:text-yellow-300">
            <svg
              className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">You have unsaved changes</span>
            <WiseTableButton
              onClick={discardChanges}
              size="sm"
              variant="secondary"
              className="ml-auto"
            >
              Discard Changes
            </WiseTableButton>
          </div>
        )}
      </div>
    </div>
  )
})
