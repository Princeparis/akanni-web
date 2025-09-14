'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { JournalState, JournalAction, initialJournalState } from '../types/state'

// Journal reducer function
function journalReducer(state: JournalState, action: JournalAction): JournalState {
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
        },
      }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      }

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {},
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
