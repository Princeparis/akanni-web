/**
 * Loading States Management Hook
 * Provides utilities for managing loading states with smooth transitions
 */

import { useCallback, useRef, useEffect } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { LoadingStateKey } from '../types/state'

interface UseLoadingStatesReturn {
  // Loading state getters
  isLoading: (key: LoadingStateKey) => boolean
  isAnyLoading: () => boolean
  getLoadingStates: () => Record<LoadingStateKey, boolean>

  // Loading state setters
  setLoading: (key: LoadingStateKey, value: boolean) => void
  setMultipleLoading: (states: Partial<Record<LoadingStateKey, boolean>>) => void
  startLoading: (key: LoadingStateKey) => void
  stopLoading: (key: LoadingStateKey) => void

  // Batch operations
  startMultipleLoading: (keys: LoadingStateKey[]) => void
  stopMultipleLoading: (keys: LoadingStateKey[]) => void
  stopAllLoading: () => void

  // Async operation helpers
  withLoading: <T>(key: LoadingStateKey, operation: () => Promise<T>) => Promise<T>
  withMultipleLoading: <T>(keys: LoadingStateKey[], operation: () => Promise<T>) => Promise<T>
}

export function useLoadingStates(): UseLoadingStatesReturn {
  const { state, dispatch } = useJournalContext()
  const timeoutRefs = useRef<Map<LoadingStateKey, NodeJS.Timeout>>(new Map())

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
      timeoutRefs.current.clear()
    }
  }, [])

  // Loading state getters
  const isLoading = useCallback(
    (key: LoadingStateKey): boolean => {
      return state.loading[key]
    },
    [state.loading],
  )

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(state.loading).some((loading) => loading)
  }, [state.loading])

  const getLoadingStates = useCallback(() => {
    return { ...state.loading }
  }, [state.loading])

  // Loading state setters
  const setLoading = useCallback(
    (key: LoadingStateKey, value: boolean) => {
      // Clear any existing timeout for this key
      const existingTimeout = timeoutRefs.current.get(key)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        timeoutRefs.current.delete(key)
      }

      dispatch({
        type: 'SET_LOADING',
        payload: { key, value },
      })
    },
    [dispatch],
  )

  const setMultipleLoading = useCallback(
    (states: Partial<Record<LoadingStateKey, boolean>>) => {
      // Clear timeouts for all keys being set
      Object.keys(states).forEach((key) => {
        const existingTimeout = timeoutRefs.current.get(key as LoadingStateKey)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          timeoutRefs.current.delete(key as LoadingStateKey)
        }
      })

      dispatch({
        type: 'SET_MULTIPLE_LOADING',
        payload: states,
      })
    },
    [dispatch],
  )

  const startLoading = useCallback(
    (key: LoadingStateKey) => {
      setLoading(key, true)
    },
    [setLoading],
  )

  const stopLoading = useCallback(
    (key: LoadingStateKey) => {
      setLoading(key, false)
    },
    [setLoading],
  )

  // Batch operations
  const startMultipleLoading = useCallback(
    (keys: LoadingStateKey[]) => {
      const states = keys.reduce(
        (acc, key) => {
          acc[key] = true
          return acc
        },
        {} as Partial<Record<LoadingStateKey, boolean>>,
      )
      setMultipleLoading(states)
    },
    [setMultipleLoading],
  )

  const stopMultipleLoading = useCallback(
    (keys: LoadingStateKey[]) => {
      const states = keys.reduce(
        (acc, key) => {
          acc[key] = false
          return acc
        },
        {} as Partial<Record<LoadingStateKey, boolean>>,
      )
      setMultipleLoading(states)
    },
    [setMultipleLoading],
  )

  const stopAllLoading = useCallback(() => {
    const allStates = Object.keys(state.loading).reduce(
      (acc, key) => {
        acc[key as LoadingStateKey] = false
        return acc
      },
      {} as Record<LoadingStateKey, boolean>,
    )
    setMultipleLoading(allStates)
  }, [state.loading, setMultipleLoading])

  // Async operation helpers
  const withLoading = useCallback(
    async <T>(key: LoadingStateKey, operation: () => Promise<T>): Promise<T> => {
      try {
        startLoading(key)
        const result = await operation()
        return result
      } finally {
        // Add a small delay to prevent flickering for very fast operations
        const timeout = setTimeout(() => {
          stopLoading(key)
          timeoutRefs.current.delete(key)
        }, 100)
        timeoutRefs.current.set(key, timeout)
      }
    },
    [startLoading, stopLoading],
  )

  const withMultipleLoading = useCallback(
    async <T>(keys: LoadingStateKey[], operation: () => Promise<T>): Promise<T> => {
      try {
        startMultipleLoading(keys)
        const result = await operation()
        return result
      } finally {
        // Add a small delay to prevent flickering for very fast operations
        setTimeout(() => {
          stopMultipleLoading(keys)
        }, 100)
      }
    },
    [startMultipleLoading, stopMultipleLoading],
  )

  return {
    // Getters
    isLoading,
    isAnyLoading,
    getLoadingStates,

    // Setters
    setLoading,
    setMultipleLoading,
    startLoading,
    stopLoading,

    // Batch operations
    startMultipleLoading,
    stopMultipleLoading,
    stopAllLoading,

    // Async helpers
    withLoading,
    withMultipleLoading,
  }
}

// Specialized hooks for common loading patterns
export function useEntriesLoading() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingStates()

  return {
    isLoadingEntries: isLoading('entries'),
    startLoadingEntries: () => startLoading('entries'),
    stopLoadingEntries: () => stopLoading('entries'),
    withEntriesLoading: <T>(operation: () => Promise<T>) => withLoading('entries', operation),
  }
}

export function useEntryLoading() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingStates()

  return {
    isLoadingEntry: isLoading('currentEntry'),
    startLoadingEntry: () => startLoading('currentEntry'),
    stopLoadingEntry: () => stopLoading('currentEntry'),
    withEntryLoading: <T>(operation: () => Promise<T>) => withLoading('currentEntry', operation),
  }
}

export function useFiltersLoading() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingStates()

  return {
    isLoadingFilters: isLoading('filters'),
    startLoadingFilters: () => startLoading('filters'),
    stopLoadingFilters: () => stopLoading('filters'),
    withFiltersLoading: <T>(operation: () => Promise<T>) => withLoading('filters', operation),
  }
}

export function useSearchLoading() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingStates()

  return {
    isSearching: isLoading('search'),
    startSearching: () => startLoading('search'),
    stopSearching: () => stopLoading('search'),
    withSearchLoading: <T>(operation: () => Promise<T>) => withLoading('search', operation),
  }
}
