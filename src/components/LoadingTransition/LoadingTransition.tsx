'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import './LoadingTransition.css'

interface LoadingTransitionProps {
  isLoading: boolean
  children: ReactNode
  skeleton: ReactNode
  delay?: number
  minLoadingTime?: number
  fadeTransition?: boolean
  className?: string
}

export function LoadingTransition({
  isLoading,
  children,
  skeleton,
  delay = 200,
  minLoadingTime = 500,
  fadeTransition = true,
  className = '',
}: LoadingTransitionProps) {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)

  useEffect(() => {
    // initialize to null so strict TS knows they may be unset
    let delayTimeout: NodeJS.Timeout | null = null
    let minTimeTimeout: NodeJS.Timeout | null = null

    if (isLoading) {
      // Record when loading started
      setLoadingStartTime(Date.now())

      // Show skeleton after delay to prevent flickering for fast operations
      delayTimeout = setTimeout(() => {
        setShowSkeleton(true)
        setIsTransitioning(true)
      }, delay)
    } else {
      // Clear delay timeout if loading stops before delay
      if (delayTimeout) clearTimeout(delayTimeout as NodeJS.Timeout)

      if (showSkeleton && loadingStartTime) {
        const loadingDuration = Date.now() - loadingStartTime
        const remainingMinTime = Math.max(0, minLoadingTime - loadingDuration)

        // Ensure minimum loading time for better UX
        minTimeTimeout = setTimeout(() => {
          setIsTransitioning(false)
          setTimeout(
            () => {
              setShowSkeleton(false)
              setLoadingStartTime(null)
            },
            fadeTransition ? 150 : 0,
          )
        }, remainingMinTime)
      } else {
        setShowSkeleton(false)
        setIsTransitioning(false)
        setLoadingStartTime(null)
      }
    }

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout as NodeJS.Timeout)
      if (minTimeTimeout) clearTimeout(minTimeTimeout as NodeJS.Timeout)
    }
  }, [isLoading, delay, minLoadingTime, fadeTransition, showSkeleton, loadingStartTime])

  const containerClass = [
    'loading-transition',
    className,
    fadeTransition && 'fade-transition',
    isTransitioning && 'transitioning',
    showSkeleton && 'showing-skeleton',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClass}>
      {showSkeleton ? (
        <div className="loading-transition-skeleton">{skeleton}</div>
      ) : (
        <div className="loading-transition-content">{children}</div>
      )}
    </div>
  )
}

// Specialized loading transition for journal content
interface JournalLoadingTransitionProps {
  isLoading: boolean
  children: ReactNode
  skeletonType: 'card' | 'list' | 'entry' | 'filters'
  skeletonProps?: any
  className?: string
}

export function JournalLoadingTransition({
  isLoading,
  children,
  skeletonType,
  skeletonProps = {},
  className = '',
}: JournalLoadingTransitionProps) {
  // Lazy load skeleton components to avoid bundle bloat
  const [SkeletonComponent, setSkeletonComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSkeleton = async () => {
      try {
        switch (skeletonType) {
          case 'card':
            const { JournalCardSkeleton } = await import('../Skeletons/JournalCardSkeleton')
            if (isMounted) setSkeletonComponent(() => JournalCardSkeleton)
            break
          case 'list':
            const { JournalListSkeleton } = await import('../Skeletons/JournalListSkeleton')
            if (isMounted) setSkeletonComponent(() => JournalListSkeleton)
            break
          case 'entry':
            const { JournalEntrySkeleton } = await import('../Skeletons/JournalEntrySkeleton')
            if (isMounted) setSkeletonComponent(() => JournalEntrySkeleton)
            break
          case 'filters':
            const { JournalFiltersSkeleton } = await import('../Skeletons/JournalFiltersSkeleton')
            if (isMounted) setSkeletonComponent(() => JournalFiltersSkeleton)
            break
        }
      } catch (error) {
        console.error('Failed to load skeleton component:', error)
        if (isMounted) setSkeletonComponent(() => () => <div>Loading...</div>)
      }
    }

    loadSkeleton()

    return () => {
      isMounted = false
    }
  }, [skeletonType])

  if (!SkeletonComponent) {
    return <div>Loading...</div>
  }

  return (
    <LoadingTransition
      isLoading={isLoading}
      skeleton={<SkeletonComponent {...skeletonProps} />}
      className={className}
    >
      {children}
    </LoadingTransition>
  )
}
