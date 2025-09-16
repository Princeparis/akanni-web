'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { useEntryLoading } from './useLoadingStates'
import { JournalEntry } from '../types/journal'
import { APIResponse } from '../types/api'

interface UseJournalEntryOptions {
  autoFetch?: boolean
}

interface UseJournalEntryReturn {
  entry: JournalEntry | null
  loading: boolean
  error: string | null
  fetchEntry: (slug: string) => Promise<void>
  clearEntry: () => void
  refetch: () => Promise<void>
}

export function useJournalEntry(options: UseJournalEntryOptions = {}): UseJournalEntryReturn {
  const { autoFetch = false } = options
  const { state, dispatch } = useJournalContext()
  const { withEntryLoading } = useEntryLoading()
  const lastSlugRef = useRef<string | null>(null)
  const cacheRef = useRef<Map<string, { data: JournalEntry; timestamp: number }>>(new Map())

  // Cache duration: 10 minutes (longer for individual entries)
  const CACHE_DURATION = 10 * 60 * 1000

  const isValidCache = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  const fetchEntry = useCallback(
    async (slug: string) => {
      if (!slug) {
        dispatch({ type: 'SET_ERROR', payload: 'Slug is required' })
        return
      }

      return withEntryLoading(async () => {
        // Check cache first
        const cached = cacheRef.current.get(slug)
        if (cached && isValidCache(cached.timestamp)) {
          dispatch({ type: 'SET_CURRENT_ENTRY', payload: cached.data })
          return
        }

        dispatch({ type: 'SET_ERROR', payload: null })
        const response = await fetch(`/api/public/journals/${encodeURIComponent(slug)}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Journal entry not found')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: APIResponse<JournalEntry> = await response.json()

        if (!result.success) {
          throw new Error(result.error.message)
        }

        const entry = result.data

        // Cache the result
        cacheRef.current.set(slug, {
          data: entry,
          timestamp: Date.now(),
        })

        // Update state
        dispatch({ type: 'SET_CURRENT_ENTRY', payload: entry })

        // Store last successful slug for refetch
        lastSlugRef.current = slug
      })
    },
    [dispatch, isValidCache, withEntryLoading],
  )

  const clearEntry = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: null })
    lastSlugRef.current = null
  }, [dispatch])

  const refetch = useCallback(async () => {
    if (lastSlugRef.current) {
      // Clear cache for current slug and refetch
      cacheRef.current.delete(lastSlugRef.current)
      await fetchEntry(lastSlugRef.current)
    }
  }, [fetchEntry])

  return {
    entry: state.currentEntry,
    loading: state.loading.currentEntry,
    error: state.error,
    fetchEntry,
    clearEntry,
    refetch,
  }
}
