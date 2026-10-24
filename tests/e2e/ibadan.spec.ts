import { test, expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { ibadanChapters } from '../../src/data/ibadan'
import { particleForm } from '../../src/components/ibadan/particle-forms'

async function enterQuietly(page: Page) {
  await page.getByRole('button', { name: 'Entry soundscape' }).click()
  await page.getByRole('button', { name: 'Begin the journey' }).click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'land')
}

test('each interpretation has finite, deterministic, distinct 3D samples', () => {
  const forms = [...new Set(ibadanChapters.map((chapter) => chapter.form))]
  const fingerprints = new Set<string>()
  for (const form of forms) {
    const points = particleForm(form, 500)
    expect(points.length).toBe(1500)
    expect([...points].every(Number.isFinite)).toBe(true)
    expect(Math.max(...points)).toBeGreaterThan(1)
    expect(Math.max(...points.map(Math.abs))).toBeLessThan(10)
    expect(points).toEqual(particleForm(form, 500))
    fingerprints.add([...points.slice(0, 30)].join(','))
  }
  expect(fingerprints.size).toBe(forms.length)
})

test('the native entry fills the viewport and renders real luminous particles without portfolio chrome', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ibadan')
  await expect(page).toHaveTitle(/Ibadan/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ìbàdàn')
  await expect(page.locator('.site-header, .site-footer, iframe, .brand-intro')).toHaveCount(0)
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.ibadan-canvas')).toHaveCount(1)
  await page.waitForTimeout(300)
  const image = await page.screenshot()
  const { data, info } = await sharp(image)
    .extract({ left: 850, top: 150, width: 480, height: 500 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let lit = 0
  for (let i = 0; i < data.length; i += info.channels) if (data[i] > 85 && data[i + 1] > 65) lit++
  expect(lit).toBeGreaterThan(500)
  await mkdir('artifacts/ibadan', { recursive: true })
  await page.screenshot({ path: 'artifacts/ibadan/entry-desktop.png' })
  expect(errors).toEqual([])
})

test('all historical chapters, keyboard navigation, field notes and reference status work', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await enterQuietly(page)
  for (let i = 0; i < ibadanChapters.length; i++) {
    const chapter = ibadanChapters[i]
    await expect(page.locator('main')).toHaveAttribute('data-chapter', chapter.id)
    await expect(page.locator('#ibadan-chapter-title')).toHaveText(chapter.title.replace('\n', ''))
    await expect(
      page
        .getByRole('navigation', { name: 'Ibadan chapters' })
        .locator('button[aria-current="step"]'),
    ).toHaveAttribute('aria-label', `Chapter ${i + 1}: ${chapter.label}`)
    if (i < ibadanChapters.length - 1)
      await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
  }
  await page.locator('main').focus()
  await page.keyboard.press('Home')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'land')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'founding')
  await page.getByRole('button', { name: 'Open the field notes' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('1829')
  await expect(page.getByRole('dialog')).toContainText('source review')
  await expect(page.getByRole('dialog').getByRole('link', { name: /Britannica/ })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Chapter index' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: /A new signal/ })).toHaveCount(
    1,
  )
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /A new signal/ })
    .click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'television')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('inspection, rotation, release and reduced-motion rendering remain interactive and stable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await enterQuietly(page)
  await page.getByRole('button', { name: 'Chapter 3: A regional power' }).click()
  await page.getByRole('button', { name: 'Inspect object' }).click()
  await expect(page.locator('main')).toHaveClass(/is-inspecting/)
  const before = await page.screenshot()
  await page.getByRole('button', { name: 'Rotate object right' }).click()
  expect(await page.screenshot()).not.toEqual(before)
  await page.getByRole('button', { name: 'Release particles' }).click()
  await expect(page.getByRole('button', { name: 'Gather particles' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Gather particles' }).click()
  await page.getByRole('button', { name: 'Reset view' }).click()
  await page.getByRole('button', { name: 'Return to story' }).click()
  await page.locator('main').focus()
  await page.waitForTimeout(80)
  const stable = await page.screenshot()
  await page.waitForTimeout(220)
  expect(await page.screenshot()).toEqual(stable)
})

test('phone, tablet and landscape layouts remain full screen with usable chapter controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mkdir('artifacts/ibadan', { recursive: true })
  for (const [width, height] of [
    [320, 568],
    [320, 700],
    [390, 844],
    [768, 1024],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/ibadan')
    await expect(page.getByRole('button', { name: 'Begin the journey' })).toBeInViewport()
    await enterQuietly(page)
    const bounds = await page.locator('main').boundingBox()
    expect(bounds?.width).toBe(width)
    expect(bounds?.height).toBe(height)
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true)
    await expect(page.getByRole('button', { name: 'Next chapter', exact: true })).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Open the field notes' })).toBeInViewport()
    await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
    await expect(page.locator('main')).toHaveAttribute('data-chapter', 'founding')
    await page.screenshot({ path: `artifacts/ibadan/journey-${width}.png` })
  }
})

test('a horizontal touch gesture on the story advances the chapter', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: test.info().project.use.baseURL,
  })
  const page = await context.newPage()
  await page.goto('/ibadan')
  await enterQuietly(page)
  const bounds = (await page.locator('.ibadan-story').boundingBox())!
  const y = bounds.y + 75
  const session = await context.newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 290, y }],
  })
  for (const x of [250, 200, 140, 90])
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'founding')
  await context.close()
})

test('audio starts only with entry consent, mutes, resumes, and closes when leaving', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    const contexts: AudioContext[] = []
    Object.assign(window, { __ibadanAudio: contexts })
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options)
        contexts.push(this)
      }
    }
  })
  const states = () =>
    page.evaluate(() =>
      (window as unknown as { __ibadanAudio: AudioContext[] }).__ibadanAudio.map(
        (context) => context.state,
      ),
    )
  await page.goto('/ibadan')
  expect(await states()).toEqual([])
  await page.getByRole('button', { name: 'Begin the journey' }).click()
  await expect(page.getByRole('button', { name: 'Mute Ibadan soundscape' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(await states()).toEqual(['running'])
  await page.getByRole('button', { name: 'Mute Ibadan soundscape' }).click()
  await expect.poll(states).toEqual(['suspended'])
  await page.getByRole('button', { name: 'Enable Ibadan soundscape' }).click()
  await expect.poll(states).toEqual(['running'])
  await page.getByRole('link', { name: 'Exit', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect.poll(states).toEqual(['closed'])
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull()
})

test('WebGL failure retains the complete text journey and source notes', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/ibadan')
  await expect(page.getByRole('status')).toContainText('particle view is unavailable')
  await enterQuietly(page)
  await page.getByRole('button', { name: 'Chapter 7: An open horizon' }).click()
  await expect(page.locator('#ibadan-chapter-title')).toHaveText('A page opens.An idea travels.')
  await page.getByRole('button', { name: 'Open the field notes' }).click()
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /University of Ibadan/ }),
  ).toBeVisible()
})

test('a lost rendering context can be retried without duplicate canvases', async ({ page }) => {
  await page.goto('/ibadan')
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await page
    .locator('canvas')
    .evaluate((canvas) => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
  await expect(page.getByRole('button', { name: 'Retry the particle view' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry the particle view' }).click()
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.ibadan-canvas')).toHaveCount(1)
})

test('the portfolio exposes the native experience in desktop and compact mobile navigation', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Ibadan', exact: true })
    .click()
  await expect(page).toHaveURL('/ibadan')
  await expect(page.locator('.site-header, .site-footer')).toHaveCount(0)
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const entry = page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: /Ibadan/ })
  await expect(entry).toBeInViewport()
  await entry.click()
  await expect(page).toHaveURL('/ibadan')
  await expect(page.getByRole('button', { name: 'Begin the journey' })).toBeInViewport()
})

test('a device without Web Audio still enters the full-screen journey', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { value: undefined })
    Object.defineProperty(window, 'webkitAudioContext', { value: undefined })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/ibadan')
  await page.getByRole('button', { name: 'Begin the journey' }).click()
  await expect(page.locator('#ibadan-chapter-title')).toBeVisible()
  await expect(page.locator('.ibadan-audio-notice')).toContainText('continues silently')
  await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'founding')
  expect(errors).toEqual([])
})

test('Begin enters actual browser fullscreen, dialogs work inside it, and the fullscreen toggle preserves the journey', async ({
  page,
}) => {
  await page.goto('/ibadan')
  await enterQuietly(page)
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'true')
  expect(await page.evaluate(() => document.fullscreenElement?.id)).toBe('main')
  const bounds = await page.locator('main').boundingBox()
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))
  expect(bounds).toEqual({ x: 0, y: 0, ...viewport })
  await page.getByRole('button', { name: 'Open the field notes' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'false')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'land')
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'true')
  await page.evaluate(() => document.exitFullscreen())
  await expect(page.getByRole('button', { name: 'Enter fullscreen', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('a denied fullscreen request retains a usable journey and a retry control', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () =>
      Promise.reject(new DOMException('Denied', 'NotAllowedError'))
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/ibadan')
  await enterQuietly(page)
  await expect(page.locator('.ibadan-fullscreen-notice')).toContainText(
    'could not enter fullscreen',
  )
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'false')
  await page.getByRole('button', { name: 'Dismiss fullscreen notice' }).click()
  await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'founding')
  await expect(page.getByRole('button', { name: 'Enter fullscreen', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('phones without a fullscreen API keep an edge-to-edge experience', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { value: undefined })
    Object.defineProperty(HTMLElement.prototype, 'webkitRequestFullscreen', { value: undefined })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/ibadan')
  await expect(page.getByRole('button', { name: 'Enter fullscreen', exact: true })).toHaveCount(0)
  await enterQuietly(page)
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'false')
  expect(await page.locator('main').boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 })
  await expect(page.locator('.ibadan-fullscreen-notice')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Next chapter', exact: true })).toBeInViewport()
})
