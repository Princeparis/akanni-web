/**
 * Virtual scrolling component for efficient rendering of large lists
 * Based on requirements 5.3, 5.6
 */

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  loadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loadMore,
  hasMore = false,
  loading = false,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }))
  }, [items, visibleRange])

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)

      // Set scrolling state
      isScrollingRef.current = true

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current as NodeJS.Timeout)
      }

      // Set timeout to detect end of scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
      }, 150)

      // Load more items if near the end
      if (loadMore && hasMore && !loading) {
        const scrollPercentage = (newScrollTop + containerHeight) / (items.length * itemHeight)
        if (scrollPercentage > 0.8) {
          loadMore()
        }
      }
    },
    [onScroll, loadMore, hasMore, loading, containerHeight, itemHeight, items.length],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current as NodeJS.Timeout)
      }
    }
  }, [])

  // Total height of all items
  const totalHeight = items.length * itemHeight

  // Offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                position: 'relative',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <div className="loading-spinner">Loading more...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VirtualScroll
