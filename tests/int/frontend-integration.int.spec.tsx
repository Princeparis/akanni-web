/**
 * Integration tests for frontend component integration with state management
 * Tests React components with real state management and API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { JournalProvider } from '../../src/contexts/JournalContext'
import { useJournals } from '../../src/hooks/useJournals'
import { useJournalEntry } from '../../src/hooks/useJournalEntry'
import { useCategories } from '../../src/hooks/useCategories'
import { useTags } from '../../src/hooks/useTags'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <JournalProvider>{children}</JournalProvider>
)

// Test component for useJournals hook
const TestJournalsComponent = ({ options = {} }: { options?: any }) => {
  const { entries, loading, error, fetchJournals } = useJournals(options)
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="entries-count">{entries.length}</div>
      <button onClick={() => fetchJournals()} data-testid="fetch-button">
        Fetch Journals
      </button>
      {entries.map((entry) => (
        <div key={entry.id} data-testid={`entry-${entry.id}`}>
          {entry.title}
        </div>
      ))}
    </div>
  )
}

// Test component for useJournalEntry hook
const TestJournalEntryComponent = ({ slug }: { slug?: string }) => {
  const { entry, loading, error, fetchEntry } = useJournalEntry()
  
  return (
    <div>
      <div data-testid="entry-loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="entry-error">{error || 'No Error'}</div>
      <div data-testid="entry-title">{entry?.title || 'No Entry'}</div>
      <button 
        onClick={() => slug && fetchEntry(slug)} 
        data-testid="fetch-entry-button"
      >
        Fetch Entry
      </button>
    </div>
  )
}

// Test component for useCategories hook
const TestCategoriesComponent = () => {
  const { categories, loading, error } = useCategories()
  
  return (
    <div>
      <div data-testid="categories-loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="categories-error">{error || 'No Error'}</div>
      <div data-testid="categories-count">{categories.length}</div>
      {categories.map((category) => (
        <div key={category.id} data-testid={`category-${category.id}`}>
          {category.name}
        </div>
      ))}
    </div>
  )
}

// Test component for useTags hook
const TestTagsComponent = () => {
  const { tags, loading, error } = useTags()
  
  return (
    <div>
      <div data-testid="tags-loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="tags-error">{error || 'No Error'}</div>
      <div data-testid="tags-count">{tags.length}</div>
      {tags.map((tag) => (
        <div key={tag.id} data-testid={`tag-${tag.id}`}>
          {tag.name}
        </div>
      ))}
    </div>
  )
}

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useJournals Hook Integration', () => {
    it('should fetch and display journals on mount', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            docs: [
              { id: '1', title: 'Test Journal 1' },
              { id: '2', title: 'Test Journal 2' },
            ],
            page: 1,
            totalPages: 1,
            totalDocs: 2,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: true }} />
        </TestWrapper>
      )

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
      expect(screen.getByTestId('entries-count')).toHaveTextContent('0')

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      expect(screen.getByTestId('entries-count')).toHaveTextContent('2')
      expect(screen.getByTestId('entry-1')).toHaveTextContent('Test Journal 1')
      expect(screen.getByTestId('entry-2')).toHaveTextContent('Test Journal 2')
      expect(screen.getByTestId('error')).toHaveTextContent('No Error')
    })

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: true }} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('No Error')
      })

      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('entries-count')).toHaveTextContent('0')
    })

    it('should allow manual fetching with parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            docs: [{ id: '1', title: 'Filtered Journal' }],
            page: 1,
            totalPages: 1,
            totalDocs: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: false }} />
        </TestWrapper>
      )

      // Initially no data
      expect(screen.getByTestId('entries-count')).toHaveTextContent('0')

      // Click fetch button
      act(() => {
        screen.getByTestId('fetch-button').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('entries-count')).toHaveTextContent('1')
      })

      expect(screen.getByTestId('entry-1')).toHaveTextContent('Filtered Journal')
    })
  })

  describe('useJournalEntry Hook Integration', () => {
    it('should fetch individual journal entry', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: '1',
            title: 'Individual Journal Entry',
            slug: 'individual-journal-entry',
            content: { root: { children: [] } },
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalEntryComponent slug="individual-journal-entry" />
        </TestWrapper>
      )

      // Initially no entry
      expect(screen.getByTestId('entry-title')).toHaveTextContent('No Entry')

      // Click fetch button
      act(() => {
        screen.getByTestId('fetch-entry-button').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('entry-title')).toHaveTextContent('Individual Journal Entry')
      })

      expect(screen.getByTestId('entry-error')).toHaveTextContent('No Error')
    })

    it('should handle 404 errors for non-existent entries', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalEntryComponent slug="non-existent" />
        </TestWrapper>
      )

      act(() => {
        screen.getByTestId('fetch-entry-button').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('entry-error')).not.toHaveTextContent('No Error')
      })

      expect(screen.getByTestId('entry-title')).toHaveTextContent('No Entry')
    })
  })

  describe('useCategories Hook Integration', () => {
    it('should fetch and display categories', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { id: '1', name: 'Technology', journalCount: 5 },
            { id: '2', name: 'Design', journalCount: 3 },
          ],
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestCategoriesComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('categories-count')).toHaveTextContent('2')
      })

      expect(screen.getByTestId('category-1')).toHaveTextContent('Technology')
      expect(screen.getByTestId('category-2')).toHaveTextContent('Design')
      expect(screen.getByTestId('categories-error')).toHaveTextContent('No Error')
    })

    it('should handle categories API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestCategoriesComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('categories-error')).not.toHaveTextContent('No Error')
      })

      expect(screen.getByTestId('categories-count')).toHaveTextContent('0')
    })
  })

  describe('useTags Hook Integration', () => {
    it('should fetch and display tags', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { id: '1', name: 'React', journalCount: 8 },
            { id: '2', name: 'JavaScript', journalCount: 12 },
            { id: '3', name: 'CSS', journalCount: 6 },
          ],
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestTagsComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('tags-count')).toHaveTextContent('3')
      })

      expect(screen.getByTestId('tag-1')).toHaveTextContent('React')
      expect(screen.getByTestId('tag-2')).toHaveTextContent('JavaScript')
      expect(screen.getByTestId('tag-3')).toHaveTextContent('CSS')
      expect(screen.getByTestId('tags-error')).toHaveTextContent('No Error')
    })

    it('should handle tags API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestTagsComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('tags-error')).not.toHaveTextContent('No Error')
      })

      expect(screen.getByTestId('tags-count')).toHaveTextContent('0')
    })
  })

  describe('State Management Integration', () => {
    it('should share state between multiple components', async () => {
      const mockJournalsResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            docs: [{ id: '1', title: 'Shared Journal' }],
            page: 1,
            totalPages: 1,
            totalDocs: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [{ id: '1', name: 'Shared Category' }],
            tags: [{ id: '1', name: 'Shared Tag' }],
          },
        }),
      }

      mockFetch.mockResolvedValue(mockJournalsResponse)

      const MultipleComponentsTest = () => (
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: true }} />
          <TestCategoriesComponent />
          <TestTagsComponent />
        </TestWrapper>
      )

      render(<MultipleComponentsTest />)

      await waitFor(() => {
        expect(screen.getByTestId('entries-count')).toHaveTextContent('1')
        expect(screen.getByTestId('categories-count')).toHaveTextContent('1')
        expect(screen.getByTestId('tags-count')).toHaveTextContent('1')
      })

      // All components should show the shared data
      expect(screen.getByTestId('entry-1')).toHaveTextContent('Shared Journal')
      expect(screen.getByTestId('category-1')).toHaveTextContent('Shared Category')
      expect(screen.getByTestId('tag-1')).toHaveTextContent('Shared Tag')
    })

    it('should handle loading states across components', async () => {
      // Mock a slow response
      const slowResponse = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                docs: [],
                page: 1,
                totalPages: 1,
                totalDocs: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit: 10,
                categories: [],
                tags: [],
              },
            }),
          })
        }, 100)
      })

      mockFetch.mockReturnValue(slowResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: true }} />
        </TestWrapper>
      )

      // Should initially show loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      }, { timeout: 200 })
    })

    it('should handle error states across components', async () => {
      const errorResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: { message: 'API Error occurred' },
        }),
      }

      mockFetch.mockResolvedValue(errorResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: true }} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('API Error occurred')
      })

      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('entries-count')).toHaveTextContent('0')
    })
  })

  describe('Caching Integration', () => {
    it('should cache API responses and avoid duplicate requests', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            docs: [{ id: '1', title: 'Cached Journal' }],
            page: 1,
            totalPages: 1,
            totalDocs: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      render(
        <TestWrapper>
          <TestJournalsComponent options={{ autoFetch: false }} />
        </TestWrapper>
      )

      // First fetch
      act(() => {
        screen.getByTestId('fetch-button').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('entries-count')).toHaveTextContent('1')
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second fetch with same parameters should use cache
      act(() => {
        screen.getByTestId('fetch-button').click()
      })

      // Should still show the data but not make another API call
      expect(screen.getByTestId('entries-count')).toHaveTextContent('1')
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional call
    })
  })
})