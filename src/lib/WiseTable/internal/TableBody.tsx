import { useEditingContext } from '../hooks/useWiseTable'
import type { WiseTableColumn } from '../index'
import { EditableCell } from './EditableCell'

export interface TableBodyProps<T, TIdColumn extends keyof T> {
  data: T[] | undefined
  columns: WiseTableColumn<T>[]
  idColumn: TIdColumn
}

export function TableBody<T, TIdColumn extends keyof T>({
  data,
  columns,
  idColumn,
}: TableBodyProps<T, TIdColumn>) {
  const {
    isSelected,
    isDirty,
    selectedRowIds,
    setSelectedRowIds,
    __resetVersion,
  } = useEditingContext<T>()

  return (
    <tbody className="bg-white divide-y divide-gray-200 text-gray-800 dark:bg-gray-800 dark:divide-gray-800 dark:text-gray-100">
      {data && data.length > 0 ? (
        data.map((row, rowIndex) => {
          const rowId = row[idColumn] as string | number
          const isRowSelected = isSelected(rowId)
          const isRowDirty = isDirty(rowId)

          return (
            <tr
              key={`${String(rowId)}-${__resetVersion ?? 0}`}
              data-row-id={String(rowId)}
              className={`transition-colors ${
                isRowSelected
                  ? 'bg-blue-50 hover:bg-blue-50 dark:bg-blue-800/30 dark:hover:bg-blue-800/40'
                  : isRowDirty
                    ? 'bg-amber-50 hover:bg-amber-50 dark:bg-amber-200/20 dark:hover:bg-amber-200/30 dark:text-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 dark:border-gray-600"
                  checked={isRowSelected}
                  onChange={() => {
                    const newSelection = new Set(selectedRowIds)
                    if (isRowSelected) {
                      newSelection.delete(rowId)
                    } else {
                      newSelection.add(rowId)
                    }
                    setSelectedRowIds(newSelection)
                  }}
                />
              </td>
              {columns.map((column) => (
                <EditableCell
                  key={`cell-${String(column.key)}`}
                  row={row}
                  rowId={rowId}
                  rowIndex={rowIndex}
                  column={column}
                  value={row[column.key]}
                />
              ))}
            </tr>
          )
        })
      ) : (
        <tr>
          <td
            colSpan={columns.length + 1}
            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
          >
            <div className="text-4xl mb-2">📊</div>
            <div>No data available</div>
          </td>
        </tr>
      )}
    </tbody>
  )
}
