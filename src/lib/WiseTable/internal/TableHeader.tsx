import { useEffect, useRef } from 'react'
import { useEditingContext } from '../hooks/useWiseTable'
import type { WiseTableColumn } from '../index'

export interface TableHeaderProps<T> {
  columns: WiseTableColumn<T>[]
  idColumn?: keyof T
}

export function TableHeader<T>({ columns, idColumn }: TableHeaderProps<T>) {
  const { selectedRowIds, setSelectedRowIds, isDirty, data } =
    useEditingContext<T>()
  const checkboxRef = useRef<HTMLInputElement>(null)

  // Calculate header checkbox state using data instead of DOM
  const allIds = (data || []).map((row, index) => {
    if (idColumn) {
      return row[idColumn] as string | number
    }
    // Fallback to common ID fields or index
    const rowRecord = row as Record<string, unknown>
    const id = rowRecord.id || rowRecord.ID || rowRecord._id || index
    return id
  }) as Array<string | number>

  const nonDirtyIds = allIds.filter((id) => !isDirty(id))
  const selectedNonDirtyIds = nonDirtyIds.filter((id) => selectedRowIds.has(id))

  const isAllSelected =
    nonDirtyIds.length > 0 && selectedNonDirtyIds.length === nonDirtyIds.length
  const isIndeterminate =
    selectedNonDirtyIds.length > 0 &&
    selectedNonDirtyIds.length < nonDirtyIds.length

  // Update indeterminate state via ref
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const handleToggleAll = () => {
    // Toggle only non-dirty rows; keep dirty rows selected
    const next = new Set<string | number>(selectedRowIds)
    if (isAllSelected) {
      nonDirtyIds.forEach((id) => next.delete(id))
    } else {
      nonDirtyIds.forEach((id) => next.add(id))
    }
    setSelectedRowIds(next)
  }

  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-6 pt-6 pb-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          <input
            ref={checkboxRef}
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-700"
            aria-label="Select all rows"
            checked={isAllSelected}
            onChange={handleToggleAll}
          />
        </th>
        {columns.map((column) => (
          <th
            key={String(column.key)}
            className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-6 pt-6 pb-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            style={
              column.width !== undefined
                ? {
                    minWidth: column.width,
                    width: column.width,
                    maxWidth: column.width,
                  }
                : undefined
            }
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}
