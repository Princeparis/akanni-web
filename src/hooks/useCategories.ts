'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { Category } from '../types/journal'
import { APIResponse } from '../types/api'

interface UseCategoriesOptions {
  autoFetch?: boolean
  sortBy?: 'name' | 'journalCount'
  sortOrder?: 'asc' | 'desc'
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  refetch: () => Promise<void>
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { autoFetch = true, sortBy = 'name', sortOrder = 'asc' } = options
  const { state, dispatch } = useJournalContext()
  const cacheRef = useRef<{ data: Category[]; timestamp: number } | null>(null)

  // Cache duration: 15 minutes (categories change less frequently)
  const CACHE_DURATION = 15 * 60 * 1000

  const isValidCache = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  const fetchCategories = useCallback(async () => {
    // Check cache first
    if (cacheRef.current && isValidCache(cacheRef.current.timestamp)) {
      dispatch({ type: 'SET_CATEGORIES', payload: cacheRef.current.data })
      return
    }

    // Set loading state
    dispatch({ type: 'SET_LOADING', payload: { key: 'categories', value: true } })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Build query string
      const searchParams = new URLSearchParams()
      if (sortBy) searchParams.set('sortBy', sortBy)
      if (sortOrder) searchParams.set('sortOrder', sortOrder)

      const response = await fetch(`/api/categories?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<Category[]> = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const categories = result.data

      // Cache the result
      cacheRef.current = {
        data: categories,
        timestamp: Date.now(),
      }

      // Update state
      dispatch({ type: 'SET_CATEGORIES', payload: categories })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [dispatch, isValidCache, sortBy, sortOrder])

  const refetch = useCallback(async () => {
    // Clear cache and refetch
    cacheRef.current = null
    await fetchCategories()
  }, [fetchCategories])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCategories()
    }
  }, [autoFetch, fetchCategories])

  return {
    categories: state.categories,
    loading: state.loading.categories,
    error: state.error,
    fetchCategories,
    refetch,
  }
}
