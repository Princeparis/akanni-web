/**
 * Custom hooks for journal data fetching and state management
 * Based on requirements 5.2, 5.3, 5.6, and 5.7
 */

export { useJournals } from './useJournals'
export { useJournalEntry } from './useJournalEntry'
export { useCategories } from './useCategories'
export { useTags } from './useTags'
export { useJournalFilters } from './useJournalFilters'
export { useJournalData } from './useJournalData'

// Loading state management hooks
export {
  useLoadingStates,
  useEntriesLoading,
  useEntryLoading,
  useFiltersLoading,
  useSearchLoading,
} from './useLoadingStates'

// Re-export context hook for convenience
export { useJournalContext } from '../contexts/JournalContext'
