import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('header shrinks with scrolling and expands at the top, retaining only the original icon', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const header = page.locator('.site-header')
  await expect(header.getByRole('link', { name: 'Akanni home' })).toHaveText('')
  expect((await header.boundingBox())!.width).toBe(1440)
  await page.evaluate(() => window.scrollTo(0, 160))
  await expect.poll(async () => (await header.boundingBox())!.width).toBeLessThan(1200)
  expect((await header.boundingBox())!.width).toBeGreaterThan(560)
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect.poll(async () => Math.round((await header.boundingBox())!.width)).toBe(560)
  expect((await header.boundingBox())!.height).toBe(68)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(async () => Math.round((await header.boundingBox())!.width)).toBe(1440)
  await page.setViewportSize({ width: 320, height: 740 })
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect.poll(async () => Math.round((await header.boundingBox())!.width)).toBe(288)
  await expect(header.getByRole('button', { name: 'Open navigation menu' })).toBeInViewport()
})

test('drawer animates its entrance and exit, traps focus, and recovers from early dismissal', async ({
  page,
}) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Open navigation menu' })
  const menu = page.getByRole('dialog', { name: 'Site navigation' })
  await toggle.click()
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  // Closing is animated while the dialog keeps its modal behavior.
  await expect(menu).toHaveAttribute('open', '')
  await expect(menu).not.toBeVisible()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await expect
    .poll(() =>
      menu
        .locator('.menu-sheet')
        .evaluate((element) => Math.round(new DOMMatrix(getComputedStyle(element).transform).m42)),
    )
    .toBe(0)
  await menu.getByRole('link', { name: 'Akanni home', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await menu.getByRole('link', { name: /Playground/ }).click()
  await expect(page).toHaveURL('/playground')
  await expect(menu).not.toBeVisible()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

for (const [slug, title, control] of [
  ['flow-field', 'Field notes', 'Field complexity'],
  ['moire', 'Between the lines', 'Ring spacing'],
  ['spring-grid', 'Soft systems', 'Stiffness'],
]) {
  test(`${slug} is an independent instrument with live controls, pause, inversion, and PNG export`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/playground/${slug}`)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.locator('.site-header, .site-footer')).toHaveCount(0)
    const canvas = page.locator('canvas')
    await expect.poll(() => canvas.evaluate((element) => element.width)).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Pause experiment' }).click()
    await page.waitForTimeout(100)
    const before = await canvas.evaluate((element) => element.toDataURL())
    await page.waitForTimeout(150)
    expect(await canvas.evaluate((element) => element.toDataURL())).toBe(before)
    await page.getByRole('button', { name: /Invert/ }).click()
    await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(before)
    const slider = page.getByRole('slider', { name: control })
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(slider).not.toHaveValue(
      slug === 'flow-field' ? '12' : slug === 'moire' ? '8' : '34',
    )
    await page.getByRole('button', { name: 'Play experiment' }).click()
    const moving = await canvas.evaluate((element) => element.toDataURL())
    await page.mouse.move(400, 440)
    await page.mouse.click(500, 430)
    await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(moving)
    await page.getByRole('button', { name: 'Pause experiment' }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Save PNG' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`${slug}-1.png`)
    expect(await download.failure()).toBeNull()
    await expect(page.getByRole('status')).toHaveText('Frame saved as a PNG.')
    await expect(page.locator('.experiment-code code')).not.toHaveText('')
    expect(errors).toEqual([])
  })
}

test('experiments start static for reduced motion and fit narrow, tablet, and desktop screens', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['flow-field', 'moire', 'spring-grid']) {
      await page.goto(`/playground/${slug}`)
      await expect(page.getByRole('button', { name: 'Play experiment' })).toBeVisible()
      const canvas = page.locator('canvas')
      await page.waitForTimeout(100)
      const frame = await canvas.evaluate((element) => element.toDataURL())
      await page.waitForTimeout(100)
      expect(await canvas.evaluate((element) => element.toDataURL())).toBe(frame)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${slug} at ${width}px`,
      ).toBe(true)
      const box = (await canvas.boundingBox())!
      expect(await canvas.evaluate((element) => element.width)).toBe(Math.round(box.width))
    }
  }
  expect((await request.get('/playground/not-an-experiment')).status()).toBe(404)
})
