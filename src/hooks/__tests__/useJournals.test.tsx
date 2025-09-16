/**
 * Unit tests for useJournals hook
 * Tests data fetching, caching, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { useJournals } from '../useJournals'
import { JournalProvider } from '../../contexts/JournalContext'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useLoadingStates
vi.mock('../useLoadingStates', () => ({
  useLoadingStates: () => ({
    withEntriesLoading: (fn: () => Promise<void>) => fn(),
  }),
}))

// Test wrapper
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <JournalProvider>{children}</JournalProvider>
)

describe('useJournals Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      expect(result.current.entries).toEqual([])
      expect(result.current.categories).toEqual([])
      expect(result.current.tags).toEqual([])
      expect(result.current.pagination).toEqual({})
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.fetchJournals).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should auto-fetch on mount when enabled', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [{ id: '1', title: 'Test Journal' }],
              page: 1,
              totalPages: 1,
              totalDocs: 1,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
              categories: [],
              tags: [],
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: true }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?')
      })

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(1)
        expect(result.current.entries[0].title).toBe('Test Journal')
      })
    })

    it('should not auto-fetch when disabled', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { docs: [] } }),
      })

      renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Manual Fetching', () => {
    it('should fetch journals with default parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [{ id: '1', title: 'Test Journal' }],
              page: 1,
              totalPages: 1,
              totalDocs: 1,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
              categories: [{ id: 'cat1', name: 'Category 1' }],
              tags: [{ id: 'tag1', name: 'Tag 1' }],
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.fetchJournals()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?')
      expect(result.current.entries).toHaveLength(1)
      expect(result.current.categories).toHaveLength(1)
      expect(result.current.tags).toHaveLength(1)
    })

    it('should fetch journals with custom parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 2,
              totalPages: 5,
              totalDocs: 50,
              hasNextPage: true,
              hasPrevPage: true,
              limit: 20,
              categories: [],
              tags: [],
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.fetchJournals({
          page: 2,
          limit: 20,
          category: 'technology',
          tags: ['react', 'javascript'],
          status: 'published',
          search: 'tutorial',
        })
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/public/journals?page=2&limit=20&category=technology&tags=react&tags=javascript&status=published&search=tutorial',
      )
    })

    it('should handle sorting parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.fetchJournals({
          sortBy: 'title',
          sortOrder: 'asc',
        })
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?sortBy=title&sortOrder=asc')
    })
  })

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [{ id: '1', title: 'Cached Journal' }],
              page: 1,
              totalPages: 1,
              totalDocs: 1,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
              categories: [],
              tags: [],
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      // First call
      await act(async () => {
        await result.current.fetchJournals({ category: 'tech' })
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call with same parameters (should use cache)
      await act(async () => {
        await result.current.fetchJournals({ category: 'tech' })
      })

      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional call
      expect(result.current.entries[0].title).toBe('Cached Journal')
    })

    it('should make new request for different parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.fetchJournals({ category: 'tech' })
      })

      await act(async () => {
        await result.current.fetchJournals({ category: 'design' })
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should expire cache after timeout', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await result.current.fetchJournals()
      })

      // Advance time beyond cache duration (5 minutes)
      act(() => {
        vi.advanceTimersByTime(6 * 60 * 1000)
      })

      await act(async () => {
        await result.current.fetchJournals()
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await expect(result.current.fetchJournals()).rejects.toThrow('HTTP error! status: 500')
      })
    })

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Invalid parameters' },
          }),
      })

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await expect(result.current.fetchJournals()).rejects.toThrow('Invalid parameters')
      })
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      await act(async () => {
        await expect(result.current.fetchJournals()).rejects.toThrow('Network error')
      })
    })
  })

  describe('Refetch Functionality', () => {
    it('should refetch with last used parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [{ id: '1', title: 'Refetched Journal' }],
              page: 1,
              totalPages: 1,
              totalDocs: 1,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      // Initial fetch with parameters
      await act(async () => {
        await result.current.fetchJournals({ category: 'tech', page: 2 })
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?category=tech&page=2')

      // Clear mock to verify refetch call
      mockFetch.mockClear()

      // Refetch should use same parameters
      await act(async () => {
        await result.current.refetch()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?category=tech&page=2')
    })

    it('should clear cache before refetching', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useJournals({ autoFetch: false }), {
        wrapper: TestWrapper,
      })

      // Initial fetch
      await act(async () => {
        await result.current.fetchJournals()
      })

      // Refetch should make new request even with same parameters
      await act(async () => {
        await result.current.refetch()
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Initial Parameters', () => {
    it('should merge initial parameters with fetch parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(
        () =>
          useJournals({
            autoFetch: false,
            initialParams: { status: 'published', limit: 20 },
          }),
        { wrapper: TestWrapper },
      )

      await act(async () => {
        await result.current.fetchJournals({ category: 'tech' })
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/public/journals?status=published&limit=20&category=tech',
      )
    })

    it('should allow fetch parameters to override initial parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              docs: [],
              page: 1,
              totalPages: 1,
              totalDocs: 0,
              hasNextPage: false,
              hasPrevPage: false,
              limit: 10,
            },
          }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const { result } = renderHook(
        () =>
          useJournals({
            autoFetch: false,
            initialParams: { status: 'draft', limit: 20 },
          }),
        { wrapper: TestWrapper },
      )

      await act(async () => {
        await result.current.fetchJournals({ status: 'published', limit: 10 })
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/public/journals?status=published&limit=10')
    })
  })
})
