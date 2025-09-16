/**
 * Dynamic import utilities for code splitting and performance optimization
 * Based on requirements 5.3, 5.6
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'

/**
 * Create a lazy-loaded component with error boundary
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  displayName?: string,
): LazyExoticComponent<T> {
  const LazyComponent = lazy(importFn) as LazyExoticComponent<T>

  if (displayName) {
    // LazyExoticComponent doesn't have displayName typed, assign via any
    ;(LazyComponent as any).displayName = `Lazy(${displayName})`
  }

  return LazyComponent
}

/**
 * Preload a component for better performance
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  // Start loading the component but don't wait for it
  importFn().catch((error) => {
    console.warn('Failed to preload component:', error)
  })
}

/**
 * Create a lazy component with preloading capability
 */
export function createPreloadableLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  displayName?: string,
) {
  const LazyComponent = createLazyComponent(importFn, displayName)

  return {
    Component: LazyComponent as LazyExoticComponent<T>,
    preload: () => preloadComponent(importFn),
  }
}

/**
 * Journal-specific lazy components
 */
export const JournalComponents = {
  JournalList: createPreloadableLazyComponent(
    () => import('../components/JournalList'),
    'JournalList',
  ),
  JournalEntry: createPreloadableLazyComponent(
    () => import('../components/JournalEntry'),
    'JournalEntry',
  ),
  JournalFilters: createPreloadableLazyComponent(
    () => import('../components/JournalFilters'),
    'JournalFilters',
  ),
  JournalCard: createPreloadableLazyComponent(
    () => import('../components/JournalCard'),
    'JournalCard',
  ),
}

/**
 * Preload all journal components
 */
export function preloadJournalComponents(): void {
  Object.values(JournalComponents).forEach(({ preload }) => {
    preload()
  })
}

/**
 * Intersection Observer utility for lazy loading
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null
  private loadedElements = new Set<Element>()

  constructor(
    private onIntersect: (element: Element) => void,
    private options: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: 0.1,
    },
  ) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options)
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadedElements.add(entry.target)
        this.onIntersect(entry.target)
        this.observer?.unobserve(entry.target)
      }
    })
  }

  observe(element: Element): void {
    if (this.observer && !this.loadedElements.has(element)) {
      this.observer.observe(element)
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.loadedElements.clear()
    }
  }
}

/**
 * Image lazy loading utility
 */
export function createImageLazyLoader(): LazyLoader {
  return new LazyLoader((element) => {
    const img = element as HTMLImageElement
    const src = img.dataset.src

    if (src) {
      img.src = src
      img.removeAttribute('data-src')
      img.classList.add('loaded')
    }
  })
}

/**
 * Component lazy loading utility
 */
export function createComponentLazyLoader(loadComponent: (element: Element) => void): LazyLoader {
  return new LazyLoader(loadComponent)
}
