'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { JournalState, JournalAction, initialJournalState } from '../types/state'

// Journal reducer function
function journalReducer(state: JournalState, action: JournalAction): JournalState {
  // Small helper to shallow-compare filter objects to avoid unnecessary state updates
  const shallowEqual = (a: Record<string, any>, b: Record<string, any>) => {
    const aKeys = Object.keys(a || {})
    const bKeys = Object.keys(b || {})
    if (aKeys.length !== bKeys.length) return false
    for (let i = 0; i < aKeys.length; i++) {
      const key = aKeys[i]
      if (a[key] !== b[key]) return false
    }
    return true
  }

  switch (action.type) {
    case 'SET_ENTRIES':
      return {
        ...state,
        entries: action.payload.entries,
        pagination: action.payload.pagination,
        loading: { ...state.loading, entries: false },
        error: null,
      }

    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        loading: { ...state.loading, categories: false },
        error: null,
      }

    case 'SET_TAGS':
      return {
        ...state,
        tags: action.payload,
        loading: { ...state.loading, tags: false },
        error: null,
      }

    case 'SET_CURRENT_ENTRY':
      return {
        ...state,
        currentEntry: action.payload,
        loading: { ...state.loading, currentEntry: false },
        error: null,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
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
      }

    case 'SET_FILTERS': // Merge incoming payload with existing filters
    {
      const merged = { ...state.filters, ...action.payload }
      // If filters would be identical, return the same state reference to avoid rerenders
      if (shallowEqual(merged, state.filters)) return state
      return {
        ...state,
        filters: merged,
      }
    }

    case 'CLEAR_FILTERS':
      // Only clear if there are actually filters present
      if (!state.filters || Object.keys(state.filters).length === 0) return state
      return {
        ...state,
        filters: {},
      }

    case 'SET_MULTIPLE_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      }

    case 'RESET_STATE':
      return initialJournalState

    default:
      return state
  }
}

// Context interface
interface JournalContextType {
  state: JournalState
  dispatch: React.Dispatch<JournalAction>
}

// Create context
const JournalContext = createContext<JournalContextType | undefined>(undefined)

// Provider component
interface JournalProviderProps {
  children: ReactNode
}

export function JournalProvider({ children }: JournalProviderProps) {
  const [state, dispatch] = useReducer(journalReducer, initialJournalState)

  return <JournalContext.Provider value={{ state, dispatch }}>{children}</JournalContext.Provider>
}

// Custom hook to use journal context
export function useJournalContext() {
  const context = useContext(JournalContext)
  if (context === undefined) {
    throw new Error('useJournalContext must be used within a JournalProvider')
  }
  return context
}
