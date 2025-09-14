'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { Tag } from '../types/journal'
import { APIResponse } from '../types/api'

interface UseTagsOptions {
  autoFetch?: boolean
  sortBy?: 'name' | 'journalCount'
  sortOrder?: 'asc' | 'desc'
}

interface UseTagsReturn {
  tags: Tag[]
  loading: boolean
  error: string | null
  fetchTags: () => Promise<void>
  refetch: () => Promise<void>
}

export function useTags(options: UseTagsOptions = {}): UseTagsReturn {
  const { autoFetch = true, sortBy = 'name', sortOrder = 'asc' } = options
  const { state, dispatch } = useJournalContext()
  const cacheRef = useRef<{ data: Tag[]; timestamp: number } | null>(null)

  // Cache duration: 15 minutes (tags change less frequently)
  const CACHE_DURATION = 15 * 60 * 1000

  const isValidCache = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  const fetchTags = useCallback(async () => {
    // Check cache first
    if (cacheRef.current && isValidCache(cacheRef.current.timestamp)) {
      dispatch({ type: 'SET_TAGS', payload: cacheRef.current.data })
      return
    }

    // Set loading state
    dispatch({ type: 'SET_LOADING', payload: { key: 'tags', value: true } })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Build query string
      const searchParams = new URLSearchParams()
      if (sortBy) searchParams.set('sortBy', sortBy)
      if (sortOrder) searchParams.set('sortOrder', sortOrder)

      const response = await fetch(`/api/tags?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<Tag[]> = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const tags = result.data

      // Cache the result
      cacheRef.current = {
        data: tags,
        timestamp: Date.now(),
      }

      // Update state
      dispatch({ type: 'SET_TAGS', payload: tags })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tags'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [dispatch, isValidCache, sortBy, sortOrder])

  const refetch = useCallback(async () => {
    // Clear cache and refetch
    cacheRef.current = null
    await fetchTags()
  }, [fetchTags])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchTags()
    }
  }, [autoFetch, fetchTags])

  return {
    tags: state.tags,
    loading: state.loading.tags,
    error: state.error,
    fetchTags,
    refetch,
  }
}
