'use client'

import React from 'react'
import './Skeleton.css'

interface PaginationSkeletonProps {
  buttonCount?: number
  showInfo?: boolean
  className?: string
}

export function PaginationSkeleton({
  buttonCount = 5,
  showInfo = true,
  className = '',
}: PaginationSkeletonProps) {
  return (
    <div
      className={`pagination-skeleton ${className}`}
      role="status"
      aria-label="Loading pagination"
    >
      <div className="skeleton skeleton-page-button" />

      {Array.from({ length: buttonCount }, (_, index) => (
        <div key={index} className="skeleton skeleton-page-button" />
      ))}

      <div className="skeleton skeleton-page-button" />

      {showInfo && <div className="skeleton skeleton-page-info" />}
    </div>
  )
}
