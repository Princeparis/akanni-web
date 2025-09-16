/**
 * Unit tests for Journal Context
 * Tests reducer logic and context provider
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, renderHook, act } from '@testing-library/react'
import { JournalProvider, useJournalContext } from '../JournalContext'
import { JournalState, JournalAction, initialJournalState } from '../../types/state'
import { ReactNode } from 'react'

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <JournalProvider>{children}</JournalProvider>
)

describe('JournalContext', () => {
  describe('JournalProvider', () => {
    it('should render children without errors', () => {
      const TestComponent = () => <div>Test Content</div>

      const { getByText } = render(
        <JournalProvider>
          <TestComponent />
        </JournalProvider>,
      )

      expect(getByText('Test Content')).toBeDefined()
    })

    it('should provide initial state', () => {
      const { result } = renderHook(() => useJournalContext(), {
        wrapper: TestWrapper,
      })

      expect(result.current.state).toEqual(initialJournalState)
      expect(typeof result.current.dispatch).toBe('function')
    })
  })

  describe('useJournalContext', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useJournalContext())
      }).toThrow('useJournalContext must be used within a JournalProvider')
    })

    it('should return context value when used within provider', () => {
      const { result } = renderHook(() => useJournalContext(), {
        wrapper: TestWrapper,
      })

      expect(result.current).toHaveProperty('state')
      expect(result.current).toHaveProperty('dispatch')
    })
  })

  describe('Journal Reducer', () => {
    let initialState: JournalState

    beforeEach(() => {
      initialState = { ...initialJournalState }
    })

    describe('SET_ENTRIES action', () => {
      it('should set entries and pagination', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        const mockEntries = [
          { id: '1', title: 'Test Entry 1', slug: 'test-1' },
          { id: '2', title: 'Test Entry 2', slug: 'test-2' },
        ]

        const mockPagination = {
          currentPage: 1,
          totalPages: 5,
          totalDocs: 50,
          hasNextPage: true,
          hasPrevPage: false,
          limit: 10,
        }

        act(() => {
          result.current.dispatch({
            type: 'SET_ENTRIES',
            payload: {
              entries: mockEntries,
              pagination: mockPagination,
            },
          })
        })

        expect(result.current.state.entries).toEqual(mockEntries)
        expect(result.current.state.pagination).toEqual(mockPagination)
        expect(result.current.state.loading.entries).toBe(false)
        expect(result.current.state.error).toBeNull()
      })
    })

    describe('SET_CATEGORIES action', () => {
      it('should set categories and clear loading state', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        const mockCategories = [
          { id: '1', name: 'Technology', slug: 'technology' },
          { id: '2', name: 'Design', slug: 'design' },
        ]

        act(() => {
          result.current.dispatch({
            type: 'SET_CATEGORIES',
            payload: mockCategories,
          })
        })

        expect(result.current.state.categories).toEqual(mockCategories)
        expect(result.current.state.loading.categories).toBe(false)
        expect(result.current.state.error).toBeNull()
      })
    })

    describe('SET_TAGS action', () => {
      it('should set tags and clear loading state', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        const mockTags = [
          { id: '1', name: 'React', slug: 'react' },
          { id: '2', name: 'JavaScript', slug: 'javascript' },
        ]

        act(() => {
          result.current.dispatch({
            type: 'SET_TAGS',
            payload: mockTags,
          })
        })

        expect(result.current.state.tags).toEqual(mockTags)
        expect(result.current.state.loading.tags).toBe(false)
        expect(result.current.state.error).toBeNull()
      })
    })

    describe('SET_CURRENT_ENTRY action', () => {
      it('should set current entry and clear loading state', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        const mockEntry = {
          id: '1',
          title: 'Test Entry',
          slug: 'test-entry',
          content: { root: { children: [] } },
        }

        act(() => {
          result.current.dispatch({
            type: 'SET_CURRENT_ENTRY',
            payload: mockEntry,
          })
        })

        expect(result.current.state.currentEntry).toEqual(mockEntry)
        expect(result.current.state.loading.currentEntry).toBe(false)
        expect(result.current.state.error).toBeNull()
      })

      it('should handle null current entry', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_CURRENT_ENTRY',
            payload: null,
          })
        })

        expect(result.current.state.currentEntry).toBeNull()
        expect(result.current.state.loading.currentEntry).toBe(false)
      })
    })

    describe('SET_LOADING action', () => {
      it('should set specific loading state', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_LOADING',
            payload: { key: 'entries', value: true },
          })
        })

        expect(result.current.state.loading.entries).toBe(true)
        expect(result.current.state.loading.categories).toBe(false) // Other states unchanged
      })

      it('should handle multiple loading states', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_LOADING',
            payload: { key: 'categories', value: true },
          })
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_LOADING',
            payload: { key: 'tags', value: true },
          })
        })

        expect(result.current.state.loading.categories).toBe(true)
        expect(result.current.state.loading.tags).toBe(true)
        expect(result.current.state.loading.entries).toBe(false)
      })
    })

    describe('SET_ERROR action', () => {
      it('should set error and clear all loading states', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        // First set some loading states
        act(() => {
          result.current.dispatch({
            type: 'SET_MULTIPLE_LOADING',
            payload: {
              entries: true,
              categories: true,
              tags: true,
              currentEntry: true,
            },
          })
        })

        // Then set error
        act(() => {
          result.current.dispatch({
            type: 'SET_ERROR',
            payload: 'Something went wrong',
          })
        })

        expect(result.current.state.error).toBe('Something went wrong')
        expect(result.current.state.loading).toEqual({
          entries: false,
          categories: false,
          tags: false,
          currentEntry: false,
          filters: false,
          pagination: false,
          search: false,
          retry: false,
        })
      })

      it('should clear error when payload is null', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_ERROR',
            payload: null,
          })
        })

        expect(result.current.state.error).toBeNull()
      })
    })

    describe('SET_FILTERS action', () => {
      it('should merge filters with existing state', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        // Set initial filters
        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: { category: 'technology', search: 'react' },
          })
        })

        expect(result.current.state.filters).toEqual({
          category: 'technology',
          search: 'react',
        })

        // Update filters (should merge)
        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: { tags: ['javascript'], status: 'published' },
          })
        })

        expect(result.current.state.filters).toEqual({
          category: 'technology',
          search: 'react',
          tags: ['javascript'],
          status: 'published',
        })
      })

      it('should overwrite existing filter values', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: { category: 'technology' },
          })
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: { category: 'design' },
          })
        })

        expect(result.current.state.filters.category).toBe('design')
      })
    })

    describe('CLEAR_FILTERS action', () => {
      it('should clear all filters', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        // Set some filters first
        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: {
              category: 'technology',
              tags: ['react', 'javascript'],
              search: 'tutorial',
            },
          })
        })

        // Clear filters
        act(() => {
          result.current.dispatch({
            type: 'CLEAR_FILTERS',
          })
        })

        expect(result.current.state.filters).toEqual({})
      })
    })

    describe('SET_MULTIPLE_LOADING action', () => {
      it('should set multiple loading states at once', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_MULTIPLE_LOADING',
            payload: {
              entries: true,
              categories: true,
              search: true,
            },
          })
        })

        expect(result.current.state.loading.entries).toBe(true)
        expect(result.current.state.loading.categories).toBe(true)
        expect(result.current.state.loading.search).toBe(true)
        expect(result.current.state.loading.tags).toBe(false) // Unchanged
      })
    })

    describe('RESET_STATE action', () => {
      it('should reset state to initial values', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        // Modify state
        act(() => {
          result.current.dispatch({
            type: 'SET_ENTRIES',
            payload: {
              entries: [{ id: '1', title: 'Test' }],
              pagination: { currentPage: 2, totalPages: 5 },
            },
          })
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_FILTERS',
            payload: { category: 'test' },
          })
        })

        act(() => {
          result.current.dispatch({
            type: 'SET_ERROR',
            payload: 'Test error',
          })
        })

        // Reset state
        act(() => {
          result.current.dispatch({
            type: 'RESET_STATE',
          })
        })

        expect(result.current.state).toEqual(initialJournalState)
      })
    })

    describe('Unknown action', () => {
      it('should return current state for unknown action', () => {
        const { result } = renderHook(() => useJournalContext(), {
          wrapper: TestWrapper,
        })

        const stateBefore = result.current.state

        act(() => {
          result.current.dispatch({
            type: 'UNKNOWN_ACTION' as any,
            payload: 'test',
          })
        })

        expect(result.current.state).toEqual(stateBefore)
      })
    })
  })
})
