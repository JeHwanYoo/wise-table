import { useEditingContext } from '../hooks/useWiseTable'
import type { WiseTableColumn } from '../index'

export interface TableHeaderProps<T> {
  columns: WiseTableColumn<T>[]
}

export function TableHeader<T>({ columns }: TableHeaderProps<T>) {
  const { selectedRowIds, setSelectedRowIds, isDirty } = useEditingContext<T>()

  const handleToggleAll = () => {
    // Toggle only non-dirty rows; keep dirty rows selected
    const allIds = Array.from(
      document.querySelectorAll('tbody tr[data-row-id]'),
    ).map((tr) => {
      const idStr = (tr as HTMLElement).dataset.rowId!
      const n = Number(idStr)
      return Number.isNaN(n) ? idStr : n
    }) as Array<string | number>

    const nonDirtyIds = allIds.filter((id) => !isDirty(id))
    const allNonDirtySelected = nonDirtyIds.every((id) =>
      selectedRowIds.has(id),
    )

    const next = new Set<string | number>(selectedRowIds)
    if (allNonDirtySelected) {
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
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-700"
            aria-label="Select all rows"
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
