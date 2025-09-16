/**
 * End-to-end tests for responsive design and cross-browser compatibility
 * Tests journal interface across different screen sizes and browsers
 */

import { test, expect, devices } from '@playwright/test'

// Test on different devices
const deviceTests = [
  { name: 'Desktop', ...devices['Desktop Chrome'] },
  { name: 'Tablet', ...devices['iPad'] },
  { name: 'Mobile', ...devices['iPhone 12'] },
]

deviceTests.forEach(({ name, ...device }) => {
  test.describe(`Responsive Design - ${name}`, () => {
    test.use({ ...device })

    test('should display journal listing properly on different screen sizes', async ({ page }) => {
      await page.goto('/journal')

      // Check that main elements are visible
      await expect(page.locator('[data-testid="journal-list"]')).toBeVisible()

      if (name === 'Mobile') {
        // On mobile, filters might be in a collapsible menu
        const filtersToggle = page.locator('[data-testid="filters-toggle"]')
        if (await filtersToggle.isVisible()) {
          await filtersToggle.click()
        }
      }

      await expect(page.locator('[data-testid="journal-filters"]')).toBeVisible()

      // Check that journal cards are properly sized
      const journalCards = page.locator('[data-testid="journal-card"]')
      await expect(journalCards.first()).toBeVisible()

      // Take screenshot for visual regression testing
      await page.screenshot({
        path: `tests/screenshots/journal-list-${name.toLowerCase()}.png`,
        fullPage: true,
      })
    })

    test('should handle navigation menu responsively', async ({ page }) => {
      await page.goto('/journal')

      if (name === 'Mobile') {
        // On mobile, navigation might be in a hamburger menu
        const menuToggle = page.locator('[data-testid="menu-toggle"]')
        if (await menuToggle.isVisible()) {
          await menuToggle.click()
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
        }
      } else {
        // On desktop/tablet, navigation should be visible
        await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
      }
    })

    test('should display individual journal entry responsively', async ({ page }) => {
      // Mock journal entry
      await page.route('/api/public/journals/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: '1',
              title: 'Responsive Test Journal',
              slug: 'responsive-test-journal',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          text: 'This is a long content that should wrap properly on different screen sizes. '.repeat(
                            10,
                          ),
                        },
                      ],
                      type: 'paragraph',
                    },
                  ],
                  type: 'root',
                },
              },
              coverImage: {
                url: '/test-image.jpg',
                alt: 'Test image',
              },
              category: { name: 'Technology', slug: 'technology' },
              tags: [
                { name: 'React', slug: 'react' },
                { name: 'JavaScript', slug: 'javascript' },
              ],
            },
          }),
        })
      })

      await page.goto('/journal/responsive-test-journal')

      // Check that content is readable
      await expect(page.locator('[data-testid="journal-entry-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="journal-entry-content"]')).toBeVisible()

      // Check that images are responsive
      const coverImage = page.locator('[data-testid="journal-entry-cover-image"]')
      if (await coverImage.isVisible()) {
        const imageBox = await coverImage.boundingBox()
        const viewportSize = page.viewportSize()

        if (imageBox && viewportSize) {
          // Image should not exceed viewport width
          expect(imageBox.width).toBeLessThanOrEqual(viewportSize.width)
        }
      }

      // Take screenshot
      await page.screenshot({
        path: `tests/screenshots/journal-entry-${name.toLowerCase()}.png`,
        fullPage: true,
      })
    })

    test('should handle form inputs responsively', async ({ page }) => {
      await page.goto('/journal')

      // Test search input
      const searchInput = page.locator('[data-testid="search-input"]')
      await expect(searchInput).toBeVisible()

      // Input should be appropriately sized
      const inputBox = await searchInput.boundingBox()
      const viewportSize = page.viewportSize()

      if (inputBox && viewportSize) {
        if (name === 'Mobile') {
          // On mobile, input should take most of the width
          expect(inputBox.width).toBeGreaterThan(viewportSize.width * 0.7)
        } else {
          // On desktop, input should be reasonably sized
          expect(inputBox.width).toBeLessThan(viewportSize.width * 0.5)
        }
      }
    })

    test('should handle pagination responsively', async ({ page }) => {
      // Mock paginated response
      await page.route('/api/public/journals*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              docs: Array.from({ length: 10 }, (_, i) => ({
                id: `${i + 1}`,
                title: `Journal Entry ${i + 1}`,
                slug: `journal-entry-${i + 1}`,
                excerpt: `Excerpt for journal ${i + 1}`,
              })),
              totalDocs: 50,
              page: 1,
              totalPages: 5,
              hasNextPage: true,
              hasPrevPage: false,
              limit: 10,
              categories: [],
              tags: [],
            },
          }),
        })
      })

      await page.goto('/journal')
      await page.waitForSelector('[data-testid="pagination"]')

      const pagination = page.locator('[data-testid="pagination"]')
      await expect(pagination).toBeVisible()

      if (name === 'Mobile') {
        // On mobile, pagination might show fewer page numbers
        const pageNumbers = page.locator('[data-testid="page-number"]')
        const count = await pageNumbers.count()
        expect(count).toBeLessThanOrEqual(5) // Should show limited page numbers on mobile
      }
    })

    test('should handle touch interactions on mobile', async ({ page }) => {
      test.skip(name !== 'Mobile', 'Touch tests only for mobile')

      await page.goto('/journal')
      await page.waitForSelector('[data-testid="journal-card"]')

      // Test touch/tap on journal card
      const firstCard = page.locator('[data-testid="journal-card"]').first()
      await firstCard.tap()

      // Should navigate to journal entry
      await expect(page).toHaveURL(/\/journal\/[^\/]+$/)
    })

    test('should handle keyboard navigation', async ({ page }) => {
      test.skip(name === 'Mobile', 'Keyboard tests not applicable for mobile')

      await page.goto('/journal')
      await page.waitForSelector('[data-testid="journal-card"]')

      // Test tab navigation
      await page.keyboard.press('Tab')

      // Should focus on first interactive element
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Test Enter key on focused journal card
      const firstCard = page.locator('[data-testid="journal-card"]').first()
      await firstCard.focus()
      await page.keyboard.press('Enter')

      // Should navigate to journal entry
      await expect(page).toHaveURL(/\/journal\/[^\/]+$/)
    })
  })
})

test.describe('Cross-Browser Compatibility', () => {
  // Test specific browser features
  test('should work with different CSS features across browsers', async ({ page, browserName }) => {
    await page.goto('/journal')

    // Test CSS Grid/Flexbox layout
    const journalGrid = page.locator('[data-testid="journal-grid"]')
    if (await journalGrid.isVisible()) {
      const gridStyles = await journalGrid.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
        }
      })

      // Should use CSS Grid or Flexbox
      expect(['grid', 'flex'].some((display) => gridStyles.display.includes(display))).toBe(true)
    }

    // Test modern CSS features
    const modernElement = page.locator('[data-testid="modern-css-element"]')
    if (await modernElement.isVisible()) {
      const hasModernFeatures = await modernElement.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          hasCustomProperties: styles.getPropertyValue('--custom-property') !== '',
          hasClamp: styles.fontSize.includes('clamp'),
        }
      })

      // Modern browsers should support these features
      if (['chromium', 'firefox'].includes(browserName)) {
        expect(hasModernFeatures.hasCustomProperties || hasModernFeatures.hasClamp).toBe(true)
      }
    }
  })

  test('should handle JavaScript features across browsers', async ({ page, browserName }) => {
    await page.goto('/journal')

    // Test modern JavaScript features
    const jsFeatures = await page.evaluate(() => {
      return {
        hasAsyncAwait: typeof (async () => {}) === 'function',
        hasArrowFunctions: typeof (() => {}) === 'function',
        hasPromises: typeof Promise !== 'undefined',
        hasFetch: typeof fetch !== 'undefined',
      }
    })

    // All modern browsers should support these
    expect(jsFeatures.hasAsyncAwait).toBe(true)
    expect(jsFeatures.hasArrowFunctions).toBe(true)
    expect(jsFeatures.hasPromises).toBe(true)
    expect(jsFeatures.hasFetch).toBe(true)
  })

  test('should handle API requests consistently across browsers', async ({ page }) => {
    // Mock API response
    await page.route('/api/public/journals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: [{ id: '1', title: 'Test Journal' }],
            totalDocs: 1,
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

    await page.goto('/journal')
    await page.waitForSelector('[data-testid="journal-card"]')

    // Should load data successfully
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="journal-title"]')).toContainText('Test Journal')
  })
})

test.describe('Performance Testing', () => {
  test('should load journal listing within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/journal')
    await page.waitForSelector('[data-testid="journal-card"]')

    const loadTime = Date.now() - startTime

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large number of journal entries efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('/api/public/journals*', async (route) => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Journal Entry ${i + 1}`,
        slug: `journal-entry-${i + 1}`,
        excerpt: `This is excerpt for journal entry number ${i + 1}`,
        publishedAt: new Date().toISOString(),
      }))

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: largeDataset.slice(0, 10), // Paginated
            totalDocs: 100,
            page: 1,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false,
            limit: 10,
            categories: [],
            tags: [],
          },
        }),
      })
    })

    const startTime = Date.now()

    await page.goto('/journal')
    await page.waitForSelector('[data-testid="journal-card"]')

    const loadTime = Date.now() - startTime

    // Should still load efficiently with large dataset
    expect(loadTime).toBeLessThan(2000)

    // Should show correct number of items
    await expect(page.locator('[data-testid="journal-card"]')).toHaveCount(10)
  })

  test('should handle image loading efficiently', async ({ page }) => {
    // Mock journal with images
    await page.route('/api/public/journals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            docs: Array.from({ length: 5 }, (_, i) => ({
              id: `${i + 1}`,
              title: `Journal with Image ${i + 1}`,
              slug: `journal-with-image-${i + 1}`,
              coverImage: {
                url: `/test-image-${i + 1}.jpg`,
                alt: `Test image ${i + 1}`,
              },
            })),
            totalDocs: 5,
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

    await page.goto('/journal')
    await page.waitForSelector('[data-testid="journal-card"]')

    // Check that images have proper loading attributes
    const images = page.locator('[data-testid="journal-cover-image"]')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      const loading = await image.getAttribute('loading')

      // Images should have lazy loading for performance
      expect(loading).toBe('lazy')
    }
  })
})
