/**
 * Cache management utilities for API responses
 * Implements cache invalidation strategies and performance monitoring
 * Based on requirements 5.2, 5.6
 */

import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { CACHE_DURATION } from './constants'

export interface CacheConfig {
  maxAge: number
  staleWhileRevalidate?: number
  mustRevalidate?: boolean
  private?: boolean
  noCache?: boolean
}

export interface CacheKey {
  collection: string
  operation: string
  params?: Record<string, any>
}

/**
 * Cache configurations for different content types
 */
export const CACHE_CONFIGS = {
  // Journal entries - medium cache for lists, long for individual entries
  JOURNAL_LIST: {
    maxAge: CACHE_DURATION.MEDIUM,
    staleWhileRevalidate: CACHE_DURATION.SHORT,
  },
  JOURNAL_ENTRY_PUBLISHED: {
    maxAge: CACHE_DURATION.LONG,
    staleWhileRevalidate: CACHE_DURATION.MEDIUM,
  },
  JOURNAL_ENTRY_DRAFT: {
    maxAge: CACHE_DURATION.SHORT,
    staleWhileRevalidate: 60, // 1 minute
  },

  // Categories and tags - long cache as they change infrequently
  CATEGORIES: {
    maxAge: CACHE_DURATION.VERY_LONG,
    staleWhileRevalidate: CACHE_DURATION.LONG,
  },
  TAGS: {
    maxAge: CACHE_DURATION.VERY_LONG,
    staleWhileRevalidate: CACHE_DURATION.LONG,
  },

  // Search results - shorter cache as they're more dynamic
  SEARCH_RESULTS: {
    maxAge: CACHE_DURATION.SHORT,
    staleWhileRevalidate: 120, // 2 minutes
  },
} as const

/**
 * Generate cache key for consistent caching
 */
export function generateCacheKey(key: CacheKey): string {
  const { collection, operation, params } = key

  if (!params || Object.keys(params).length === 0) {
    return `${collection}:${operation}`
  }

  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, k) => {
        acc[k] = params[k]
        return acc
      },
      {} as Record<string, any>,
    )

  const paramString = JSON.stringify(sortedParams)
  const hash = require('crypto').createHash('md5').update(paramString).digest('hex')

  return `${collection}:${operation}:${hash}`
}

/**
 * Generate ETag based on data content and timestamp
 */
export function generateETag(data: any, lastModified?: Date): string {
  const content = {
    data: typeof data === 'object' ? JSON.stringify(data) : data,
    timestamp: lastModified?.getTime() || Date.now(),
  }

  const hash = require('crypto').createHash('md5').update(JSON.stringify(content)).digest('hex')

  return `"${hash}"`
}

/**
 * Generate cache control header string
 */
export function generateCacheControl(config: CacheConfig): string {
  const parts: string[] = []

  if (config.private) {
    parts.push('private')
  } else {
    parts.push('public')
  }

  if (config.noCache) {
    parts.push('no-cache')
  } else {
    parts.push(`max-age=${config.maxAge}`)

    if (config.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
    }
  }

  if (config.mustRevalidate) {
    parts.push('must-revalidate')
  }

  return parts.join(', ')
}

/**
 * Add cache headers to response
 */
export function addCacheHeaders(
  response: NextResponse,
  config: CacheConfig,
  etag?: string,
  lastModified?: Date,
): NextResponse {
  // Set cache control
  response.headers.set('Cache-Control', generateCacheControl(config))

  // Set ETag if provided
  if (etag) {
    response.headers.set('ETag', etag)
  }

  // Set Last-Modified if provided
  if (lastModified) {
    response.headers.set('Last-Modified', lastModified.toUTCString())
  }

  // Add cache performance headers
  response.headers.set('X-Cache-Config', JSON.stringify(config))
  response.headers.set('X-Cache-Generated', new Date().toISOString())

  return response
}

/**
 * Check if request has valid cache headers (ETag, If-Modified-Since)
 */
export function checkCacheHeaders(request: Request, etag: string, lastModified?: Date): boolean {
  // Check If-None-Match (ETag)
  const ifNoneMatch = request.headers.get('If-None-Match')
  if (ifNoneMatch && ifNoneMatch === etag) {
    return true
  }

  // Check If-Modified-Since
  if (lastModified) {
    const ifModifiedSince = request.headers.get('If-Modified-Since')
    if (ifModifiedSince) {
      const ifModifiedSinceDate = new Date(ifModifiedSince)
      if (lastModified <= ifModifiedSinceDate) {
        return true
      }
    }
  }

  return false
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}

/**
 * Cache warming utility for frequently accessed content
 */
export class CacheWarmer {
  private static instance: CacheWarmer
  private warmingQueue: Set<string> = new Set()

  static getInstance(): CacheWarmer {
    if (!CacheWarmer.instance) {
      CacheWarmer.instance = new CacheWarmer()
    }
    return CacheWarmer.instance
  }

  /**
   * Add URL to warming queue
   */
  addToWarmingQueue(url: string): void {
    this.warmingQueue.add(url)
  }

  /**
   * Warm cache for popular content
   */
  async warmCache(): Promise<void> {
    const urls = Array.from(this.warmingQueue)
    this.warmingQueue.clear()

    // Warm cache in batches to avoid overwhelming the server
    const batchSize = 5
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (url) => {
          try {
            await fetch(url, { method: 'HEAD' })
          } catch (error) {
            console.warn(`Failed to warm cache for ${url}:`, error)
          }
        }),
      )
    }
  }

  /**
   * Get popular journal entries for cache warming
   */
  getPopularContent(): string[] {
    // This would typically come from analytics or database queries
    // For now, return some common endpoints
    return [
      '/api/public/journals?limit=10&sortBy=publishedAt&sortOrder=desc',
      '/api/public/categories',
      '/api/public/tags',
    ]
  }
}

/**
 * Performance monitoring for cache effectiveness
 */
export class CacheMetrics {
  private static metrics: Map<string, { hits: number; misses: number; lastAccess: Date }> =
    new Map()

  static recordHit(cacheKey: string): void {
    const current = this.metrics.get(cacheKey) || { hits: 0, misses: 0, lastAccess: new Date() }
    current.hits++
    current.lastAccess = new Date()
    this.metrics.set(cacheKey, current)
  }

  static recordMiss(cacheKey: string): void {
    const current = this.metrics.get(cacheKey) || { hits: 0, misses: 0, lastAccess: new Date() }
    current.misses++
    current.lastAccess = new Date()
    this.metrics.set(cacheKey, current)
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [key, value] of this.metrics.entries()) {
      const total = value.hits + value.misses
      result[key] = {
        ...value,
        total,
        hitRate: total > 0 ? ((value.hits / total) * 100).toFixed(2) + '%' : '0%',
      }
    }

    return result
  }

  static clearOldMetrics(olderThanHours: number = 24): void {
    if (olderThanHours === 0) {
      // Clear all metrics if olderThanHours is 0
      this.metrics.clear()
      return
    }

    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)

    for (const [key, value] of this.metrics.entries()) {
      if (value.lastAccess < cutoff) {
        this.metrics.delete(key)
      }
    }
  }
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidator {
  /**
   * Invalidate cache for journal-related content
   */
  static async invalidateJournalCache(journalId?: string): Promise<void> {
    // In a real application, this would invalidate CDN cache or Redis cache
    // For now, we'll log the invalidation
    console.log(`Cache invalidation triggered for journal: ${journalId || 'all'}`)

    // Clear metrics for invalidated content
    if (journalId) {
      CacheMetrics.recordMiss(`journals:entry:${journalId}`)
    } else {
      // Clear all journal-related metrics
      const metrics = CacheMetrics.getMetrics()
      Object.keys(metrics).forEach((key) => {
        if (key.startsWith('journals:')) {
          CacheMetrics.recordMiss(key)
        }
      })
    }
  }

  /**
   * Invalidate cache for category-related content
   */
  static async invalidateCategoryCache(categoryId?: string): Promise<void> {
    console.log(`Cache invalidation triggered for category: ${categoryId || 'all'}`)

    // Invalidate journal lists that might be filtered by this category
    CacheMetrics.recordMiss('journals:list')
    CacheMetrics.recordMiss('categories:list')
  }

  /**
   * Invalidate cache for tag-related content
   */
  static async invalidateTagCache(tagId?: string): Promise<void> {
    console.log(`Cache invalidation triggered for tag: ${tagId || 'all'}`)

    // Invalidate journal lists that might be filtered by this tag
    CacheMetrics.recordMiss('journals:list')
    CacheMetrics.recordMiss('tags:list')
  }
}
