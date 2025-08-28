export interface TableFooterProps<T> {
  data: T[] | undefined
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPrevPage?: () => void
  onNextPage?: () => void
  onPageSizeChange?: (size: number) => void
  onPageChange?: (page: number) => void
}

import { useEditingContext } from '../hooks/useWiseTable'
import { WiseTableButton } from '../ui'
import { SearchableSelect } from '../ui/SearchableSelect'

export function TableFooter<T>({
  data,
  pagination,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onPageChange,
}: TableFooterProps<T>) {
  const { hasUnsavedChanges } = useEditingContext()
  const isDirtyState = hasUnsavedChanges()
  const pageItems = (() => {
    if (!pagination) return [1]
    const totalPages = pagination.totalPages
    const current = pagination.page

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const items: Array<number | '…'> = []

    // Always show first page
    items.push(1)

    // Show current page with 1 page on each side
    const start = Math.max(2, current - 1)
    const end = Math.min(totalPages - 1, current + 1)

    // Add leading ellipsis if there's a gap after first page
    if (start > 2) {
      items.push('…')
    }

    // Add pages around current page (excluding first and last)
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i)
      }
    }

    // Add trailing ellipsis if there's a gap before last page
    if (end < totalPages - 1) {
      items.push('…')
    }

    // Always show last page (if different from first)
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  })()
  return (
    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-800">
      <div className="grid grid-cols-12 items-center">
        {/* Left: Row count */}
        <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 flex gap-2">
          <span>
            {pagination
              ? `${pagination.total} records`
              : data
                ? `${data.length} records`
                : '0 records'}
          </span>
          <span>
            /{' '}
            {pagination ? `${pagination.page} of ${pagination.totalPages}` : ''}
          </span>
        </div>

        {/* Center: Pagination buttons */}
        <div className="col-span-6 flex justify-center items-center gap-4">
          <WiseTableButton
            variant="secondary"
            size="md"
            disabled={!pagination || pagination.page <= 1 || isDirtyState}
            title={
              isDirtyState
                ? 'Save changes before navigation'
                : !pagination
                  ? 'Pagination unavailable'
                  : 'Previous page'
            }
            onClick={() => onPrevPage?.()}
          >
            ← Previous
          </WiseTableButton>
          <div className="flex gap-1">
            {pageItems.map((item, idx) =>
              item === '…' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  …
                </span>
              ) : (
                <WiseTableButton
                  key={`page-${item}`}
                  variant={
                    pagination && item === pagination.page
                      ? 'primary'
                      : 'secondary'
                  }
                  size="md"
                  className="px-2 py-1 text-sm rounded border"
                  disabled={!!pagination && isDirtyState}
                  onClick={() => onPageChange?.(item)}
                  aria-current={
                    pagination && item === pagination.page ? 'page' : undefined
                  }
                >
                  {item}
                </WiseTableButton>
              ),
            )}
          </div>
          <WiseTableButton
            variant="secondary"
            size="md"
            disabled={
              !pagination ||
              pagination.page >= pagination.totalPages ||
              isDirtyState
            }
            title={
              isDirtyState
                ? 'Save changes before navigation'
                : !pagination
                  ? 'Pagination unavailable'
                  : 'Next page'
            }
            onClick={() => onNextPage?.()}
          >
            Next →
          </WiseTableButton>
        </div>

        {/* Right: Page size selector */}
        <div className="col-span-3 flex justify-end">
          <SearchableSelect
            options={[
              { value: 10, label: '10 per page' },
              { value: 25, label: '25 per page' },
              { value: 50, label: '50 per page' },
              { value: 100, label: '100 per page' },
            ]}
            value={(pagination?.pageSize ?? 25) as number}
            onChange={(val) =>
              onPageSizeChange?.(Number(Array.isArray(val) ? val[0] : val))
            }
            disabled={!pagination || isDirtyState}
            className="min-w-[160px]"
            placement="top"
            searchable={false}
          />
        </div>
      </div>
    </div>
  )
}
