import { test, expect, type Page } from '@playwright/test'
import sharp from 'sharp'

async function contracted(page: Page, y = 400) {
  await page.evaluate((offset) => window.scrollTo(0, offset), y)
  await expect
    .poll(() =>
      page
        .locator('.site-header')
        .evaluate((element) => Math.round(element.getBoundingClientRect().width)),
    )
    .toBe(Math.min(560, (await page.viewportSize())!.width - 32))
  await expect(page.locator('.header-glass')).toHaveCSS('opacity', '1')
  await expect
    .poll(() =>
      page
        .locator('.header-glass')
        .evaluate((element) => Number((element as HTMLElement).dataset.glassFrames || 0)),
    )
    .toBeGreaterThan(0)
}

async function pixels(page: Page) {
  // This strip contains the optical surface, with no foreground navigation controls.
  const image = await page.locator('.header-glass').screenshot()
  const crop = await sharp(image)
    .extract({ left: 95, top: 22, width: 110, height: 24 })
    .removeAlpha()
    .toBuffer()
  return sharp(crop).stats()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('the WebGL lens develops with contraction and samples the real project artwork', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/portfolio/reswitch')
  await expect(page.locator('.header-glass')).toHaveAttribute('data-glass-mode', 'webgl')
  await expect(page.locator('.header-glass')).toHaveCSS('opacity', '0')
  await page.evaluate(() => window.scrollTo(0, 160))
  await expect
    .poll(() =>
      page
        .locator('.header-glass')
        .evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.3)
  expect(
    await page
      .locator('.header-glass')
      .evaluate((element) => Number(getComputedStyle(element).opacity)),
  ).toBeLessThan(0.8)
  await contracted(page, 500)
  await expect
    .poll(() =>
      page
        .locator('.header-glass')
        .evaluate((element) => Number((element as HTMLElement).dataset.glassMedia)),
    )
    .toBeGreaterThan(0)
  const before = await pixels(page)
  await page.evaluate(() => window.scrollTo(0, 780))
  await expect
    .poll(async () => Math.abs((await pixels(page)).channels[0].mean - before.channels[0].mean))
    .toBeGreaterThan(4)
  for (const selector of ['.site-header', '.header-glass', '.header-glass-gpu']) {
    await expect(page.locator(selector)).toHaveCSS('backdrop-filter', 'none')
    await expect(page.locator(selector)).toHaveCSS('filter', 'none')
  }
  await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(page.locator('.site-header')).toHaveCSS('border-top-width', '0px')
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(page.locator('.header-glass')).toHaveCSS('opacity', '0')
  expect(errors).toEqual([])
})

test('live canvas pixels feed the lens and the rendered result follows content changes', async ({
  page,
}) => {
  await page.goto('/')
  await contracted(page)
  await page.evaluate(() => {
    const backdrop = document.createElement('canvas')
    backdrop.id = 'glass-test-source'
    backdrop.width = innerWidth
    backdrop.height = 150
    backdrop.style.cssText =
      'position:fixed;inset:0 auto auto 0;width:100vw;height:150px;z-index:2;pointer-events:none'
    const ctx = backdrop.getContext('2d')!
    ctx.fillStyle = '#e63020'
    ctx.fillRect(0, 0, backdrop.width, backdrop.height)
    document.querySelector('main')!.append(backdrop)
  })
  await expect
    .poll(async () => {
      const stats = await pixels(page)
      return stats.channels[0].mean - stats.channels[1].mean
    })
    .toBeGreaterThan(35)
  await page.evaluate(() => {
    const source = document.getElementById('glass-test-source') as HTMLCanvasElement
    const ctx = source.getContext('2d')!
    ctx.fillStyle = '#20d5e6'
    ctx.fillRect(0, 0, source.width, source.height)
  })
  await expect
    .poll(async () => {
      const stats = await pixels(page)
      return stats.channels[2].mean - stats.channels[0].mean
    })
    .toBeGreaterThan(35)
})

test('the lens softens fine detail and refracts the source across its top bevel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await contracted(page)
  await page.evaluate(() => {
    const source = document.createElement('canvas')
    source.id = 'optics-test-pattern'
    source.width = innerWidth
    source.height = 150
    source.style.cssText =
      'position:fixed;inset:0 auto auto 0;width:100vw;height:150px;z-index:2;pointer-events:none'
    const ctx = source.getContext('2d')!
    for (let x = 0; x < source.width; x++) {
      ctx.fillStyle = x % 2 ? '#ffffff' : '#000000'
      ctx.fillRect(x, 0, 1, 150)
    }
    document.querySelector('main')!.append(source)
  })
  // A tinted copy would retain the one-pixel stripe contrast; the optical blur resolves it.
  await expect.poll(async () => (await pixels(page)).channels[0].mean).toBeGreaterThan(25)
  await expect.poll(async () => (await pixels(page)).channels[0].stdev).toBeLessThan(20)
  await page.evaluate(() => {
    const source = document.getElementById('optics-test-pattern') as HTMLCanvasElement
    const ctx = source.getContext('2d')!
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(0, 0, source.width, 24)
    ctx.fillStyle = '#0000ff'
    ctx.fillRect(0, 24, source.width, 126)
  })
  // At screen y=20–22 the unmodified backdrop is red. The bevel bends rays into blue
  // pixels below y=24. This catches a flat blur/tint presented as refraction.
  await expect
    .poll(async () => {
      const image = await page.locator('.header-glass').screenshot()
      const crop = await sharp(image)
        .extract({ left: 110, top: 4, width: 140, height: 2 })
        .removeAlpha()
        .toBuffer()
      const stats = await sharp(crop).stats()
      return stats.channels[2].mean - stats.channels[0].mean
    })
    .toBeGreaterThan(20)
})

test('context loss switches to the sampled fallback and restores GPU rendering', async ({
  page,
}) => {
  await page.goto('/')
  await contracted(page)
  const lens = page.locator('.header-glass')
  await expect(lens).toHaveAttribute('data-glass-mode', 'webgl')
  const extension = await page
    .locator('.header-glass-gpu')
    .evaluateHandle(
      (canvas) =>
        (canvas as HTMLCanvasElement).getContext('webgl')!.getExtension('WEBGL_lose_context')!,
    )
  await extension.evaluate((extension) => extension.loseContext())
  await expect(lens).toHaveAttribute('data-glass-mode', 'canvas')
  await expect(page.locator('.header-glass-soft')).toBeVisible()
  await expect
    .poll(async () => (await pixels(page)).channels.reduce((sum, channel) => sum + channel.mean, 0))
    .toBeGreaterThan(5)
  await extension.evaluate((extension) => extension.restoreContext())
  await expect(lens).toHaveAttribute('data-glass-mode', 'webgl')
  await expect(page.locator('.header-glass-gpu')).toBeVisible()
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Site navigation' })).not.toBeVisible()
})

test('missing WebGL keeps a sampled surface and working navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null
      return Reflect.apply(original, this, [type, ...args])
    } as typeof original
  })
  await page.goto('/')
  await contracted(page)
  await expect(page.locator('.header-glass')).toHaveAttribute('data-glass-mode', 'canvas')
  await expect(page.locator('.header-glass-soft')).toBeVisible()
  await expect
    .poll(async () => (await pixels(page)).channels.reduce((sum, channel) => sum + channel.mean, 0))
    .toBeGreaterThan(5)
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /Visual diary/ })
    .click()
  await expect(page).toHaveURL('/gallery')
  await contracted(page)
  await expect(page.locator('.header-glass')).toHaveAttribute('data-glass-mode', 'canvas')
})

test('mobile and reduced motion preserve the lens, controls, and viewport fit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await contracted(page)
    await expect(page.locator('.header-glass')).toHaveAttribute('data-glass-mode', 'webgl')
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('.site-header')).toHaveCSS('backdrop-filter', 'none')
  }
})

test('high contrast uses a readable system surface instead of the lens', async ({ page }) => {
  await page.emulateMedia({ contrast: 'more' })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/)
  await expect(page.locator('.header-glass')).not.toBeVisible()
  await expect(page.locator('.site-header')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeInViewport()
})
