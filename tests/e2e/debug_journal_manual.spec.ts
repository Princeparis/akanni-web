import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test('debug journal page for console logs', async ({ page }) => {
  const logs: Array<{ type: string; text: string }> = []

  page.on('console', (msg) => {
    try {
      logs.push({ type: msg.type(), text: msg.text() })
      // Also echo to runner console for quick inspection
      // eslint-disable-next-line no-console
      console.log('[BROWSER]', msg.type(), msg.text())
    } catch (e) {
      // ignore
    }
  })

  // Navigate to the absolute URL to avoid relying on baseURL
  // Enable in-page debug logs before any scripts execute
  await page.addInitScript(() => {
    // eslint-disable-next-line no-extra-parens
    ;(window as any).__DEBUG_JOURNALS__ = true
  })

  await page.goto('http://localhost:3000/journal', { waitUntil: 'load', timeout: 15000 })

  // Let the page run for a short while to capture cyclic behavior
  await page.waitForTimeout(4000)

  // Print a short summary
  // eslint-disable-next-line no-console
  console.log('Collected browser console messages:', logs.length)
  const sample = logs.slice(0, 20)
  sample.forEach((l, i) => console.log(i, l.type, l.text))

  // Wait a bit more in case loops are slower
  await page.waitForTimeout(2000)

  // Final summary
  console.log('Final collected messages:', logs.length)

  // Persist logs to a JSON file for offline analysis
  try {
    const outDir = path.resolve(process.cwd(), 'test-results')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const outPath = path.join(outDir, 'browser-logs.json')
    fs.writeFileSync(outPath, JSON.stringify(logs, null, 2), 'utf8')
    // eslint-disable-next-line no-console
    console.log('Wrote browser logs to', outPath)
  } catch (err) {
    // ignore
  }
})
