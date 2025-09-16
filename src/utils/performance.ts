/**
 * Performance monitoring and optimization utilities
 * Based on requirements 5.3, 5.6
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
  memoryUsage?: number
  bundleSize?: number
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor navigation timing
    this.observeNavigationTiming()

    // Monitor resource timing
    this.observeResourceTiming()

    // Monitor paint timing
    this.observePaintTiming()

    // Monitor layout shifts
    this.observeLayoutShifts()

    // Monitor long tasks
    this.observeLongTasks()
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }

  /**
   * Record custom performance metric
   */
  recordMetric(name: string, metrics: Partial<PerformanceMetrics>): void {
    const existing = this.metrics.get(name) || {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    }

    this.metrics.set(name, { ...existing, ...metrics })
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Measure component render time
   */
  measureRender<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    this.recordMetric(name, { renderTime: end - start })
    return result
  }

  /**
   * Measure async operation time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()

    this.recordMetric(name, { loadTime: end - start })
    return result
  }

  private observeNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric('navigation', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            })
          }
        })
      })

      observer.observe({ entryTypes: ['navigation'] })
      this.observers.push(observer)
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            const resourceName = resourceEntry.name.split('/').pop() || 'unknown'

            this.recordMetric(`resource:${resourceName}`, {
              loadTime: resourceEntry.responseEnd - resourceEntry.requestStart,
            })
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.push(observer)
    }
  }

  private observePaintTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.recordMetric(`paint:${entry.name}`, {
              renderTime: entry.startTime,
            })
          }
        })
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    }
  }

  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.recordMetric('layout-shift', {
              interactionTime: clsValue,
            })
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    }
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric('long-task', {
              interactionTime: entry.duration,
            })
          }
        })
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    }
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()

  const measureRender = <T>(fn: () => T): T => {
    return monitor.measureRender(componentName, fn)
  }

  const measureAsync = <T>(fn: () => Promise<T>): Promise<T> => {
    return monitor.measureAsync(componentName, fn)
  }

  return { measureRender, measureAsync, monitor }
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  private static loadedChunks = new Set<string>()

  static trackChunkLoad(chunkName: string, size: number): void {
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.add(chunkName)

      const monitor = PerformanceMonitor.getInstance()
      monitor.recordMetric(`chunk:${chunkName}`, {
        bundleSize: size,
        loadTime: performance.now(),
      })
    }
  }

  static getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks)
  }

  static getTotalBundleSize(): number {
    const monitor = PerformanceMonitor.getInstance()
    const metrics = monitor.getMetrics()

    return Object.entries(metrics)
      .filter(([key]) => key.startsWith('chunk:'))
      .reduce((total, [, metric]) => total + (metric.bundleSize || 0), 0)
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  static getCurrentUsage(): number | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return null
  }

  static trackMemoryUsage(componentName: string): void {
    const usage = this.getCurrentUsage()
    if (usage !== null) {
      const monitor = PerformanceMonitor.getInstance()
      monitor.recordMetric(componentName, { memoryUsage: usage })
    }
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance()
    monitor.startMonitoring()

    // Track initial memory usage
    MemoryMonitor.trackMemoryUsage('initial')

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      monitor.stopMonitoring()
    })
  }
}
