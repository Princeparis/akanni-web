/**
 * Tests for cache utilities
 * Based on requirements 5.2, 5.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateCacheKey,
  generateETag,
  generateCacheControl,
  checkCacheHeaders,
  CacheMetrics,
  CacheWarmer,
  CACHE_CONFIGS,
} from '../cache'

describe('Cache Utilities', () => {
  beforeEach(() => {
    // Clear metrics before each test
    CacheMetrics.clearOldMetrics(0)
  })

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { page: 1, limit: 10 },
      })

      const key2 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { page: 1, limit: 10 },
      })

      expect(key1).toBe(key2)
    })

    it('should generate different keys for different params', () => {
      const key1 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { page: 1, limit: 10 },
      })

      const key2 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { page: 2, limit: 10 },
      })

      expect(key1).not.toBe(key2)
    })

    it('should handle params in different order', () => {
      const key1 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { page: 1, limit: 10, category: 'tech' },
      })

      const key2 = generateCacheKey({
        collection: 'journals',
        operation: 'list',
        params: { category: 'tech', limit: 10, page: 1 },
      })

      expect(key1).toBe(key2)
    })

    it('should handle no params', () => {
      const key = generateCacheKey({
        collection: 'categories',
        operation: 'list',
      })

      expect(key).toBe('categories:list')
    })
  })

  describe('generateETag', () => {
    it('should generate consistent ETags for same data', () => {
      const data = { id: '1', title: 'Test', updatedAt: '2023-01-01' }
      const lastModified = new Date('2023-01-01')

      const etag1 = generateETag(data, lastModified)
      const etag2 = generateETag(data, lastModified)

      expect(etag1).toBe(etag2)
      expect(etag1).toMatch(/^"[a-f0-9]{32}"$/)
    })

    it('should generate different ETags for different data', () => {
      const data1 = { id: '1', title: 'Test 1' }
      const data2 = { id: '2', title: 'Test 2' }

      const etag1 = generateETag(data1)
      const etag2 = generateETag(data2)

      expect(etag1).not.toBe(etag2)
    })
  })

  describe('generateCacheControl', () => {
    it('should generate public cache control', () => {
      const config = {
        maxAge: 3600,
        staleWhileRevalidate: 300,
      }

      const cacheControl = generateCacheControl(config)
      expect(cacheControl).toBe('public, max-age=3600, stale-while-revalidate=300')
    })

    it('should generate private cache control', () => {
      const config = {
        maxAge: 1800,
        private: true,
      }

      const cacheControl = generateCacheControl(config)
      expect(cacheControl).toBe('private, max-age=1800')
    })

    it('should generate no-cache control', () => {
      const config = {
        maxAge: 0,
        noCache: true,
      }

      const cacheControl = generateCacheControl(config)
      expect(cacheControl).toBe('public, no-cache')
    })

    it('should include must-revalidate', () => {
      const config = {
        maxAge: 3600,
        mustRevalidate: true,
      }

      const cacheControl = generateCacheControl(config)
      expect(cacheControl).toBe('public, max-age=3600, must-revalidate')
    })
  })

  describe('checkCacheHeaders', () => {
    it('should return true for matching ETag', () => {
      const etag = '"abc123"'
      const request = new Request('http://example.com', {
        headers: {
          'If-None-Match': etag,
        },
      })

      const result = checkCacheHeaders(request, etag)
      expect(result).toBe(true)
    })

    it('should return true for valid If-Modified-Since', () => {
      const lastModified = new Date('2023-01-01T00:00:00Z')
      const ifModifiedSince = new Date('2023-01-01T00:00:00Z')

      const request = new Request('http://example.com', {
        headers: {
          'If-Modified-Since': ifModifiedSince.toUTCString(),
        },
      })

      const result = checkCacheHeaders(request, '"etag"', lastModified)
      expect(result).toBe(true)
    })

    it('should return false for newer content', () => {
      const lastModified = new Date('2023-01-02T00:00:00Z')
      const ifModifiedSince = new Date('2023-01-01T00:00:00Z')

      const request = new Request('http://example.com', {
        headers: {
          'If-Modified-Since': ifModifiedSince.toUTCString(),
        },
      })

      const result = checkCacheHeaders(request, '"etag"', lastModified)
      expect(result).toBe(false)
    })

    it('should return false for no cache headers', () => {
      const request = new Request('http://example.com')
      const result = checkCacheHeaders(request, '"etag"')
      expect(result).toBe(false)
    })
  })

  describe('CacheMetrics', () => {
    it('should record hits and misses', () => {
      const cacheKey = 'test:key'

      CacheMetrics.recordHit(cacheKey)
      CacheMetrics.recordHit(cacheKey)
      CacheMetrics.recordMiss(cacheKey)

      const metrics = CacheMetrics.getMetrics()
      expect(metrics[cacheKey]).toEqual({
        hits: 2,
        misses: 1,
        total: 3,
        hitRate: '66.67%',
        lastAccess: expect.any(Date),
      })
    })

    it('should calculate hit rate correctly', () => {
      const cacheKey = 'test:hitrate'

      CacheMetrics.recordHit(cacheKey)
      CacheMetrics.recordHit(cacheKey)
      CacheMetrics.recordHit(cacheKey)
      CacheMetrics.recordMiss(cacheKey)

      const metrics = CacheMetrics.getMetrics()
      expect(metrics[cacheKey].hitRate).toBe('75.00%')
    })

    it('should handle zero requests', () => {
      // Clear any existing metrics first
      CacheMetrics.clearOldMetrics(0)
      const metrics = CacheMetrics.getMetrics()
      expect(Object.keys(metrics)).toHaveLength(0)
    })
  })

  describe('CacheWarmer', () => {
    it('should be a singleton', () => {
      const warmer1 = CacheWarmer.getInstance()
      const warmer2 = CacheWarmer.getInstance()

      expect(warmer1).toBe(warmer2)
    })

    it('should add URLs to warming queue', () => {
      const warmer = CacheWarmer.getInstance()
      warmer.addToWarmingQueue('http://example.com/test')

      // Since warmingQueue is private, we can't directly test it
      // but we can test that warmCache doesn't throw
      expect(() => warmer.warmCache()).not.toThrow()
    })

    it('should return popular content URLs', () => {
      const warmer = CacheWarmer.getInstance()
      const popularUrls = warmer.getPopularContent()

      expect(Array.isArray(popularUrls)).toBe(true)
      expect(popularUrls.length).toBeGreaterThan(0)
      expect(popularUrls.every((url) => typeof url === 'string')).toBe(true)
    })
  })

  describe('CACHE_CONFIGS', () => {
    it('should have valid cache configurations', () => {
      expect(CACHE_CONFIGS.JOURNAL_LIST).toEqual({
        maxAge: expect.any(Number),
        staleWhileRevalidate: expect.any(Number),
      })

      expect(CACHE_CONFIGS.JOURNAL_ENTRY_PUBLISHED).toEqual({
        maxAge: expect.any(Number),
        staleWhileRevalidate: expect.any(Number),
      })

      expect(CACHE_CONFIGS.CATEGORIES).toEqual({
        maxAge: expect.any(Number),
        staleWhileRevalidate: expect.any(Number),
      })

      expect(CACHE_CONFIGS.TAGS).toEqual({
        maxAge: expect.any(Number),
        staleWhileRevalidate: expect.any(Number),
      })
    })

    it('should have longer cache for published entries than drafts', () => {
      expect(CACHE_CONFIGS.JOURNAL_ENTRY_PUBLISHED.maxAge).toBeGreaterThan(
        CACHE_CONFIGS.JOURNAL_ENTRY_DRAFT.maxAge,
      )
    })

    it('should have longer cache for categories and tags', () => {
      expect(CACHE_CONFIGS.CATEGORIES.maxAge).toBeGreaterThan(CACHE_CONFIGS.JOURNAL_LIST.maxAge)

      expect(CACHE_CONFIGS.TAGS.maxAge).toBeGreaterThan(CACHE_CONFIGS.JOURNAL_LIST.maxAge)
    })
  })
})
