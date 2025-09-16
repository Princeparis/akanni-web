/**
 * End-to-end tests for journal browsing functionality
 * Tests complete user journeys from listing to individual entries
 */

import { test, expect } from '@playwright/test'

test.describe('Journal Browsing User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the journal page
    await page.goto('/journal')
  })

  test('should display journal listing page with proper layout', async ({ page }) => {
    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Journal/)

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible()

    // Check for journal listing container
    await expect(page.locator('[data-testid="journal-list"]')).toBeVisible()

    // Check for filters section
    await expect(page.locator('[data-testid="journal-filters"]')).toBeVisible()
  })

  test('should load and display journal entries', async ({ page }) => {
    // Wait for journal entries to load
    await page.waitForSelector('[data-testid="journal-card"]', { timeout: 10000 })

    // Check that at least one journal entry is displayed
    const journalCards = page.locator('[data-testid="journal-card"]')
    const cardCount = await journalCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(1)

    // Check that each journal card has required elements
    const firstCard = journalCards.first()
    await expect(firstCard.locator('[data-testid="journal-title"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="journal-excerpt"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="journal-date"]')).toBeVisible()
  })

  test('should display loading states while fetching data', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('/api/public/journals*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.reload()

    // Check for loading skeleton or spinner
    await expect(page.locator('[data-testid="journal-list-skeleton"]')).toBeVisible()

    // Wait for loading to complete
    await page.waitForSelector('[data-testid="journal-card"]', { timeout: 15000 })
    await expect(page.locator('[data-testid="journal-list-skeleton"]')).not.toBeVisible()
  })

  test('should handle empty state when no journals are found', async ({ page }) => {
    // Mock empty response
    await page.route('/api/public/journals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: [],
            totalDocs: 0,
            page: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      })
    })

    await page.reload()

    // Check for empty state message
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-state"]')).toContainText(
      'No journal entries found',
    )
  })

  test('should navigate to individual journal entry', async ({ page }) => {
    // Wait for journal entries to load
    await page.waitForSelector('[data-testid="journal-card"]')

    // Click on the first journal entry
    const firstCard = page.locator('[data-testid="journal-card"]').first()
    const journalTitle = await firstCard.locator('[data-testid="journal-title"]').textContent()

    await firstCard.click()

    // Check that we navigated to the individual journal page
    await expect(page).toHaveURL(/\/journal\/[^\/]+$/)

    // Check that the journal entry page loads
    await expect(page.locator('[data-testid="journal-entry"]')).toBeVisible()
    if (journalTitle) {
      await expect(page.locator('[data-testid="journal-entry-title"]')).toContainText(journalTitle)
    }
  })

  test('should display pagination when there are multiple pages', async ({ page }) => {
    // Mock response with multiple pages
    await page.route('/api/public/journals*', async (route) => {
      const url = new URL(route.request().url())
      const pageNum = parseInt(url.searchParams.get('page') || '1')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: Array.from({ length: 10 }, (_, i) => ({
              id: `${pageNum}-${i + 1}`,
              title: `Journal Entry ${pageNum}-${i + 1}`,
              slug: `journal-entry-${pageNum}-${i + 1}`,
              excerpt: `This is excerpt for journal ${pageNum}-${i + 1}`,
              publishedAt: new Date().toISOString(),
            })),
            totalDocs: 25,
            page: pageNum,
            totalPages: 3,
            hasNextPage: pageNum < 3,
            hasPrevPage: pageNum > 1,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      })
    })

    await page.reload()

    // Wait for content to load
    await page.waitForSelector('[data-testid="journal-card"]')

    // Check for pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible()
    await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible()
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText('Page 1 of 3')

    // Test pagination navigation
    await page.locator('[data-testid="pagination-next"]').click()
    await page.waitForSelector('[data-testid="journal-card"]')
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText('Page 2 of 3')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/public/journals*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        }),
      })
    })

    await page.reload()

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load journal entries',
    )

    // Check for retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })
})

test.describe('Journal Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/journal')
    await page.waitForSelector('[data-testid="journal-filters"]')
  })

  test('should filter journals by category', async ({ page }) => {
    // Mock categories and filtered response
    await page.route('/api/public/journals*', async (route) => {
      const url = new URL(route.request().url())
      const category = url.searchParams.get('category')

      const allJournals = [
        { id: '1', title: 'Tech Journal 1', category: { slug: 'technology', name: 'Technology' } },
        { id: '2', title: 'Design Journal 1', category: { slug: 'design', name: 'Design' } },
        { id: '3', title: 'Tech Journal 2', category: { slug: 'technology', name: 'Technology' } },
      ]

      const filteredJournals = category
        ? allJournals.filter((j) => j.category.slug === category)
        : allJournals

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: filteredJournals,
            totalDocs: filteredJournals.length,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [
              { id: '1', name: 'Technology', slug: 'technology' },
              { id: '2', name: 'Design', slug: 'design' },
            ],
            tags: [],
          },
        }),
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="journal-card"]')

    // Initially should show all journals
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(3)

    // Filter by Technology category
    await page.locator('[data-testid="category-filter"]').selectOption('technology')
    await page.waitForSelector('[data-testid="journal-card"]')

    // Should show only technology journals
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="journal-title"]').first()).toContainText(
      'Tech Journal',
    )
  })

  test('should search journals by text', async ({ page }) => {
    // Mock search response
    await page.route('/api/public/journals*', async (route) => {
      const url = new URL(route.request().url())
      const search = url.searchParams.get('search')

      const allJournals = [
        { id: '1', title: 'React Tutorial', excerpt: 'Learn React basics' },
        { id: '2', title: 'Vue Guide', excerpt: 'Vue.js fundamentals' },
        { id: '3', title: 'React Advanced', excerpt: 'Advanced React patterns' },
      ]

      const filteredJournals = search
        ? allJournals.filter(
            (j) =>
              j.title.toLowerCase().includes(search.toLowerCase()) ||
              j.excerpt.toLowerCase().includes(search.toLowerCase()),
          )
        : allJournals

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: filteredJournals,
            totalDocs: filteredJournals.length,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="journal-card"]')

    // Search for "React"
    await page.locator('[data-testid="search-input"]').fill('React')
    await page.locator('[data-testid="search-button"]').click()
    await page.waitForSelector('[data-testid="journal-card"]')

    // Should show only React-related journals
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="journal-title"]').first()).toContainText('React')
  })

  test('should filter by tags', async ({ page }) => {
    // Mock tags filter response
    await page.route('/api/public/journals*', async (route) => {
      const url = new URL(route.request().url())
      const tags = url.searchParams.getAll('tags')

      const allJournals = [
        { id: '1', title: 'Journal 1', tags: [{ slug: 'react', name: 'React' }] },
        { id: '2', title: 'Journal 2', tags: [{ slug: 'vue', name: 'Vue' }] },
        {
          id: '3',
          title: 'Journal 3',
          tags: [
            { slug: 'react', name: 'React' },
            { slug: 'javascript', name: 'JavaScript' },
          ],
        },
      ]

      const filteredJournals =
        tags.length > 0
          ? allJournals.filter((j) => j.tags.some((tag) => tags.includes(tag.slug)))
          : allJournals

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: filteredJournals,
            totalDocs: filteredJournals.length,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [
              { id: '1', name: 'React', slug: 'react' },
              { id: '2', name: 'Vue', slug: 'vue' },
              { id: '3', name: 'JavaScript', slug: 'javascript' },
            ],
          },
        }),
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="journal-card"]')

    // Filter by React tag
    await page.locator('[data-testid="tag-filter-react"]').check()
    await page.waitForSelector('[data-testid="journal-card"]')

    // Should show only journals with React tag
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(2)
  })

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    await page.locator('[data-testid="search-input"]').fill('test search')
    await page.locator('[data-testid="category-filter"]').selectOption('technology')

    // Clear all filters
    await page.locator('[data-testid="clear-filters"]').click()

    // Check that filters are cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('')
    await expect(page.locator('[data-testid="category-filter"]')).toHaveValue('')
  })
})

test.describe('Individual Journal Entry', () => {
  test('should display complete journal entry with all elements', async ({ page }) => {
    // Mock individual journal entry
    await page.route('/api/public/journals/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: '1',
            title: 'Complete Journal Entry',
            slug: 'complete-journal-entry',
            content: {
              root: {
                children: [
                  {
                    children: [{ text: 'This is the main content of the journal entry.' }],
                    type: 'paragraph',
                  },
                ],
                type: 'root',
              },
            },
            excerpt: 'This is a test excerpt',
            coverImage: {
              url: '/test-image.jpg',
              alt: 'Test image',
            },
            audioUrl: 'https://example.com/audio.mp3',
            category: {
              id: '1',
              name: 'Technology',
              slug: 'technology',
            },
            tags: [
              { id: '1', name: 'React', slug: 'react' },
              { id: '2', name: 'JavaScript', slug: 'javascript' },
            ],
            publishedAt: '2023-01-01T00:00:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        }),
      })
    })

    await page.goto('/journal/complete-journal-entry')

    // Check that all elements are present
    await expect(page.locator('[data-testid="journal-entry"]')).toBeVisible()
    await expect(page.locator('[data-testid="journal-entry-title"]')).toContainText(
      'Complete Journal Entry',
    )
    await expect(page.locator('[data-testid="journal-entry-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="journal-entry-date"]')).toBeVisible()
    await expect(page.locator('[data-testid="journal-entry-category"]')).toContainText('Technology')
    await expect(page.locator('[data-testid="journal-entry-tags"]')).toBeVisible()
    await expect(page.locator('[data-testid="journal-entry-cover-image"]')).toBeVisible()
    await expect(page.locator('[data-testid="journal-entry-audio"]')).toBeVisible()
  })

  test('should handle 404 for non-existent journal entry', async ({ page }) => {
    // Mock 404 response
    await page.route('/api/public/journals/*', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Journal entry not found',
          },
        }),
      })
    })

    await page.goto('/journal/non-existent-entry')

    // Check for 404 error message
    await expect(page.locator('[data-testid="not-found-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="not-found-message"]')).toContainText(
      'Journal entry not found',
    )

    // Check for back to journal list link
    await expect(page.locator('[data-testid="back-to-journal-list"]')).toBeVisible()
  })

  test('should navigate back to journal list', async ({ page }) => {
    await page.goto('/journal/test-entry')

    // Click back to journal list
    await page.locator('[data-testid="back-to-journal-list"]').click()

    // Should navigate back to journal listing
    await expect(page).toHaveURL('/journal')
    await expect(page.locator('[data-testid="journal-list"]')).toBeVisible()
  })

  test('should display proper SEO metadata', async ({ page }) => {
    // Mock journal entry with SEO data
    await page.route('/api/public/journals/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: '1',
            title: 'SEO Test Journal',
            slug: 'seo-test-journal',
            content: { root: { children: [] } },
            excerpt: 'This is a test excerpt for SEO',
            seo: {
              title: 'Custom SEO Title',
              description: 'Custom SEO Description',
            },
          },
        }),
      })
    })

    await page.goto('/journal/seo-test-journal')

    // Check page title
    await expect(page).toHaveTitle(/Custom SEO Title/)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'Custom SEO Description')
  })
})
