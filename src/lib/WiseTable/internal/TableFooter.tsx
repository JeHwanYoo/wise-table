import { useState } from 'react'
import { useURLState } from '../hooks/useURLState'
import { useEditingContext } from '../hooks/useWiseTable'
import { WiseTableButton } from '../ui'

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

export function TableFooter<T>({
  data,
  pagination,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onPageChange,
}: TableFooterProps<T>) {
  const urlState = useURLState()
  const { hasUnsavedChanges } = useEditingContext()
  const isDirtyState = hasUnsavedChanges()
  const [pageInput, setPageInput] = useState('')
  const [limitInput, setLimitInput] = useState('')

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value)
    }
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pagination || !pageInput) return

    const pageNum = parseInt(pageInput, 10)
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      onPageChange?.(pageNum)
      setPageInput('')
    }
  }

  const handlePageInputBlur = () => {
    if (!pagination || !pageInput) return

    const pageNum = parseInt(pageInput, 10)
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      onPageChange?.(pageNum)
      setPageInput('')
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!pagination || !pageInput) return

      const pageNum = parseInt(pageInput, 10)
      if (pageNum >= 1 && pageNum <= pagination.totalPages) {
        onPageChange?.(pageNum)
        setPageInput('')
      }
    } else if (e.key === 'Escape') {
      setPageInput('')
    }
  }

  const handleLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setLimitInput(value)
    }
  }

  const handleLimitInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!limitInput) return

    const limitNum = parseInt(limitInput, 10)
    if (limitNum >= 1) {
      onPageSizeChange?.(limitNum)
      setLimitInput('')
    }
  }

  const handleLimitInputBlur = () => {
    if (!limitInput) return

    const limitNum = parseInt(limitInput, 10)
    if (limitNum >= 1) {
      onPageSizeChange?.(limitNum)
      setLimitInput('')
    }
  }

  const handleLimitInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!limitInput) return

      const limitNum = parseInt(limitInput, 10)
      if (limitNum >= 1) {
        onPageSizeChange?.(limitNum)
        setLimitInput('')
      }
    } else if (e.key === 'Escape') {
      setLimitInput('')
    }
  }

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
        <div className="col-span-3 text-sm text-gray-500 dark:text-gray-300 flex gap-2">
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
                  className="px-2 py-1 text-sm text-gray-500 dark:text-gray-300"
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

        {/* Right: Page input and page size selector */}
        <div className="col-span-3 flex justify-end items-center gap-3">
          {/* Page input */}
          {pagination && (
            <form
              onSubmit={handlePageInputSubmit}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-gray-500 dark:text-gray-300">
                Go to:
              </span>
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageInputBlur}
                placeholder={pagination.page.toString()}
                disabled={isDirtyState}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed bg-white text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                title={
                  isDirtyState
                    ? 'Save changes before navigation'
                    : `Enter page number (1-${pagination.totalPages})`
                }
              />
            </form>
          )}

          {/* Page size input */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show
            </span>
            <form
              onSubmit={handleLimitInputSubmit}
              className="flex items-center"
            >
              <input
                type="text"
                value={limitInput}
                onChange={handleLimitInputChange}
                onKeyDown={handleLimitInputKeyDown}
                onBlur={handleLimitInputBlur}
                placeholder={String(pagination?.pageSize ?? 25)}
                disabled={!pagination || isDirtyState}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                title={`Max: ${urlState?.paginationConfig?.maxLimitSize || 100}`}
              />
            </form>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              per page
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
