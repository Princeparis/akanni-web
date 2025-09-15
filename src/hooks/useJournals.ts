'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { JournalQueryParams, JournalListResponse, APIResponse } from '../types/api'
import { JournalEntry } from '../types/journal'

interface UseJournalsOptions {
  autoFetch?: boolean
  initialParams?: JournalQueryParams
}

interface UseJournalsReturn {
  entries: JournalEntry[]
  categories: any[]
  tags: any[]
  pagination: any
  loading: boolean
  error: string | null
  fetchJournals: (params?: JournalQueryParams) => Promise<void>
  refetch: () => Promise<void>
}

export function useJournals(options: UseJournalsOptions = {}): UseJournalsReturn {
  const { autoFetch = true, initialParams = {} } = options
  const { state, dispatch } = useJournalContext()
  const lastParamsRef = useRef<JournalQueryParams>(initialParams)
  const cacheRef = useRef<Map<string, { data: JournalListResponse; timestamp: number }>>(new Map())

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  const getCacheKey = useCallback((params: JournalQueryParams): string => {
    return JSON.stringify(params)
  }, [])

  const isValidCache = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  const fetchJournals = useCallback(
    async (params: JournalQueryParams = {}) => {
      const mergedParams = { ...initialParams, ...params }
      const cacheKey = getCacheKey(mergedParams)

      // Check cache first
      const cached = cacheRef.current.get(cacheKey)
      if (cached && isValidCache(cached.timestamp)) {
        dispatch({
          type: 'SET_ENTRIES',
          payload: {
            entries: cached.data.docs,
            pagination: {
              currentPage: cached.data.page,
              totalPages: cached.data.totalPages,
              totalDocs: cached.data.totalDocs,
              hasNextPage: cached.data.hasNextPage,
              hasPrevPage: cached.data.hasPrevPage,
              limit: cached.data.limit,
            },
          },
        })

        // Update categories and tags if they exist
        if (cached.data.categories) {
          dispatch({ type: 'SET_CATEGORIES', payload: cached.data.categories })
        }
        if (cached.data.tags) {
          dispatch({ type: 'SET_TAGS', payload: cached.data.tags })
        }

        return
      }

      // Set loading state
      dispatch({ type: 'SET_LOADING', payload: { key: 'entries', value: true } })
      dispatch({ type: 'SET_ERROR', payload: null })

      try {
        // Build query string
        const searchParams = new URLSearchParams()

        if (mergedParams.page) searchParams.set('page', mergedParams.page.toString())
        if (mergedParams.limit) searchParams.set('limit', mergedParams.limit.toString())
        if (mergedParams.category) searchParams.set('category', mergedParams.category)
        if (mergedParams.tags?.length) {
          mergedParams.tags.forEach((tag) => searchParams.append('tags', tag))
        }
        if (mergedParams.status) searchParams.set('status', mergedParams.status)
        if (mergedParams.search) searchParams.set('search', mergedParams.search)
        if (mergedParams.sortBy) searchParams.set('sortBy', mergedParams.sortBy)
        if (mergedParams.sortOrder) searchParams.set('sortOrder', mergedParams.sortOrder)

        const response = await fetch(`/api/public/journals?${searchParams.toString()}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: APIResponse<JournalListResponse> = await response.json()

        if (!result.success) {
          throw new Error(result.error.message)
        }

        const data = result.data

        // Cache the result
        cacheRef.current.set(cacheKey, {
          data,
          timestamp: Date.now(),
        })

        // Update state
        dispatch({
          type: 'SET_ENTRIES',
          payload: {
            entries: data.docs,
            pagination: {
              currentPage: data.page,
              totalPages: data.totalPages,
              totalDocs: data.totalDocs,
              hasNextPage: data.hasNextPage,
              hasPrevPage: data.hasPrevPage,
              limit: data.limit,
            },
          },
        })

        // Update categories and tags
        if (data.categories) {
          dispatch({ type: 'SET_CATEGORIES', payload: data.categories })
        }
        if (data.tags) {
          dispatch({ type: 'SET_TAGS', payload: data.tags })
        }

        // Store last successful params for refetch
        lastParamsRef.current = mergedParams
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch journals'
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
      }
    },
    [dispatch, getCacheKey, initialParams, isValidCache],
  )

  const refetch = useCallback(async () => {
    // Clear cache for current params and refetch
    const cacheKey = getCacheKey(lastParamsRef.current)
    cacheRef.current.delete(cacheKey)
    await fetchJournals(lastParamsRef.current)
  }, [fetchJournals, getCacheKey])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchJournals(initialParams)
    }
  }, [autoFetch, fetchJournals, initialParams])

  return {
    entries: state.entries,
    categories: state.categories,
    tags: state.tags,
    pagination: state.pagination,
    loading: state.loading.entries,
    error: state.error,
    fetchJournals,
    refetch,
  }
}
