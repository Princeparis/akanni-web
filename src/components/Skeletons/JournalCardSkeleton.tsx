'use client'

import React from 'react'
import './Skeleton.css'

interface JournalCardSkeletonProps {
  showCover?: boolean
  showAudio?: boolean
  showTags?: boolean
  className?: string
}

export function JournalCardSkeleton({
  showCover = true,
  showAudio = false,
  showTags = true,
  className = '',
}: JournalCardSkeletonProps) {
  return (
    <div
      className={`journal-card-skeleton ${className}`}
      role="status"
      aria-label="Loading journal entry"
    >
      {showCover && <div className="skeleton skeleton-cover" />}

      <div className="skeleton-meta">
        <div className="skeleton skeleton-category" />
        <div className="skeleton skeleton-date" />
      </div>

      <div className="skeleton skeleton-title" />

      <div className="skeleton-excerpt">
        <div className="skeleton skeleton-text line" />
        <div className="skeleton skeleton-text line medium" />
        <div className="skeleton skeleton-text line short" />
      </div>

      {showTags && (
        <div className="skeleton-tags">
          <div className="skeleton skeleton-tag" />
          <div className="skeleton skeleton-tag" />
          <div className="skeleton skeleton-tag" />
        </div>
      )}

      <div className="skeleton-actions">
        <div className="skeleton skeleton-read-more" />
        {showAudio && <div className="skeleton skeleton-audio-indicator" />}
      </div>
    </div>
  )
}

interface JournalCardSkeletonListProps {
  count?: number
  showCover?: boolean
  showAudio?: boolean
  showTags?: boolean
  className?: string
}

export function JournalCardSkeletonList({
  count = 3,
  showCover = true,
  showAudio = false,
  showTags = true,
  className = '',
}: JournalCardSkeletonListProps) {
  return (
    <div className={`journal-card-skeleton-list ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <JournalCardSkeleton
          key={index}
          showCover={showCover}
          showAudio={showAudio}
          showTags={showTags}
        />
      ))}
    </div>
  )
}
