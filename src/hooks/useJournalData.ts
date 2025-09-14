'use client'

import { useCallback, useEffect } from 'react'
import { useJournals } from './useJournals'
import { useJournalFilters } from './useJournalFilters'
import { useCategories } from './useCategories'
import { useTags } from './useTags'
import { JournalQueryParams } from '../types/api'

interface UseJournalDataOptions {
  autoFetch?: boolean
  initialParams?: JournalQueryParams
}

interface UseJournalDataReturn {
  // Data
  entries: any[]
  categories: any[]
  tags: any[]
  pagination: any

  // Loading states
  loading: {
    entries: boolean
    categories: boolean
    tags: boolean
  }

  // Error state
  error: string | null

  // Filters
  filters: any
  setFilter: (key: keyof import('../types/api').JournalFilters, value: any) => void
  setFilters: (filters: any) => void
  clearFilters: () => void
  hasActiveFilters: boolean

  // Actions
  fetchJournals: (params?: JournalQueryParams) => Promise<void>
  refetchAll: () => Promise<void>
}

export function useJournalData(options: UseJournalDataOptions = {}): UseJournalDataReturn {
  const { autoFetch = true, initialParams = {} } = options

  const {
    entries,
    pagination,
    loading: entriesLoading,
    error: entriesError,
    fetchJournals,
    refetch: refetchJournals,
  } = useJournals({ autoFetch, initialParams })

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories({ autoFetch })

  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
    refetch: refetchTags,
  } = useTags({ autoFetch })

  const { filters, setFilter, setFilters, clearFilters, hasActiveFilters } = useJournalFilters()

  // Combined error state (prioritize entries error)
  const error = entriesError || categoriesError || tagsError

  // Combined loading state
  const loading = {
    entries: entriesLoading,
    categories: categoriesLoading,
    tags: tagsLoading,
  }

  // Refetch all data
  const refetchAll = useCallback(async () => {
    await Promise.all([refetchJournals(), refetchCategories(), refetchTags()])
  }, [refetchJournals, refetchCategories, refetchTags])

  // Auto-fetch journals when filters change
  useEffect(() => {
    if (autoFetch) {
      const queryParams: JournalQueryParams = {
        ...initialParams,
        ...filters,
        page: 1, // Reset to first page when filters change
      }
      fetchJournals(queryParams)
    }
  }, [filters, autoFetch, initialParams, fetchJournals])

  return {
    // Data
    entries,
    categories,
    tags,
    pagination,

    // Loading states
    loading,

    // Error state
    error,

    // Filters
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,

    // Actions
    fetchJournals,
    refetchAll,
  }
}
