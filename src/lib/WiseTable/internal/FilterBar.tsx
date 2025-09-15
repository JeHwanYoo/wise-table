import React, { useEffect, useState } from 'react'
import { useFilter } from '../hooks/useFilter'
import { useURLState } from '../hooks/useURLState'
import { useEditingContext } from '../hooks/useWiseTable'
import { CloseIcon, SearchBox, SearchableSelect, WiseTableButton } from '../ui'

// Active filter display type
type ActiveFilter = {
  key: string
  label: string
  type: 'string' | 'number' | 'date-range' | 'boolean' | 'select'
  // mutually exclusive by type
  value?: string
  bool?: boolean
  dateType?: string
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

  // Individual states for each field (for grid layout)
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})

  // Initialize field values from current URL state filters
  useEffect(() => {
    const initialValues: Record<string, unknown> = {}
    Object.entries(urlState.queryState.filters).forEach(([key, value]) => {
      initialValues[key] = value
    })
    setFieldValues(initialValues)
  }, [urlState.queryState.filters])

  // Update field value for specific field
  const updateFieldValue = (fieldKey: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }))
  }

  // Get current value for a specific field
  const getFieldValue = (fieldKey: string, defaultValue: unknown = '') => {
    const field = filter.filterOptions.fields.find((f) => f.key === fieldKey)

    if (field?.type === 'date-range') {
      // For date-range, construct value from dateType and date parameters
      const dateType =
        urlState.queryState.filters['dateType'] ?? fieldValues['dateType'] ?? ''
      const date =
        urlState.queryState.filters['date'] ?? fieldValues['date'] ?? ''

      if (date && typeof date === 'string') {
        const [startDate, endDate] = date.split(',')
        return {
          dateType: String(dateType),
          startDate: startDate || '',
          endDate: endDate || '',
        }
      }

      // Return from local state if exists
      return (
        fieldValues[fieldKey] ?? {
          dateType: '',
          startDate: '',
          endDate: '',
        }
      )
    }

    // For other field types, use normal lookup
    return (
      urlState.queryState.filters[fieldKey] ??
      fieldValues[fieldKey] ??
      defaultValue
    )
  }

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

  // Handle date-range filters specially (they use dateType + date parameters)
  const dateRangeFields = filter.filterOptions.fields.filter(
    (f: { type: string }) => f.type === 'date-range',
  )

  dateRangeFields.forEach(
    (field: { key: string; label: string; type: string }) => {
      const dateType = urlState.queryState.filters['dateType']
      const date = urlState.queryState.filters['date']

      if (dateType && date) {
        const [start, end] = String(date).split(',')
        activeFilters.push({
          key: field.key,
          label: field.label,
          type: 'date-range',
          dateType: String(dateType),
          start: start || '',
          end: end || '',
        })
      }
    },
  )

  // Handle other filter types
  Object.entries(urlState.queryState.filters).forEach(([key, value]) => {
    // Skip dateType and date as they're handled above
    if (key === 'dateType' || key === 'date') return

    const field = filter.filterOptions.fields.find(
      (f: {
        key: string
        type: 'string' | 'number' | 'date-range' | 'boolean' | 'select'
        label: string
      }) => f.key === key,
    )
    if (!field) return

    if (field.type === 'boolean') {
      activeFilters.push({
        key,
        label: field.label,
        type: 'boolean',
        bool: Boolean(value),
      })
    } else if (field.type !== 'date-range') {
      activeFilters.push({
        key,
        label: field.label,
        type: field.type,
        value: String(value),
      })
    }
  })

  if (!filter.enableFilters) return null

  // Check if field has valid value for filtering
  const canApplyFilter = (fieldKey: string) => {
    const field = filter.filterOptions.fields.find((f) => f.key === fieldKey)
    if (!field) return false

    const value = getFieldValue(fieldKey)

    if (field.type === 'boolean') {
      return true // Boolean always has a value
    } else if (field.type === 'date-range') {
      const dateRangeValue = value as
        | { dateType: string; startDate: string; endDate: string }
        | undefined
      // dateType AND both From and To dates must be present
      return (
        dateRangeValue &&
        dateRangeValue.dateType &&
        dateRangeValue.dateType.trim() !== '' &&
        dateRangeValue.startDate?.trim() &&
        dateRangeValue.endDate?.trim()
      )
    } else if (field.type === 'select') {
      return value !== undefined && value !== ''
    } else {
      return typeof value === 'string' && value.trim() !== ''
    }
  }

  const applyFilter = (fieldKey: string) => {
    const field = filter.filterOptions.fields.find((f) => f.key === fieldKey)
    if (!field || !canApplyFilter(fieldKey)) return

    const value = getFieldValue(fieldKey)

    if (field.type === 'boolean') {
      filter.updateFilter(fieldKey, Boolean(value))
    } else if (field.type === 'date-range') {
      const dateRangeValue = value as {
        dateType: string
        startDate: string
        endDate: string
      }
      if (
        dateRangeValue &&
        dateRangeValue.dateType &&
        dateRangeValue.dateType.trim() !== '' &&
        dateRangeValue.startDate?.trim() &&
        dateRangeValue.endDate?.trim()
      ) {
        // Format: dateType=requestedAt & date=2025-09-30,2025-10-31
        const dateRange = `${dateRangeValue.startDate || ''},${dateRangeValue.endDate || ''}`

        // Update both dateType and date as separate query parameters
        filter.updateFilter('dateType', dateRangeValue.dateType)
        filter.updateFilter('date', dateRange)
      }
    } else if (field.type === 'select') {
      if (value !== undefined && value !== '') {
        filter.updateFilter(fieldKey, value)
      }
    } else {
      const trimmedValue = String(value).trim()
      if (trimmedValue !== '') {
        filter.updateFilter(fieldKey, trimmedValue)
      }
    }
  }

  const clearFilter = (fieldKey: string) => {
    const field = filter.filterOptions.fields.find((f) => f.key === fieldKey)

    if (field?.type === 'date-range') {
      // For date-range, remove both dateType and date parameters
      filter.removeFilter('dateType')
      filter.removeFilter('date')
    } else {
      filter.removeFilter(fieldKey)
    }

    updateFieldValue(fieldKey, '')
  }

  const handleKeyDown = (fieldKey: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyFilter(fieldKey)
    }
  }

  // Render individual filter field
  const renderFilterField = (field: {
    key: string
    label: string
    type: string
    placeholder?: string
    dateTypes?: Array<{ label: string; value: string }>
  }) => {
    const fieldKey = field.key as string
    const isActive =
      field.type === 'date-range'
        ? urlState.queryState.filters['dateType'] !== undefined &&
          urlState.queryState.filters['date'] !== undefined
        : urlState.queryState.filters[fieldKey] !== undefined
    const currentValue = getFieldValue(fieldKey)

    const baseInputClass =
      'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
    const activeInputClass = isActive
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-700/20 dark:border-blue-400'
      : 'border-gray-300'

    switch (field.type) {
      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <select
              value={currentValue ? 'true' : 'false'}
              onChange={(e) => {
                const newValue = e.target.value === 'true'
                updateFieldValue(fieldKey, newValue)
                setTimeout(() => applyFilter(fieldKey), 0)
              }}
              className={`${baseInputClass} ${activeInputClass}`}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        )

      case 'select': {
        const options = fieldOptionsResults[fieldKey] || []
        const searchableOptions = options.map((option) => ({
          label: option.label,
          value: option.value as string | number,
        }))

        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <SearchableSelect
              options={searchableOptions}
              value={currentValue as string | number}
              onChange={(newValue) => {
                updateFieldValue(fieldKey, newValue)
                setTimeout(() => applyFilter(fieldKey), 0)
              }}
              placeholder={`Select ${field.label.toLowerCase()}...`}
              searchable={true}
              useBadge={false}
              className={`min-w-0 ${isActive ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-700/20' : ''}`}
            />
          </div>
        )
      }

      case 'date-range': {
        const dateRangeValue = (currentValue as {
          dateType: string
          startDate: string
          endDate: string
        }) || {
          dateType: '',
          startDate: '',
          endDate: '',
        }

        const dateTypeOptions = field.dateTypes || []
        const hasDateType = dateRangeValue.dateType !== ''
        const hasDateRange = dateRangeValue.startDate || dateRangeValue.endDate

        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {hasDateType && hasDateRange && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-700/30 dark:text-blue-200">
                  Active
                </span>
              )}
            </label>

            {/* Date Type Selector - Full width */}
            <div>
              <SearchableSelect
                options={dateTypeOptions}
                value={dateRangeValue.dateType}
                onChange={(newValue) => {
                  const newDateRangeValue = {
                    ...dateRangeValue,
                    dateType: String(newValue),
                  }
                  updateFieldValue(fieldKey, newDateRangeValue)
                  // Apply filter if date range is already set
                  if (
                    newDateRangeValue.startDate ||
                    newDateRangeValue.endDate
                  ) {
                    setTimeout(() => applyFilter(fieldKey), 0)
                  }
                }}
                placeholder="Select date type..."
                searchable={true}
                useBadge={false}
                className={`w-full ${isActive ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-700/20' : ''}`}
              />
            </div>

            {/* Date Range Inputs - Side by side with visual connection */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 dark:text-gray-400">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRangeValue.startDate || ''}
                    onChange={(e) => {
                      const newDateRangeValue = {
                        ...dateRangeValue,
                        startDate: e.target.value,
                      }
                      updateFieldValue(fieldKey, newDateRangeValue)
                    }}
                    onBlur={() => {
                      // Only apply filter if both dateType and at least one date are present
                      if (canApplyFilter(fieldKey)) {
                        applyFilter(fieldKey)
                      }
                    }}
                    disabled={!hasDateType}
                    className={`${baseInputClass} ${activeInputClass} ${
                      !hasDateType ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={
                      !hasDateType ? 'Please select a date type first' : ''
                    }
                  />
                </div>

                {/* End Date */}
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 dark:text-gray-400">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRangeValue.endDate || ''}
                    onChange={(e) => {
                      const newDateRangeValue = {
                        ...dateRangeValue,
                        endDate: e.target.value,
                      }
                      updateFieldValue(fieldKey, newDateRangeValue)
                    }}
                    onBlur={() => {
                      // Only apply filter if both dateType and at least one date are present
                      if (canApplyFilter(fieldKey)) {
                        applyFilter(fieldKey)
                      }
                    }}
                    disabled={!hasDateType}
                    className={`${baseInputClass} ${activeInputClass} ${
                      !hasDateType ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={
                      !hasDateType ? 'Please select a date type first' : ''
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      case 'number':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <input
              type="number"
              value={String(currentValue || '')}
              onChange={(e) => updateFieldValue(fieldKey, e.target.value)}
              onKeyDown={handleKeyDown(fieldKey)}
              onBlur={() => applyFilter(fieldKey)}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}...`
              }
              className={`${baseInputClass} ${activeInputClass}`}
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <input
              type="text"
              value={String(currentValue || '')}
              onChange={(e) => updateFieldValue(fieldKey, e.target.value)}
              onKeyDown={handleKeyDown(fieldKey)}
              onBlur={() => applyFilter(fieldKey)}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}...`
              }
              className={`${baseInputClass} ${activeInputClass}`}
            />
          </div>
        )
    }
  }

  return (
    <div
      className={`p-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-800 ${className}`}
    >
      <div className="space-y-4">
        {/* Search Box */}
        {filter.useSearch && (
          <div className="w-full">
            <SearchBox
              value={filter.searchValue}
              onChange={filter.updateSearch}
              placeholder={filter.searchPlaceholder}
              className="w-full"
            />
          </div>
        )}

        {/* Filter Grid */}
        {filter.filterOptions.fields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filters ({activeFilters.length} active)
              </h3>
              {activeFilters.length > 0 && (
                <WiseTableButton
                  onClick={filter.clearAllFilters}
                  variant="secondary"
                  size="sm"
                >
                  Clear All Filters
                </WiseTableButton>
              )}
            </div>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filter.filterOptions.fields.map(
                (field: {
                  key: string
                  label: string
                  type: string
                  placeholder?: string
                  dateTypes?: Array<{ label: string; value: string }>
                }) => (
                  <div key={field.key} className="relative">
                    {renderFilterField(field)}
                    {/* Clear individual filter button */}
                    {(field.type === 'date-range'
                      ? urlState.queryState.filters['dateType'] !== undefined &&
                        urlState.queryState.filters['date'] !== undefined
                      : urlState.queryState.filters[field.key] !==
                        undefined) && (
                      <WiseTableButton
                        onClick={() => clearFilter(field.key)}
                        variant="ghost"
                        size="xs"
                        className="absolute top-0 right-0 !p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        aria-label={`Clear ${field.label} filter`}
                      >
                        <CloseIcon size="sm" />
                      </WiseTableButton>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Unsaved Changes Warning */}
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
