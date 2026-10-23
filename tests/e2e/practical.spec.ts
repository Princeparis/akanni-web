import { test, expect } from '@playwright/test'
import { calculate, contrast, typeStep } from '../../src/lib/creative-tools'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('scientific arithmetic follows precedence, preserves tiny results, and rejects invalid input', () => {
  for (const [expression, expected] of [
    ['sqrt(144)+2^3', 20],
    ['-2^2', -4],
    ['2^-3', 0.125],
    ['2^3^2', 512],
    ['5!', 120],
    ['50%', 0.5],
    ['2(3+4)', 14],
    ['sin(30)', 0.5],
    ['log(1000)', 3],
    ['ln(e)', 1],
    ['1e-20', 1e-20],
  ] as const)
    expect(calculate(expression)).toBeCloseTo(expected, expression === '1e-20' ? 28 : 10)
  expect(calculate('cos(pi)', 'RAD')).toBeCloseTo(-1, 10)
  for (const input of ['1/0', 'sqrt(-1)', 'tan(90)', '(-2)!', 'constructor(1)', '2+', '2;alert(1)'])
    expect(() => calculate(input)).toThrow()
  expect(contrast('#000000', '#ffffff')).toBe(21)
  const step = typeStep(16, 1.25, 3, true)
  expect(step.maximum).toBe(31.25)
  expect(step.css).toContain('clamp(')
})

test('eight featured cards open real tools, and the original spring experiment remains available', async ({
  page,
  request,
}) => {
  await page.goto('/playground')
  await expect(page.locator('.experiment-card')).toHaveCount(8)
  const paths = await page
    .locator('.experiment-card')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  for (const path of paths) expect((await request.get(path)).status(), path).toBe(200)
  expect((await request.get('/playground/spring-grid')).status()).toBe(200)
  await page.getByRole('link', { name: /Scientific calculator/ }).click()
  await expect(page.getByRole('heading', { name: 'Sum' })).toBeVisible()
  await expect(page.locator('.site-header, .site-footer')).toHaveCount(0)
})

test('calculator supports keyboard, scientific modes, memory, errors, and history reuse', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/playground/calculator')
  const expression = page.getByRole('textbox', { name: 'Expression' })
  await expression.fill('sqrt(144)+2^3')
  await expression.press('Enter')
  await expect(page.locator('.calc-answer')).toHaveText('20')
  await page.getByRole('button', { name: 'M+', exact: true }).click()
  await page.getByRole('button', { name: 'Clear expression' }).click()
  await page.getByRole('button', { name: 'MR', exact: true }).click()
  await expect(expression).toHaveValue('20')
  await expression.fill('sin(30)')
  await expression.press('Enter')
  await expect(page.locator('.calc-answer')).toHaveText('0.5')
  await page.getByRole('button', { name: 'Change angle mode' }).click()
  await expression.fill('cos(pi)')
  await expression.press('Enter')
  await expect(page.locator('.calc-answer')).toHaveText('-1')
  await expression.fill('1/0')
  await expression.press('Enter')
  await expect(page.locator('main').getByRole('alert')).toContainText('Cannot divide by zero')
  await page.locator('.calc-history-item').last().click()
  await expect(expression).toHaveValue('sqrt(144)+2^3')
  await expect(page.locator('main').getByRole('alert')).toBeEmpty()
  expect(errors).toEqual([])
})

test('palette locks survive shuffling, harmonies change, and CSS/JSON exports contain all six colors', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/playground/palette-studio')
  await expect(page.locator('.palette-swatch')).toHaveCount(6)
  const first = page.locator('.palette-swatch').first(),
    locked = await first.evaluate((element) => getComputedStyle(element).backgroundColor)
  await page.getByRole('button', { name: 'Lock color 1', exact: true }).click()
  await page.getByRole('button', { name: 'Shuffle palette' }).click()
  expect(await first.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(locked)
  await page.getByLabel('Color harmony').selectOption('Triadic')
  await page.getByRole('button', { name: 'Copy CSS' }).click()
  const css = await page.evaluate(() => navigator.clipboard.readText())
  expect(css.match(/--color-/g)).toHaveLength(6)
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download JSON' }).click()
  const download = await pending
  const data = JSON.parse(await readFile((await download.path())!, 'utf8'))
  expect(data.colors).toHaveLength(6)
  await page.getByRole('textbox', { name: 'Base color' }).fill('xyz')
  await page.getByRole('button', { name: 'Apply color' }).click()
  await expect(page.locator('.palette-studio > [role="status"]')).toContainText('hex color')
})

test('type generator edits its specimen and exports a real fluid scale', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/playground/type-scale')
  await page.getByLabel('Preview text').fill('Build with intention.')
  await expect(page.locator('.type-specimen p')).toHaveCount(9)
  await expect(page.locator('.type-specimen p').first()).toHaveText('Build with intention.')
  await page.getByLabel('Scale ratio').selectOption('1.333')
  await page
    .getByRole('combobox', { name: 'Typeface', exact: true })
    .selectOption('PP Neue Montreal')
  await page.getByRole('button', { name: 'Copy CSS' }).click()
  let css = await page.evaluate(() => navigator.clipboard.readText())
  expect(css).toContain('clamp(')
  expect(css).toContain('PP Neue Montreal')
  expect(css.match(/--text-/g)).toHaveLength(9)
  await page.getByLabel('Fluid between').uncheck()
  await page.getByRole('button', { name: 'Copy CSS' }).click()
  css = await page.evaluate(() => navigator.clipboard.readText())
  expect(css).not.toContain('clamp(')
})

test('focus timer uses elapsed time, pauses accurately, and completes without automatically restarting', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/playground/focus-timer')
  await page.getByLabel('Session length, minutes').fill('1')
  await page.getByRole('button', { name: 'Set duration' }).click()
  await page.getByRole('button', { name: 'Start session' }).click()
  await page.clock.fastForward(15000)
  await expect(page.getByRole('timer')).toHaveText('00:45')
  await page.getByRole('button', { name: 'Pause session' }).click()
  const paused = await page.getByRole('timer').textContent()
  await page.clock.fastForward(15000)
  await expect(page.getByRole('timer')).toHaveText(paused!)
  await page.getByRole('button', { name: 'Resume session' }).click()
  await page.clock.fastForward(46000)
  await expect(page.getByRole('timer')).toHaveText('00:00')
  await expect(page.getByRole('status')).toContainText('Session complete')
  await expect(page.locator('.focus-completed strong')).toHaveText('01')
  await page.clock.fastForward(60000)
  await expect(page.locator('.focus-completed strong')).toHaveText('01')
  await page.getByRole('button', { name: 'Reset timer' }).click()
  await expect(page.getByRole('timer')).toHaveText('01:00')
})

test('image lab decodes a local upload, exports the requested pixels, and makes no upload requests', async ({
  page,
}) => {
  const uploads: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST') uploads.push(request.url())
  })
  await page.goto('/playground/image-lab')
  await page.getByLabel('Upload image').setInputFiles('public/assets/generated/alloy.webp')
  await page.getByLabel('Width, px').fill('320')
  await page.getByLabel('Height, px').fill('240')
  await expect(page.locator('canvas')).toHaveJSProperty('width', 320)
  await expect(page.locator('canvas')).toHaveJSProperty('height', 240)
  for (const [mime, format] of [
    ['image/png', 'png'],
    ['image/jpeg', 'jpeg'],
    ['image/webp', 'webp'],
  ]) {
    await page.getByRole('combobox', { name: 'Format', exact: true }).selectOption(mime)
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export image' }).click()
    const download = await pending,
      bytes = await readFile((await download.path())!)
    const metadata = await sharp(bytes).metadata()
    expect(metadata.width).toBe(320)
    expect(metadata.height).toBe(240)
    expect(metadata.format).toBe(format)
  }
  expect(uploads).toEqual([])
  await page.getByLabel('Width, px').fill('9999')
  await expect(page.getByRole('button', { name: 'Export image' })).toBeDisabled()
})

test('easing editor changes curves, animates the preview, and exports matching CSS and GSAP', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/playground/motion-studio')
  await page.getByRole('button', { name: 'Overshoot', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'First handle Y' })).toHaveValue('1.5')
  await page.getByRole('button', { name: 'Copy CSS' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'cubic-bezier(0.34, 1.50, 0.64, 1.00)',
  )
  await page.getByRole('button', { name: 'Play movement' }).click()
  await expect
    .poll(() =>
      page
        .locator('.motion-ball')
        .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41),
    )
    .toBeGreaterThan(100)
  await page.getByRole('button', { name: 'Copy GSAP' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('CustomEase.create')
  expect(errors).toEqual([])
})

test('gallery adds three generated studies and preserves the fifteen original frames', async ({
  page,
  request,
}) => {
  await page.goto('/gallery')
  await expect(page.locator('.gallery-item')).toHaveCount(18)
  await expect(page.locator('.gallery-generated-label')).toHaveCount(3)
  for (const name of ['alloy', 'ember', 'nocturne']) {
    const response = await request.get(`/assets/generated/${name}.webp`)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/webp')
  }
  await page.getByRole('button', { name: 'Open visual diary image 1', exact: true }).click()
  await expect(page.locator('.gallery-dialog-top')).toContainText('Generated editorial study')
  await expect(page.locator('.gallery-controls')).toContainText('/ 18')
})

test('all practical tools fit phone, tablet, desktop, and reduced-motion layouts', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of [
      'calculator',
      'palette-studio',
      'type-scale',
      'focus-timer',
      'image-lab',
      'motion-studio',
    ]) {
      await page.goto(`/playground/${slug}`)
      await expect(page.locator('main h1')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${slug} overflows at ${width}px`,
      ).toBe(true)
    }
  }
})
