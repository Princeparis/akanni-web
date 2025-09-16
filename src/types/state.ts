/**
 * State management types for React context and reducers
 * Based on requirements 4.2 and 4.4
 */

import { JournalEntry, Category, Tag } from './journal'
import { JournalFilters } from './api'

// Loading states for different operations
export interface LoadingStates {
  entries: boolean
  categories: boolean
  tags: boolean
  currentEntry: boolean
  filters: boolean
  pagination: boolean
  search: boolean
  retry: boolean
}

// Loading state keys for type safety
export type LoadingStateKey = keyof LoadingStates

// Pagination state
export interface PaginationState {
  currentPage: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

// Main journal state interface
export interface JournalState {
  entries: JournalEntry[]
  categories: Category[]
  tags: Tag[]
  currentEntry: JournalEntry | null
  pagination: PaginationState
  filters: JournalFilters
  loading: LoadingStates
  error: string | null
}

// Action types for state management
export type JournalAction =
  | { type: 'SET_ENTRIES'; payload: { entries: JournalEntry[]; pagination: PaginationState } }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_CURRENT_ENTRY'; payload: JournalEntry | null }
  | { type: 'SET_LOADING'; payload: { key: LoadingStateKey; value: boolean } }
  | { type: 'SET_MULTIPLE_LOADING'; payload: Partial<LoadingStates> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<JournalFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_STATE' }

// Initial state for journal context
export const initialJournalState: JournalState = {
  entries: [],
  categories: [],
  tags: [],
  currentEntry: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  },
  filters: {},
  loading: {
    entries: false,
    categories: false,
    tags: false,
    currentEntry: false,
    filters: false,
    pagination: false,
    search: false,
    retry: false,
  },
  error: null,
}
