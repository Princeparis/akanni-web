import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { JournalProvider, useJournalContext } from '../../contexts/JournalContext'
import { initialJournalState } from '../../types/state'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { it } from 'vitest'

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <JournalProvider>{children}</JournalProvider>
)

describe('JournalContext', () => {
  it('should provide initial state', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    expect(result.current.state).toEqual(initialJournalState)
  })

  it('should handle SET_LOADING action', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: { key: 'entries', value: true },
      })
    })

    expect(result.current.state.loading.entries).toBe(true)
  })

  it('should handle SET_ERROR action', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: 'Test error',
      })
    })

    expect(result.current.state.error).toBe('Test error')
    expect(result.current.state.loading.entries).toBe(false)
  })

  it('should handle SET_FILTERS action', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    act(() => {
      result.current.dispatch({
        type: 'SET_FILTERS',
        payload: { category: 'test-category', search: 'test search' },
      })
    })

    expect(result.current.state.filters.category).toBe('test-category')
    expect(result.current.state.filters.search).toBe('test search')
  })

  it('should handle CLEAR_FILTERS action', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    // First set some filters
    act(() => {
      result.current.dispatch({
        type: 'SET_FILTERS',
        payload: { category: 'test-category' },
      })
    })

    // Then clear them
    act(() => {
      result.current.dispatch({ type: 'CLEAR_FILTERS' })
    })

    expect(result.current.state.filters).toEqual({})
  })

  it('should handle RESET_STATE action', () => {
    const { result } = renderHook(() => useJournalContext(), { wrapper })

    // First modify state
    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: 'Test error',
      })
    })

    // Then reset
    act(() => {
      result.current.dispatch({ type: 'RESET_STATE' })
    })

    expect(result.current.state).toEqual(initialJournalState)
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useJournalContext())
    }).toThrow('useJournalContext must be used within a JournalProvider')

    consoleSpy.mockRestore()
  })
})
