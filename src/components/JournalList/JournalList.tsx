'use client'

import React, { useEffect, useState } from 'react'
import { useJournals } from '../../hooks/useJournals'
import { useJournalFilters } from '../../hooks/useJournalFilters'
import { JournalQueryParams } from '../../types/api'
import JournalCard from '../JournalCard'
import JournalFilters from '../JournalFilters'
import './JournalList.css'

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
  const { entries, pagination, loading, error, fetchJournals } = useJournals({
    autoFetch: true,
    initialParams,
  })

  const { filters } = useJournalFilters()
  const [currentParams, setCurrentParams] = useState<JournalQueryParams>(initialParams)

  // Update params when filters change
  useEffect(() => {
    const newParams: JournalQueryParams = {
      ...initialParams,
      ...filters,
      page: 1, // Reset to first page when filters change
    }
    setCurrentParams(newParams)
    fetchJournals(newParams)
  }, [filters, initialParams, fetchJournals])

  const handlePageChange = (page: number) => {
    const newParams = { ...currentParams, page }
    setCurrentParams(newParams)
    fetchJournals(newParams)

    // Scroll to top of journal list
    const journalList = document.querySelector('.journal-list')
    if (journalList) {
      journalList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

  return (
    <div className={`journal-list ${className}`}>
      {/* Filters */}
      <JournalFilters />

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
              </div>

              <div className="journal-grid">
                {entries.map((entry) => (
                  <JournalCard key={entry.id} entry={entry} />
                ))}
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
    </div>
  )
}
