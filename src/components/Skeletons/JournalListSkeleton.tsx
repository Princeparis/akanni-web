'use client'

import React from 'react'
import { JournalCardSkeletonList } from './JournalCardSkeleton'
import { JournalFiltersSkeleton } from './JournalFiltersSkeleton'
import { PaginationSkeleton } from './PaginationSkeleton'
import './Skeleton.css'

interface JournalListSkeletonProps {
  showFilters?: boolean
  showPagination?: boolean
  cardCount?: number
  showHeader?: boolean
  className?: string
}

export function JournalListSkeleton({
  showFilters = true,
  showPagination = true,
  cardCount = 6,
  showHeader = true,
  className = '',
}: JournalListSkeletonProps) {
  return (
    <div
      className={`journal-list-skeleton ${className}`}
      role="status"
      aria-label="Loading journal entries"
    >
      {showHeader && (
        <div className="skeleton-header">
          <div className="skeleton skeleton-page-title" />
          <div className="skeleton skeleton-count" />
        </div>
      )}

      {showFilters && <JournalFiltersSkeleton />}

      <div className="skeleton-cards">
        <JournalCardSkeletonList count={cardCount} />
      </div>

      {showPagination && <PaginationSkeleton />}
    </div>
  )
}
