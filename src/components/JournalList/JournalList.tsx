'use client'

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { useJournals } from '../../hooks/useJournals'
import { useJournalFilters } from '../../hooks/useJournalFilters'
import { JournalQueryParams } from '../../types/api'
import { usePerformanceMonitor, debounce } from '../../utils/performance'
import { preloadJournalComponents } from '../../utils/dynamic-imports'
import VirtualScroll from '../VirtualScroll'

// @ts-ignore: allow side-effect CSS import without type declarations
import './JournalList.css'

// Lazy load components for better performance
const JournalCard = React.lazy(() => import('../JournalCard'))
const JournalFilters = React.lazy(() => import('../JournalFilters'))

interface JournalListProps {
  initialParams?: JournalQueryParams
  className?: string
}

// Skeleton component for loading state
function JournalListSkeleton() {
  return (
    <div className="journal-list-skeleton">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="journal-card-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-excerpt"></div>
            <div className="skeleton-meta">
              <div className="skeleton-category"></div>
              <div className="skeleton-tags">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Pagination controls component
interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
  loading: boolean
}

function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  loading,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show middle pages
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Previous
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                disabled={loading}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span className="pagination-ellipsis" aria-hidden="true">
                {page}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        aria-label="Next page"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default function JournalList({ initialParams = {}, className = '' }: JournalListProps) {
  // Performance monitoring
  const { measureRender, measureAsync } = usePerformanceMonitor('JournalList')

  // Memoize initialParams to prevent unnecessary re-renders
  const memoizedInitialParams = useMemo(() => initialParams, [JSON.stringify(initialParams)])

  const { entries, pagination, loading, error, fetchJournals } = useJournals({
    autoFetch: true,
    initialParams: memoizedInitialParams,
  })

  const { filters } = useJournalFilters()
  const [currentParams, setCurrentParams] = useState<JournalQueryParams>(memoizedInitialParams)
  const [useVirtualScroll, setUseVirtualScroll] = useState(false)

  // Preload components on mount
  useEffect(() => {
    preloadJournalComponents()
  }, [])

  // Keep latest callbacks in refs so the debounced function can be created once
  const fetchJournalsRef = React.useRef(fetchJournals)
  React.useEffect(() => {
    fetchJournalsRef.current = fetchJournals
  }, [fetchJournals])

  const measureAsyncRef = React.useRef(measureAsync)
  React.useEffect(() => {
    measureAsyncRef.current = measureAsync
  }, [measureAsync])

  // Debounced fetch function for better performance (created once)
  const debouncedFetchJournals = useMemo(() => {
    return debounce((params: JournalQueryParams) => {
      // call the latest implementations
      measureAsyncRef.current(() => fetchJournalsRef.current(params))
    }, 300)
    // We intentionally create this once and rely on refs to forward the latest funcs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep track of the last params we requested to avoid re-requesting the same params
  const lastRequestedParamsRef = React.useRef<string | null>(null)

  // Update params when filters change
  useEffect(() => {
    const newParams: JournalQueryParams = {
      ...memoizedInitialParams,
      ...filters,
      page: 1, // Reset to first page when filters change
    }
    // Debug: log filter-driven param updates (guarded)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = (globalThis as any).window as any
      if (win && win.__DEBUG_JOURNALS__) {
        win.___journal_list_counter = (win.___journal_list_counter || 0) + 1
        if (win.___journal_list_counter <= 30) {
          // eslint-disable-next-line no-console
          console.debug(
            '[JournalList] [origin:filters-effect] filters changed, newParams:',
            newParams,
            'count:',
            win.___journal_list_counter,
          )
        } else if (win.___journal_list_counter === 31) {
          // eslint-disable-next-line no-console
          console.debug(
            '[JournalList] [origin:filters-effect] logging suppressed after 30 messages',
          )
        }
      }
    } catch (e) {}

    // Only update currentParams if they actually changed to avoid redundant renders.
    // Return the previous state reference when structurally equal so React doesn't
    // treat it as a state change (which would cause extra renders/effects).
    setCurrentParams((prev) => {
      try {
        const prevSerialized = JSON.stringify(prev)
        const newSerialized = JSON.stringify(newParams)
        if (prevSerialized === newSerialized) {
          return prev
        }
      } catch (e) {
        // If serialization fails for some reason, fall back to setting new params
      }
      return newParams
    })

    try {
      const serialized = JSON.stringify(newParams)
      if (lastRequestedParamsRef.current !== serialized) {
        lastRequestedParamsRef.current = serialized
        debouncedFetchJournals(newParams)
      }
    } catch (e) {
      // If serialization fails for some reason, fall back to calling fetch
      debouncedFetchJournals(newParams)
    }
  }, [filters, memoizedInitialParams, debouncedFetchJournals])

  // Enable virtual scrolling for large datasets
  useEffect(() => {
    // Debug: entries length changed (guarded)
    try {
      const win = (globalThis as any).window as any
      if (win && win.__DEBUG_JOURNALS__ && (win.___journal_list_counter || 0) <= 30) {
        // eslint-disable-next-line no-console
        console.debug('[JournalList] [origin:entries-effect] entries.length', entries.length)
      }
    } catch (e) {}

    setUseVirtualScroll(entries.length > 20)
  }, [entries.length])

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = { ...currentParams, page }
      setCurrentParams(newParams)
      try {
        const serialized = JSON.stringify(newParams)
        lastRequestedParamsRef.current = serialized
      } catch (e) {}
      measureAsync(() => fetchJournals(newParams))

      // Scroll to top of journal list
      const journalList = document.querySelector('.journal-list')
      if (journalList) {
        journalList.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [currentParams, fetchJournals, measureAsync],
  )

  // Render journal card with performance optimization
  const renderJournalCard = useCallback((entry: any, index: number) => {
    return (
      <Suspense key={entry.id} fallback={<div className="journal-card-skeleton" />}>
        <JournalCard entry={entry} />
      </Suspense>
    )
  }, [])

  // Load more function for virtual scrolling
  const loadMore = useCallback(() => {
    if (pagination.hasNextPage && !loading) {
      handlePageChange(pagination.currentPage + 1)
    }
  }, [pagination.hasNextPage, pagination.currentPage, loading, handlePageChange])

  if (error) {
    return (
      <div className="journal-list-error">
        <div className="error-content">
          <h3>Failed to load journal entries</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => fetchJournals(currentParams)}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return measureRender(() => (
    <div className={`journal-list ${className}`}>
      {/* Filters */}
      <Suspense fallback={<div className="filters-skeleton" />}>
        <JournalFilters />
      </Suspense>

      {loading && entries.length === 0 ? (
        <JournalListSkeleton />
      ) : (
        <>
          {entries.length === 0 ? (
            <div className="journal-list-empty">
              <div className="empty-content">
                <h3>No journal entries found</h3>
                <p>
                  {Object.keys(filters).length > 0
                    ? 'Try adjusting your filters to see more results.'
                    : 'Check back later for new content.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="journal-list-header">
                <div className="journal-count">
                  <span className="count-text">
                    {pagination.totalDocs} {pagination.totalDocs === 1 ? 'entry' : 'entries'}
                  </span>
                  {Object.keys(filters).length > 0 && (
                    <span className="filtered-indicator">filtered</span>
                  )}
                </div>
                {useVirtualScroll && (
                  <div className="performance-indicator">
                    <span className="virtual-scroll-badge">Virtual Scrolling Enabled</span>
                  </div>
                )}
              </div>

              {useVirtualScroll ? (
                <VirtualScroll
                  items={entries}
                  itemHeight={320} // Approximate height of journal card
                  containerHeight={800} // Container height
                  renderItem={renderJournalCard}
                  loadMore={loadMore}
                  hasMore={pagination.hasNextPage}
                  loading={loading}
                  className="journal-virtual-grid"
                />
              ) : (
                <>
                  <div className="journal-grid">
                    {entries.map((entry, idx) => renderJournalCard(entry, idx))}
                  </div>

                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  ))
}
