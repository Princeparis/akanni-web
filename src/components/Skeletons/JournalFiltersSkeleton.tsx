'use client'

import React from 'react'
import './Skeleton.css'

interface JournalFiltersSkeletonProps {
  showSearch?: boolean
  showCategories?: boolean
  showTags?: boolean
  tagCount?: number
  className?: string
}

export function JournalFiltersSkeleton({
  showSearch = true,
  showCategories = true,
  showTags = true,
  tagCount = 8,
  className = '',
}: JournalFiltersSkeletonProps) {
  return (
    <div
      className={`journal-filters-skeleton ${className}`}
      role="status"
      aria-label="Loading filters"
    >
      {showSearch && <div className="skeleton skeleton-search" />}

      <div className="skeleton-filter-row">
        {showCategories && (
          <div className="skeleton-filter-group">
            <div className="skeleton skeleton-filter-label" />
            <div className="skeleton skeleton-filter-select" />
          </div>
        )}

        <div className="skeleton-filter-group">
          <div className="skeleton skeleton-filter-label" />
          <div className="skeleton skeleton-filter-select" />
        </div>
      </div>

      {showTags && (
        <div className="skeleton-filter-group">
          <div className="skeleton skeleton-filter-label" />
          <div className="skeleton-filter-tags">
            {Array.from({ length: tagCount }, (_, index) => (
              <div key={index} className="skeleton skeleton-tag" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
