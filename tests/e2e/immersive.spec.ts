import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { makePattern, encodeWav } from '../../src/lib/pulse-audio'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('PCM encoding creates a valid stereo WAV with signed, interleaved samples', async () => {
  const blob = encodeWav([new Float32Array([0, 1, -1]), new Float32Array([0.5, -0.5, 0])], 44100)
  const data = Buffer.from(await blob.arrayBuffer())
  expect(data.subarray(0, 4).toString()).toBe('RIFF')
  expect(data.subarray(8, 12).toString()).toBe('WAVE')
  expect(data.readUInt16LE(22)).toBe(2)
  expect(data.readUInt32LE(24)).toBe(44100)
  expect(data.readUInt32LE(40)).toBe(12)
  expect(data.readInt16LE(48)).toBe(32767)
  expect(data.readInt16LE(52)).toBe(-32768)
  const blank = makePattern('Blank canvas')
  expect(blank).toHaveLength(4)
  expect(blank.every((row) => row.length === 16 && row.every((step) => !step))).toBe(true)
})

test('collection features ten projects and keeps all three original studies accessible', async ({
  page,
  request,
}) => {
  await page.goto('/playground')
  await expect(page.locator('.experiment-card')).toHaveCount(10)
  for (const name of ['Matter', 'Pulse'])
    await expect(page.locator('.experiment-card').getByRole('heading', { name })).toBeVisible()
  for (const slug of ['matter', 'pulse', 'flow-field', 'moire', 'spring-grid'])
    expect((await request.get(`/playground/${slug}`)).status()).toBe(200)
  await expect(
    page.getByRole('navigation', { name: 'Earlier visual studies' }).getByRole('link'),
  ).toHaveCount(3)
  for (const name of ['matter', 'pulse'])
    expect((await request.get(`/assets/playground/${name}-preview.webp`)).ok()).toBe(true)
})

test('Matter renders real geometry, changes form and material, and exports a nonblank PNG', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/playground/matter')
  await expect(page.locator('.matter-stage')).toHaveAttribute('data-ready', 'true')
  const canvas = page.getByRole('img', { name: /Interactive 3D sculpture/ })
  const original = await canvas.screenshot()
  await page.getByRole('button', { name: 'Bloom', exact: true }).click()
  await page.getByRole('button', { name: 'Terracotta', exact: true }).click()
  await expect(page.getByLabel('Surface roughness')).toHaveValue('65')
  await page.getByLabel('Studio light angle').fill('90')
  await page.getByRole('button', { name: 'Front', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Front', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: /Capture your object/ }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('matter-bloom-terracotta.png')
  const bytes = await readFile((await download.path())!)
  const image = sharp(bytes)
  const dimensions = await image.metadata()
  expect(dimensions.format).toBe('png')
  expect(dimensions.width).toBeGreaterThan(500)
  expect(dimensions.height).toBeGreaterThan(500)
  const stats = await image.stats()
  expect(stats.channels[0].stdev).toBeGreaterThan(10)
  expect(bytes.equals(original)).toBe(false)
  await canvas.focus()
  await canvas.press('ArrowRight')
  await canvas.press('+')
  await canvas.press('0')
  await page.getByRole('button', { name: 'Orbit', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Orbit', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(errors).toEqual([])
})

test('Matter responds to real pointer orbit and recovers from WebGL context loss', async ({
  page,
}) => {
  await page.goto('/playground/matter')
  await expect(page.locator('.matter-stage')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: /Pause rotation/ }).click()
  const canvas = page.locator('canvas')
  await canvas.scrollIntoViewIfNeeded()
  const before = await canvas.screenshot()
  const box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 10 })
  await page.mouse.up()
  expect((await canvas.screenshot()).equals(before)).toBe(false)
  await canvas.evaluate((element) =>
    (element as HTMLCanvasElement)
      .getContext('webgl2')!
      .getExtension('WEBGL_lose_context')!
      .loseContext(),
  )
  await expect(page.locator('main').getByRole('alert')).toContainText('3D needs WebGL 2')
  await page.getByRole('button', { name: /Retry the studio/ }).click()
  await expect(page.locator('.matter-stage')).toHaveAttribute('data-ready', 'true')
})

test('Pulse edits all 64 steps, supports keyboard navigation, and exports audible or silent real WAVs', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/playground/pulse')
  await expect(page.locator('.pulse-step')).toHaveCount(64)
  await page.getByRole('button', { name: 'Kick step 2', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Kick step 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Kick step 2', exact: true }).press('ArrowDown')
  await expect(page.getByRole('button', { name: 'Snare step 2', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Snare step 2', exact: true }).press('Space')
  await expect(page.getByRole('button', { name: 'Snare step 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByLabel('Rhythm preset').selectOption('Broken orbit')
  await page.getByLabel('Tempo', { exact: true }).fill('120')
  await page.getByLabel('Volume', { exact: true }).fill('80')
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export WAV/ }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('pulse-120bpm.wav')
  const bytes = await readFile((await download.path())!)
  expect(bytes.subarray(0, 4).toString()).toBe('RIFF')
  expect(bytes.readUInt32LE(24)).toBe(44100)
  expect(bytes.readUInt16LE(22)).toBe(2)
  expect(bytes.readUInt32LE(40)).toBe(44100 * 2 * 2 * 2)
  let peak = 0
  for (let i = 44; i < bytes.length; i += 2) peak = Math.max(peak, Math.abs(bytes.readInt16LE(i)))
  expect(peak).toBeGreaterThan(1000)
  await page.getByRole('button', { name: /Clear pattern/ }).click()
  await expect(page.locator('.pulse-step[aria-pressed="true"]')).toHaveCount(0)
  const silentPending = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export WAV/ }).click()
  const silent = await readFile((await (await silentPending).path())!)
  expect(silent.subarray(44).every((value) => value === 0)).toBe(true)
  expect(errors).toEqual([])
})

test('Pulse starts only on request, plays a clocked pattern, mutes, stops, and closes audio on navigation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    const contexts: AudioContext[] = []
    Object.assign(window, { __pulseContexts: contexts })
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options)
        contexts.push(this)
      }
    }
  })
  await page.goto('/playground/pulse')
  const contextCount = () =>
    page.evaluate(
      () => (window as unknown as { __pulseContexts: AudioContext[] }).__pulseContexts.length,
    )
  expect(await contextCount()).toBe(0)
  await page.getByRole('button', { name: 'Play loop', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Stop loop', exact: true })).toBeVisible()
  await expect(page.locator('.pulse-step[data-current="true"]')).toHaveCount(4)
  expect(await contextCount()).toBe(1)
  const editedKey = page.getByRole('button', { name: 'Kick step 2', exact: true })
  await editedKey.click()
  await expect
    .poll(() =>
      editedKey.evaluate((button) => {
        const matrix = new DOMMatrix(getComputedStyle(button).transform)
        return Math.abs(matrix.b) + Math.abs(matrix.c)
      }),
    )
    .toBeLessThan(0.001)
  await page.getByRole('button', { name: 'Mute Kick', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Mute Kick', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Cloud', exact: true }).click()
  await page.getByRole('button', { name: 'Wave', exact: true }).click()
  await page.getByRole('button', { name: 'Scatter particles', exact: true }).click()
  await page.getByRole('button', { name: 'Stop loop', exact: true }).click()
  await expect(page.locator('.pulse-step[data-current="true"]')).toHaveCount(0)
  await expect
    .poll(() =>
      page.locator('.pulse-step').evaluateAll((buttons) =>
        buttons.every((button) => {
          const matrix = new DOMMatrix(getComputedStyle(button).transform)
          return (
            Math.abs(matrix.a - 1) +
              Math.abs(matrix.b) +
              Math.abs(matrix.c) +
              Math.abs(matrix.d - 1) <
            0.001
          )
        }),
      ),
    )
    .toBe(true)
  await page.getByRole('button', { name: 'Play loop', exact: true }).click()
  await page
    .getByRole('link', { name: /Explore Matter/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Matter', exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __pulseContexts: AudioContext[] }).__pulseContexts[0].state,
      ),
    )
    .toBe('closed')
})

test('WebGL-disabled browsers retain the full rhythm instrument and a clear Matter fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/playground/matter')
  await expect(page.locator('main').getByRole('alert')).toContainText('3D needs WebGL 2')
  await expect(page.getByRole('button', { name: /Capture your object/ })).toBeDisabled()
  await page.goto('/playground/pulse')
  await expect(page.locator('.pulse-visual-fallback')).toContainText(
    'Your rhythm machine still works',
  )
  await page.getByRole('button', { name: 'Play loop', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Stop loop', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Stop loop', exact: true }).click()
})

test('both instruments fit small phones through desktop and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const name of ['matter', 'pulse']) {
      await page.goto(`/playground/${name}`)
      await expect(
        page.getByRole('heading', { name: name === 'matter' ? 'Matter' : 'Pulse', exact: true }),
      ).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        `${name} at ${width}`,
      ).toBeLessThanOrEqual(1)
      await expect(page.locator('.site-header, .site-footer')).toHaveCount(0)
      if (name === 'matter')
        await expect(page.getByRole('button', { name: /Reduced motion/ })).toBeDisabled()
      else {
        await expect(
          page.getByRole('button', { name: 'Scatter particles', exact: true }),
        ).toBeDisabled()
        if (width <= 600)
          expect(
            (await page.getByRole('button', { name: 'Kick step 1', exact: true }).boundingBox())!
              .width,
          ).toBeGreaterThanOrEqual(23)
      }
    }
  }
})
