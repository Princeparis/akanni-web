import { test, expect } from '@playwright/test'

test('loader holds the sequence, keeps the sculpture alive, and resumes into the hero', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const loader = page.getByTestId('brand-intro')
  const control = page.getByRole('button', { name: 'Hold to explore the sculpture' })
  await expect(loader.locator('.portal-contour')).toHaveCount(24)
  await control.focus()
  await page.keyboard.down('Space')
  await expect(control).toHaveAttribute('aria-pressed', 'true')
  const count = await loader.locator('.portal-counter > span').textContent()
  const path = await loader.locator('.portal-contour').first().getAttribute('d')
  await page.mouse.move(1100, 130)
  await page.waitForTimeout(550)
  expect(await loader.locator('.portal-counter > span').textContent()).toBe(count)
  expect(await loader.locator('.portal-contour').first().getAttribute('d')).not.toBe(path)
  await expect(page.locator('.site-content')).toHaveAttribute('inert', '')
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await page.keyboard.up('Space')
  await expect(loader).not.toBeVisible({ timeout: 7000 })
  await expect(page.locator('.site-content')).not.toHaveAttribute('inert', '')
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  await expect(page.locator('.hero-line-inner').first()).toHaveCSS('transform', /matrix/)
  expect(await page.evaluate(() => sessionStorage.getItem('akanni-intro-seen'))).toBe('true')
  await page.reload()
  await expect(loader).not.toBeVisible()
  expect(errors).toEqual([])
})

test('loader skip works while held and changing motion preference releases the page', async ({
  page,
}) => {
  await page.goto('/')
  const control = page.getByRole('button', { name: 'Hold to explore the sculpture' })
  await control.focus()
  await page.keyboard.down('Space')
  await expect(control).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Skip intro' }).click()
  await page.keyboard.up('Space')
  await expect(page.getByTestId('brand-intro')).not.toBeVisible()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  await page.evaluate(() => sessionStorage.removeItem('akanni-intro-seen'))
  await page.reload()
  await expect(page.getByTestId('brand-intro')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByTestId('brand-intro')).not.toBeVisible()
  await expect(page.locator('.site-content')).not.toHaveAttribute('inert', '')
})

test('loader controls remain clear on compact phones, tablets, desktop, and landscape', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.removeItem('akanni-intro-seen'))
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1440, 1000],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const hold = page.getByRole('button', { name: 'Hold to explore the sculpture' })
    await hold.focus()
    await page.keyboard.down('Space')
    await expect(hold).toHaveAttribute('aria-pressed', 'true')
    await expect(hold).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeInViewport()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${width}x${height}`,
    ).toBe(true)
    await page.keyboard.up('Space')
    await page.getByRole('button', { name: 'Skip intro' }).click()
    await expect(page.getByTestId('brand-intro')).not.toBeVisible()
  }
})

test('touch drag holds the sculpture and releasing continues the introduction', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: test.info().project.use.baseURL,
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.portal-contour').first()).toHaveAttribute('d', /^M/)
  const session = await context.newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 195, y: 320 }],
  })
  await expect(page.getByRole('button', { name: 'Hold to explore the sculpture' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const count = await page.locator('.portal-counter > span').textContent()
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 280, y: 230 }],
  })
  await page.waitForTimeout(300)
  expect(await page.locator('.portal-counter > span').textContent()).toBe(count)
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.getByRole('button', { name: 'Hold to explore the sculpture' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(page.getByTestId('brand-intro')).not.toBeVisible({ timeout: 7000 })
  expect(errors).toEqual([])
  await context.close()
})
