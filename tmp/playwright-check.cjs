const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  page.on('console', (msg) => {
    console.log('[PAGE CONSOLE]', msg.type(), msg.text())
  })

  page.on('pageerror', (err) => {
    console.log('[PAGE ERROR]', err.message)
  })

  page.on('request', (request) => {
    if (request.url().includes('/api/public/journals')) {
      console.log('[REQUEST]', request.method(), request.url())
    }
  })

  page.on('response', async (response) => {
    try {
      if (response.url().includes('/api/public/journals')) {
        const text = await response.text()
        console.log('[RESPONSE]', response.status(), response.url())
        console.log('[RESPONSE BODY]', text.slice(0, 2000))
      }
    } catch (e) {
      console.error('Error reading response body', e)
    }
  })

  console.log('Navigating to /journal...')
  await page.goto('http://localhost:3000/journal', { waitUntil: 'networkidle' })

  // wait a bit for client-side JS to run
  await page.waitForTimeout(1500)

  // check for entries in the DOM
  const entries = await page.$$eval(
    '.journal-grid .journal-card, .journal-virtual-grid .journal-card',
    (nodes) => nodes.length,
  )
  console.log('[DOM] journal cards found:', entries)

  await browser.close()
})()
