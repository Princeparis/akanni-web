import { test, expect } from '@playwright/test'

test('journal page should not repeatedly fetch journals on mount', async ({ page }) => {
  // Intercept fetch calls made by the page to count journal API requests
  await page.route('**/api/public/journals**', (route) => {
    // Let the request continue normally
    route.continue()
  })

  // Expose a counter in the page that increments on each matching request
  await page.addInitScript(() => {
    // @ts-ignore
    window.__journalFetchCount = 0
    const origFetch = window.fetch
    // @ts-ignore
    window.fetch = function (input, init) {
      try {
        const url = typeof input === 'string' ? input : input?.url
        if (typeof url === 'string' && url.includes('/api/public/journals')) {
          // @ts-ignore
          window.__journalFetchCount = (window.__journalFetchCount || 0) + 1
        }
      } catch (e) {
        // ignore
      }
      return origFetch.apply(this, arguments as any)
    }
  })

  await page.goto('/journal')

  // Wait for initial content to load
  await page.waitForSelector('[data-testid="entries-count"], [data-testid="loading"]', {
    timeout: 5000,
  })

  // Give the page a short grace period to allow any accidental churn to surface
  await page.waitForTimeout(1200)

  const count = await page.evaluate(() => {
    // @ts-ignore
    return window.__journalFetchCount || 0
  })

  // Expect at most 2 requests (initial + optional prefetch). If there is a repeated churn
  // this assertion will fail and guard against regressions.
  expect(count).toBeLessThanOrEqual(2)
})
