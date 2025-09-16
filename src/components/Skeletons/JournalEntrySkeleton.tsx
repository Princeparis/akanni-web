'use client'

import React from 'react'
import './Skeleton.css'

interface JournalEntrySkeletonProps {
  showCover?: boolean
  showAudio?: boolean
  showBreadcrumb?: boolean
  contentLines?: number
  className?: string
}

export function JournalEntrySkeleton({
  showCover = true,
  showAudio = false,
  showBreadcrumb = true,
  contentLines = 12,
  className = '',
}: JournalEntrySkeletonProps) {
  return (
    <div
      className={`journal-entry-skeleton ${className}`}
      role="status"
      aria-label="Loading journal entry"
    >
      <div className="skeleton-header">
        {showBreadcrumb && <div className="skeleton skeleton-breadcrumb" />}

        <div className="skeleton skeleton-entry-title" />

        <div className="skeleton-entry-meta">
          <div className="skeleton skeleton-category" />
          <div className="skeleton skeleton-date" />
          <div className="skeleton skeleton-avatar" />
        </div>
      </div>

      {showCover && <div className="skeleton skeleton-entry-cover" />}

      {showAudio && <div className="skeleton skeleton-audio-player" />}

      <div className="skeleton-content">
        {Array.from({ length: contentLines }, (_, index) => {
          // Vary line lengths for more realistic appearance
          const lineClass = index % 4 === 0 ? 'short' : index % 3 === 0 ? 'medium' : 'long'
          return <div key={index} className={`skeleton skeleton-content-line ${lineClass}`} />
        })}
      </div>

      <div className="skeleton-footer">
        <div className="skeleton-tags">
          <div className="skeleton skeleton-tag" />
          <div className="skeleton skeleton-tag" />
          <div className="skeleton skeleton-tag" />
        </div>
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  )
}
