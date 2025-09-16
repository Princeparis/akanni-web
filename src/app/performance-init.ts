/**
 * Performance initialization for the application
 * Based on requirements 5.3, 5.6
 */

'use client'

import { initializePerformanceMonitoring, BundleAnalyzer } from '../utils/performance'

/**
 * Initialize performance monitoring and optimizations
 */
export function initializePerformance(): void {
  // Start performance monitoring
  initializePerformanceMonitoring()

  // Track initial bundle load
  BundleAnalyzer.trackChunkLoad('main', 0)

  // Preload critical resources
  preloadCriticalResources()

  // Setup performance observers
  setupPerformanceObservers()

  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      logPerformanceMetrics()
    }, 5000)
  }
}

/**
 * Preload critical resources
 */
function preloadCriticalResources(): void {
  // Preload critical fonts
  const criticalFonts = [
    '/fonts/PPNeueMontreal-Regular.woff2',
    '/fonts/PPNeueMontreal-Medium.woff2',
  ]

  criticalFonts.forEach((font) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = font
    document.head.appendChild(link)
  })

  // Preload critical API endpoints
  const criticalEndpoints = [
    '/api/public/journals?limit=10',
    '/api/public/categories',
    '/api/public/tags',
  ]

  criticalEndpoints.forEach((endpoint) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = endpoint
    document.head.appendChild(link)
  })
}

/**
 * Setup additional performance observers
 */
function setupPerformanceObservers(): void {
  // Observe resource loading
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming

        // Track slow resources
        if (resource.duration > 1000) {
          console.warn(`Slow resource detected: ${resource.name} (${resource.duration}ms)`)
        }

        // Track large resources
        if (resource.transferSize && resource.transferSize > 500000) {
          console.warn(`Large resource detected: ${resource.name} (${resource.transferSize} bytes)`)
        }
      })
    })

    resourceObserver.observe({ entryTypes: ['resource'] })
  }

  // Observe user interactions
  if ('PerformanceObserver' in window) {
    const interactionObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Track slow interactions
        if (entry.duration > 100) {
          console.warn(`Slow interaction detected: ${entry.name} (${entry.duration}ms)`)
        }
      })
    })

    try {
      interactionObserver.observe({ entryTypes: ['event'] })
    } catch (e) {
      // Event timing not supported in all browsers
    }
  }
}

/**
 * Log performance metrics for debugging
 */
function logPerformanceMetrics(): void {
  if (typeof window === 'undefined') return

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (navigation) {
    console.group('🚀 Performance Metrics')
    console.log(
      `Page Load Time: ${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`,
    )
    console.log(
      `DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`,
    )
    console.log(`First Paint: ${Math.round(navigation.responseEnd - navigation.requestStart)}ms`)

    // Log bundle size if available
    const totalBundleSize = BundleAnalyzer.getTotalBundleSize()
    if (totalBundleSize > 0) {
      console.log(`Total Bundle Size: ${Math.round(totalBundleSize / 1024)}KB`)
    }

    // Log memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.log(`Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`)
    }

    console.groupEnd()
  }
}

/**
 * Report performance issues
 */
export function reportPerformanceIssue(issue: string, details?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Performance Issue: ${issue}`, details)
  }

  // In production, you might want to send this to an analytics service
  // analytics.track('performance_issue', { issue, details })
}
