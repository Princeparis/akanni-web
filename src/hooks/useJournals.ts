'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { useEntriesLoading } from './useLoadingStates'
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
  const { withEntriesLoading } = useEntriesLoading()
  // Keep a ref to withEntriesLoading so its identity changes (driven by loading
  // state) don't force fetchJournals to be recreated on every loading toggle.
  const withEntriesLoadingRef = useRef(withEntriesLoading)
  useEffect(() => {
    withEntriesLoadingRef.current = withEntriesLoading
  }, [withEntriesLoading])
  // Keep a ref to the latest state to avoid stale closures inside fetchJournals
  const stateRef = useRef(state)
  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state
  }, [state])
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
      // Use the ref'd version to avoid creating a new fetchJournals when
      // loading state changes (which would retrigger the auto-fetch effect).
      return withEntriesLoadingRef.current(async () => {
        const mergedParams = { ...initialParams, ...params }
        const cacheKey = getCacheKey(mergedParams)

        // Debug: trace fetch calls and merged params to help identify update loops
        // Use a guarded, rate-limited logger to avoid console flood during e2e runs
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const win = (globalThis as any).window as any
          if (win && win.__DEBUG_JOURNALS__) {
            win.___journal_log_counter = (win.___journal_log_counter || 0) + 1
            if (win.___journal_log_counter <= 50) {
              // eslint-disable-next-line no-console
              console.debug('[useJournals] [origin:useJournals] fetchJournals called', {
                mergedParams,
                cacheKey,
                count: win.___journal_log_counter,
              })
            } else if (win.___journal_log_counter === 51) {
              // eslint-disable-next-line no-console
              console.debug(
                '[useJournals] [origin:useJournals] logging suppressed after 50 messages',
              )
            }
          }
        } catch (e) {
          // ignore logging errors in non-browser environments
        }

        // Check cache first
        const cached = cacheRef.current.get(cacheKey)
        if (cached && isValidCache(cached.timestamp)) {
          // Debug: using cached response (guarded)
          try {
            const win = (globalThis as any).window as any
            if (win && win.__DEBUG_JOURNALS__ && win.___journal_log_counter <= 50) {
              // eslint-disable-next-line no-console
              console.debug('[useJournals] [origin:useJournals] using cache', {
                cacheKey,
                docs: cached.data.docs.length,
              })
            }
          } catch (e) {}
          // Only dispatch if cached data differs from current state to avoid
          // unnecessary state updates and possible render loops.
          const currentEntries = stateRef.current.entries || []
          const cachedDocs = cached.data.docs || []
          const entriesChanged =
            currentEntries.length !== cachedDocs.length ||
            (currentEntries.length > 0 &&
              cachedDocs.length > 0 &&
              currentEntries[0].id !== cachedDocs[0].id)

          if (entriesChanged) {
            dispatch({
              type: 'SET_ENTRIES',
              payload: {
                entries: cachedDocs,
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
          }

          // Update categories and tags if they exist
          if (cached.data.categories) {
            // Only dispatch if categories changed (shallow check)
            const currentCats = stateRef.current.categories || []
            const newCats = cached.data.categories || []
            if (
              currentCats.length !== newCats.length ||
              (currentCats[0] && newCats[0] && currentCats[0].id !== newCats[0].id)
            ) {
              dispatch({ type: 'SET_CATEGORIES', payload: newCats })
            }
          }
          if (cached.data.tags) {
            const currentTags = stateRef.current.tags || []
            const newTags = cached.data.tags || []
            if (
              currentTags.length !== newTags.length ||
              (currentTags[0] && newTags[0] && currentTags[0].id !== newTags[0].id)
            ) {
              dispatch({ type: 'SET_TAGS', payload: newTags })
            }
          }

          return
        }

        dispatch({ type: 'SET_ERROR', payload: null })
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

        // Debug: about to dispatch fetched entries (guarded)
        try {
          const win = (globalThis as any).window as any
          if (win && win.__DEBUG_JOURNALS__ && win.___journal_log_counter <= 50) {
            // eslint-disable-next-line no-console
            console.debug('[useJournals] [origin:useJournals] dispatching SET_ENTRIES', {
              entries: data.docs.length,
              page: data.page,
              totalPages: data.totalPages,
            })
          }
        } catch (e) {}

        // Update state
        // Only dispatch when fetched data differs from current state to
        // prevent unnecessary updates which can trigger effects and loops.
        const currentEntries = stateRef.current.entries || []
        const fetchedDocs = data.docs || []
        const entriesChanged =
          currentEntries.length !== fetchedDocs.length ||
          (currentEntries.length > 0 &&
            fetchedDocs.length > 0 &&
            currentEntries[0].id !== fetchedDocs[0].id)

        if (entriesChanged) {
          dispatch({
            type: 'SET_ENTRIES',
            payload: {
              entries: fetchedDocs,
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
        }

        // Update categories and tags
        if (data.categories) {
          const currentCats = stateRef.current.categories || []
          const newCats = data.categories || []
          if (
            currentCats.length !== newCats.length ||
            (currentCats[0] && newCats[0] && currentCats[0].id !== newCats[0].id)
          ) {
            dispatch({ type: 'SET_CATEGORIES', payload: newCats })
          }
        }
        if (data.tags) {
          const currentTags = stateRef.current.tags || []
          const newTags = data.tags || []
          if (
            currentTags.length !== newTags.length ||
            (currentTags[0] && newTags[0] && currentTags[0].id !== newTags[0].id)
          ) {
            dispatch({ type: 'SET_TAGS', payload: newTags })
          }
        }

        // Store last successful params for refetch
        lastParamsRef.current = mergedParams
      })
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
