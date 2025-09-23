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
  fetchEntry: (id: string) => Promise<void>
  clearEntry: () => void
  refetch: () => Promise<void>
}

export function useJournalEntry(options: UseJournalEntryOptions = {}): UseJournalEntryReturn {
  const { autoFetch = false } = options
  const { state, dispatch } = useJournalContext()
  const { withEntryLoading } = useEntryLoading()
  // Keep a ref to the latest withEntryLoading so we can avoid including it
  // in fetchEntry's dependency list. This prevents fetchEntry from changing
  // identity when withEntryLoading is recreated (defensive against unstable
  // identities from upstream hooks).
  const withEntryLoadingRef = useRef(withEntryLoading)
  useEffect(() => {
    withEntryLoadingRef.current = withEntryLoading
  }, [withEntryLoading])
  const lastIdRef = useRef<string | null>(null)
  const cacheRef = useRef<Map<string, { data: JournalEntry; timestamp: number }>>(new Map())

  // Cache duration: 10 minutes (longer for individual entries)
  const CACHE_DURATION = 10 * 60 * 1000

  const isValidCache = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  const fetchEntry = useCallback(
    async (id: string) => {
      if (!id) {
        dispatch({ type: 'SET_ERROR', payload: 'id is required' })
        return
      }

      return withEntryLoadingRef.current(async () => {
        // Check cache first
        const cached = cacheRef.current.get(id)
        if (cached && isValidCache(cached.timestamp)) {
          dispatch({ type: 'SET_CURRENT_ENTRY', payload: cached.data })
          return
        }

        dispatch({ type: 'SET_ERROR', payload: null })

        // Try private API first, then fall back to public route
        const paths = [
          `/api/journals/${encodeURIComponent(id)}`,
          `/api/public/journals/${encodeURIComponent(id)}`,
        ]
        let lastErr: Error | null = null
        let response: Response | null = null

        for (const path of paths) {
          try {
            response = await fetch(path)
            if (!response.ok) {
              // If 404 on private route, try next; if other error, capture and continue
              if (response.status === 404) {
                lastErr = new Error('Journal entry not found')
                response = null
                continue
              }
              lastErr = new Error(`HTTP error! status: ${response.status}`)
              response = null
              continue
            }
            // got a 2xx
            break
          } catch (err: any) {
            lastErr = err
            response = null
            continue
          }
        }

        if (!response) {
          throw lastErr || new Error('Failed to fetch journal entry')
        }

        const resultOrEntry = await response.json()

        // Support both the APIResponse wrapper and raw entry object
        let entry: JournalEntry
        if ((resultOrEntry as APIResponse<JournalEntry>).hasOwnProperty('success')) {
          const apiRes = resultOrEntry as APIResponse<JournalEntry>
          if (!apiRes.success) throw new Error(apiRes.error?.message || 'API returned an error')
          entry = apiRes.data
        } else {
          entry = resultOrEntry as JournalEntry
        }

        // Cache the result
        cacheRef.current.set(id, {
          data: entry,
          timestamp: Date.now(),
        })

        // Update state
        dispatch({ type: 'SET_CURRENT_ENTRY', payload: entry })

        // Store last successful id for refetch
        lastIdRef.current = id
      })
    },
    [dispatch, isValidCache],
  )

  const clearEntry = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: null })
    lastIdRef.current = null
  }, [dispatch])

  const refetch = useCallback(async () => {
    if (lastIdRef.current) {
      // Clear cache for current id and refetch
      cacheRef.current.delete(lastIdRef.current)
      await fetchEntry(lastIdRef.current)
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
