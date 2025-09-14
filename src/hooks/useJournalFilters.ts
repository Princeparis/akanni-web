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
      dispatch({
        type: 'SET_FILTERS',
        payload: { [key]: value },
      })
    },
    [dispatch],
  )

  const setFilters = useCallback(
    (filters: Partial<JournalFilters>) => {
      dispatch({
        type: 'SET_FILTERS',
        payload: filters,
      })
    },
    [dispatch],
  )

  const updateFilters = useCallback(
    (filters: Partial<JournalFilters>) => {
      dispatch({
        type: 'SET_FILTERS',
        payload: filters,
      })
    },
    [dispatch],
  )

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }, [dispatch])

  const clearFilter = useCallback(
    (key: keyof JournalFilters) => {
      const newFilters = { ...state.filters }
      delete newFilters[key]
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
