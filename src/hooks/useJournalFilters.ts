'use client'

import { useCallback } from 'react'
import { useJournalContext } from '../contexts/JournalContext'
import { JournalFilters } from '../types/api'

interface UseJournalFiltersReturn {
  filters: JournalFilters
  setFilter: (key: keyof JournalFilters, value: any) => void
  setFilters: (filters: Partial<JournalFilters>) => void
  updateFilters: (filters: Partial<JournalFilters>) => void
  clearFilters: () => void
  clearFilter: (key: keyof JournalFilters) => void
  hasActiveFilters: boolean
}

export function useJournalFilters(): UseJournalFiltersReturn {
  const { state, dispatch } = useJournalContext()

  const setFilter = useCallback(
    (key: keyof JournalFilters, value: any) => {
      // Avoid dispatching if the value is unchanged
      const current = state.filters[key]
      if (current === value) return
      dispatch({
        type: 'SET_FILTERS',
        payload: { [key]: value },
      })
    },
    [dispatch, state.filters],
  )

  const setFilters = useCallback(
    (filters: Partial<JournalFilters>) => {
      // Shallow compare to avoid unnecessary dispatch
      const merged = { ...state.filters, ...filters }
      const keys = Object.keys(merged)
      const same = keys.every((k) => (state.filters as any)[k] === (merged as any)[k])
      if (same) return
      dispatch({
        type: 'SET_FILTERS',
        payload: filters,
      })
    },
    [dispatch, state.filters],
  )

  const updateFilters = useCallback(
    (filters: Partial<JournalFilters>) => {
      // Shallow compare to avoid unnecessary dispatch
      const merged = { ...state.filters, ...filters }
      const keys = Object.keys(merged)
      const same = keys.every((k) => (state.filters as any)[k] === (merged as any)[k])
      if (same) return
      dispatch({
        type: 'SET_FILTERS',
        payload: filters,
      })
    },
    [dispatch, state.filters],
  )

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }, [dispatch])

  const clearFilter = useCallback(
    (key: keyof JournalFilters) => {
      if (!Object.prototype.hasOwnProperty.call(state.filters, key)) return
      const newFilters = { ...state.filters }
      delete newFilters[key]
      // If removing the key doesn't change filters (shouldn't happen), skip
      const keys = Object.keys(newFilters)
      const same = keys.every((k) => (state.filters as any)[k] === (newFilters as any)[k])
      if (same) return
      dispatch({
        type: 'SET_FILTERS',
        payload: newFilters,
      })
    },
    [dispatch, state.filters],
  )

  const hasActiveFilters = Object.keys(state.filters).some((key) => {
    const value = state.filters[key as keyof JournalFilters]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== undefined && value !== null && value !== ''
  })

  return {
    filters: state.filters,
    setFilter,
    setFilters,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
  }
}
