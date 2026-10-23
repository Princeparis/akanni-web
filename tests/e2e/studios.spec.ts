import { test, expect, type Page } from '@playwright/test'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { inflateRawSync } from 'node:zlib'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import sharp from 'sharp'

const names = { caustic: 'Caustic', loom: 'Loom' } as const
type Slug = keyof typeof names

async function open(page: Page, slug: Slug) {
  await page.goto(`/playground/${slug}`)
  const studio = page.frameLocator(`iframe[title="${names[slug]} interactive studio"]`)
  await expect(studio.locator('#art')).toHaveAttribute('data-ready', 'true')
  await expect.poll(() => studio.locator('#art').getAttribute('data-frames')).not.toBeNull()
  return studio
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('ten featured instruments retain the original eight in their exact order', async ({
  page,
  request,
}) => {
  await page.goto('/playground')
  await expect(page.locator('.experiment-card')).toHaveCount(10)
  expect(
    await page
      .locator('.experiment-card')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))),
  ).toEqual([
    '/playground/calculator',
    '/playground/palette-studio',
    '/playground/type-scale',
    '/playground/focus-timer',
    '/playground/image-lab',
    '/playground/motion-studio',
    '/playground/matter',
    '/playground/pulse',
    '/playground/caustic',
    '/playground/loom',
  ])
  for (const slug of ['caustic', 'loom']) {
    expect((await request.get(`/playground/${slug}`)).ok()).toBe(true)
    expect((await request.get(`/assets/playground/${slug}-preview.webp`)).ok()).toBe(true)
  }
  await expect(
    page.getByRole('navigation', { name: 'Earlier visual studies' }).getByRole('link'),
  ).toHaveCount(3)
})

test('Caustic renders real pixels, editable refracted type, ripple input and honest PNG export', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const studio = await open(page, 'caustic'),
    canvas = studio.locator('#art')
  await expect(canvas).toHaveAttribute('data-playing', 'false')
  const before = await canvas.screenshot()
  await studio.getByRole('button', { name: 'Infrared', exact: true }).click()
  await studio.getByLabel('Words beneath the surface').fill('HELLO / TOMORROW.')
  await studio.getByLabel('Refraction', { exact: true }).fill('90')
  await studio.getByLabel('Colour separation').fill('80')
  await studio.getByLabel('Wave persistence').fill('25')
  await expect(studio.locator('#bend-value')).toHaveText('90%')
  await canvas.focus()
  await canvas.press('ArrowLeft')
  await canvas.press('Space')
  expect((await canvas.screenshot()).equals(before)).toBe(false)
  const pending = page.waitForEvent('download')
  await studio.getByRole('button', { name: /Save the light/ }).click()
  const download = await pending
  expect(download.suggestedFilename()).toMatch(/^caustic-\d+\.png$/)
  const image = sharp(await readFile((await download.path())!))
  expect((await image.metadata()).width).toBeGreaterThan(500)
  expect((await image.stats()).channels[0].stdev).toBeGreaterThan(12)
  await studio.getByRole('button', { name: /Reset the surface/ }).click()
  await expect(studio.getByLabel('Words beneath the surface')).toHaveValue('HELLO / TOMORROW.')
  expect(
    await canvas.evaluate((node) => (node as HTMLCanvasElement).getContext('webgl2')!.getError()),
  ).toBe(0)
  expect(errors).toEqual([])
})

test('Caustic pointer drag changes the paused wave field', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const studio = await open(page, 'caustic'),
    canvas = studio.locator('#art')
  await canvas.scrollIntoViewIfNeeded()
  const before = await canvas.screenshot(),
    box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.45)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.55, { steps: 12 })
  await page.mouse.up()
  expect((await canvas.screenshot()).equals(before)).toBe(false)
})

test('Loom is a draggable printed mesh with keyboard picking, alternate anchors and PNG output', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const studio = await open(page, 'loom'),
    canvas = studio.locator('#art')
  await canvas.scrollIntoViewIfNeeded()
  const before = await canvas.screenshot(),
    box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
  await page.mouse.down()
  await expect(canvas).toHaveAttribute('data-grabbed', 'true')
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.36, { steps: 10 })
  expect((await canvas.screenshot()).equals(before)).toBe(false)
  await page.mouse.up()
  await expect(canvas).toHaveAttribute('data-grabbed', 'false')
  await canvas.focus()
  await canvas.press('Enter')
  await canvas.press('ArrowUp')
  await expect(canvas).toHaveAttribute('data-grabbed', 'true')
  await canvas.press('Escape')
  await expect(canvas).toHaveAttribute('data-grabbed', 'false')
  await studio.getByRole('button', { name: 'Flag', exact: true }).click()
  await expect(studio.getByRole('button', { name: 'Flag', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const flag = await canvas.screenshot()
  await studio.getByRole('button', { name: 'Drape', exact: true }).click()
  expect((await canvas.screenshot()).equals(flag)).toBe(false)
  await studio.getByRole('button', { name: 'Cobalt', exact: true }).click()
  await studio.getByLabel('Your words, in the wind').fill('STAY / CURIOUS.')
  await studio.getByLabel('Wind strength').fill('80')
  await studio.getByLabel('Fabric tension').fill('35')
  await studio.getByRole('button', { name: /Send a gust/ }).click()
  const pending = page.waitForEvent('download')
  await studio.getByRole('button', { name: /Take an impression/ }).click()
  const download = await pending
  expect(download.suggestedFilename()).toMatch(/^loom-\d+\.png$/)
  const image = sharp(await readFile((await download.path())!))
  expect((await image.metadata()).height).toBeGreaterThan(500)
  expect((await image.stats()).channels[0].stdev).toBeGreaterThan(15)
  expect(
    await canvas.evaluate((node) => (node as HTMLCanvasElement).getContext('webgl2')!.getError()),
  ).toBe(0)
  expect(errors).toEqual([])
})

test('Loom keeps its flag visibly inside the studio during a strong gust', async ({ page }) => {
  const studio = await open(page, 'loom'),
    canvas = studio.locator('#art')
  await studio.getByRole('button', { name: 'Flag', exact: true }).click()
  await studio.getByLabel('Wind strength').fill('100')
  await studio.getByRole('button', { name: /Send a gust/ }).click()
  await canvas.scrollIntoViewIfNeeded()
  await page.waitForTimeout(2500)
  const url = await canvas.evaluate((node) => (node as HTMLCanvasElement).toDataURL('image/png'))
  const { data, info } = await sharp(Buffer.from(url.split(',')[1], 'base64'))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let cloth = 0,
    clipped = 0
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 3
      if (data[i] > 90 && data[i] > data[i + 1] * 1.35 && data[i] > data[i + 2] * 1.35) {
        cloth++
        if (
          x < info.width * 0.02 ||
          x > info.width * 0.98 ||
          y < info.height * 0.02 ||
          y > info.height * 0.98
        )
          clipped++
      }
    }
  expect(cloth / (info.width * info.height)).toBeGreaterThan(0.08)
  expect(clipped / cloth).toBeLessThan(0.01)
})

test('motion advances, pauses cleanly, and stops rendering when the canvas is scrolled away', async ({
  page,
}) => {
  for (const slug of ['caustic', 'loom'] as const) {
    const studio = await open(page, slug),
      canvas = studio.locator('#art')
    const count = async () => Number(await canvas.getAttribute('data-frames'))
    await expect(canvas).toHaveAttribute('data-playing', 'true')
    const initial = await count()
    await expect.poll(count).toBeGreaterThan(initial + 2)
    await studio.getByRole('button', { name: /Pause motion/ }).click()
    await expect(canvas).toHaveAttribute('data-playing', 'false')
    await page.waitForTimeout(150)
    const paused = await count()
    await page.waitForTimeout(200)
    expect(await count()).toBe(paused)
    await studio.getByRole('button', { name: /Resume motion/ }).click()
    // The button is below the canvas on some screens; return the actual surface to view.
    await canvas.scrollIntoViewIfNeeded()
    await expect.poll(count).toBeGreaterThan(paused)
    await studio.locator('#notes').evaluate((node) => {
      ;(node as HTMLDetailsElement).open = true
      // Give the lower notes enough room to put the entire tall canvas offscreen.
      document.body.style.paddingBottom = `${innerHeight}px`
      node.scrollIntoView({ block: 'start' })
    })
    await expect(canvas).not.toBeInViewport()
    await page.waitForTimeout(200)
    const hidden = await count()
    await page.waitForTimeout(200)
    expect(await count()).toBe(hidden)
  }
})

test('both studios fit phones and tablets, start static with reduced motion, and retain usable controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['caustic', 'loom'] as const) {
      const studio = await open(page, slug)
      await expect(studio.locator('#art')).toHaveAttribute('data-playing', 'false')
      expect(
        await studio
          .locator('body')
          .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await expect(page.locator('.site-header,.site-footer')).toHaveCount(0)
      await expect(studio.getByRole('link', { name: /Take the source/ })).toBeVisible()
      await studio
        .getByRole('button', { name: slug === 'loom' ? 'Acid' : 'Daybreak', exact: true })
        .click()
      await expect(
        studio.getByRole('button', { name: slug === 'loom' ? 'Acid' : 'Daybreak', exact: true }),
      ).toHaveAttribute('aria-pressed', 'true')
    }
  }
})

test('resizing the same studio across mobile and desktop keeps its stage bounded', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const slug of ['caustic', 'loom'] as const) {
    const studio = await open(page, slug)
    for (const width of [390, 1440, 768, 320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      if (width > 700) {
        await expect
          .poll(async () => {
            const stage = await studio.locator('.viewport').boundingBox(),
              controls = await studio.locator('.controls').boundingBox()
            return Math.abs(stage!.height - controls!.height)
          })
          .toBeLessThan(2)
      } else {
        const stage = (await studio.locator('.viewport').boundingBox())!
        expect(stage.height).toBeLessThanOrEqual(590)
        expect(stage.height).toBeGreaterThanOrEqual(360)
      }
      expect(
        await studio
          .locator('body')
          .evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true)
      await expect(studio.locator('#art')).toHaveAttribute('data-ready', 'true')
    }
  }
})

test('real touch drags disturb the light and pick up the cloth on a phone', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const session = await context.newCDPSession(page)
  try {
    for (const slug of ['caustic', 'loom'] as const) {
      const studio = await open(page, slug),
        canvas = studio.locator('#art')
      await canvas.scrollIntoViewIfNeeded()
      const before = await canvas.screenshot(),
        rect = (await canvas.boundingBox())!
      const x = rect.x + rect.width * 0.5,
        y = rect.y + rect.height * 0.5
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y, id: 0 }],
      })
      if (slug === 'loom') await expect(canvas).toHaveAttribute('data-grabbed', 'true')
      for (let step = 1; step <= 8; step++)
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x + step * 5, y: y - step * 5, id: 0 }],
        })
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      if (slug === 'loom') await expect(canvas).toHaveAttribute('data-grabbed', 'false')
      expect((await canvas.screenshot()).equals(before)).toBe(false)
    }
  } finally {
    await context.close()
  }
})

test('graphics fallback retains source downloads, and lost contexts recover through Retry', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const slug of ['caustic', 'loom'] as const) {
    const studio = await open(page, slug)
    await studio
      .locator('#art')
      .evaluate((node) =>
        (node as HTMLCanvasElement)
          .getContext('webgl2')!
          .getExtension('WEBGL_lose_context')!
          .loseContext(),
      )
    await expect(studio.getByRole('alert')).toBeVisible()
    await expect(studio.locator('[data-capture]')).toBeDisabled()
    await expect(studio.getByRole('link', { name: /Take the source/ })).toBeVisible()
    await studio.getByRole('button', { name: /Retry/ }).click()
    await expect(studio.locator('#art')).toHaveAttribute('data-ready', 'true')
  }
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  for (const slug of ['caustic', 'loom'] as const) {
    await page.goto(`/playground/${slug}`)
    const studio = page.frameLocator('iframe')
    await expect(studio.getByRole('alert')).toBeVisible()
    await expect(studio.locator('[data-capture]')).toBeDisabled()
    await expect(studio.getByRole('link', { name: /Take the source/ })).toBeVisible()
  }
})

// Read ordinary local ZIP records; independent zlib inflation verifies real archive bytes.
function unzip(bytes: Buffer) {
  const files = new Map<string, Buffer>()
  let offset = 0
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = bytes.readUInt32LE(offset + 18),
      nameSize = bytes.readUInt16LE(offset + 26),
      extra = bytes.readUInt16LE(offset + 28)
    expect(bytes.readUInt16LE(offset + 8)).toBe(8)
    const name = bytes.subarray(offset + 30, offset + 30 + nameSize).toString()
    expect(name).not.toMatch(/(^\/|\.\.)/)
    const start = offset + 30 + nameSize + extra
    files.set(name, inflateRawSync(bytes.subarray(start, start + size)))
    offset = start + size
  }
  expect(bytes.readUInt32LE(offset)).toBe(0x02014b50)
  return files
}

for (const slug of ['caustic', 'loom'] as const) {
  test(`${names[slug]} source ZIP downloads, matches live code, and runs independently without external requests`, async ({
    page,
    browser,
  }) => {
    const studio = await open(page, slug)
    const pending = page.waitForEvent('download')
    await studio.getByRole('link', { name: /Take the source/ }).click()
    const download = await pending
    expect(download.suggestedFilename()).toBe(`rayab-${slug}-source.zip`)
    const files = unzip(await readFile((await download.path())!))
    expect([...files.keys()].sort()).toEqual(
      [
        'LICENSE.txt',
        `${slug}/README.md`,
        `${slug}/index.html`,
        `${slug}/scene.js`,
        `${slug}/style.css`,
        'shared/runtime.js',
        'shared/studio.css',
      ].sort(),
    )
    const temporary = await mkdtemp(path.join(tmpdir(), `rayab-${slug}-`))
    // This managed Chromium blocks file://. Serve only the extracted files;
    // block every request outside this loopback server rather than bypass policy.
    const server = createServer(async (request, response) => {
      const name = new URL(request.url!, 'http://localhost').pathname.slice(1)
      if (!files.has(name)) {
        response.writeHead(404).end()
        return
      }
      const mime = name.endsWith('.html')
        ? 'text/html'
        : name.endsWith('.js')
          ? 'text/javascript'
          : name.endsWith('.css')
            ? 'text/css'
            : 'text/plain'
      response.writeHead(200, { 'Content-Type': mime })
      response.end(await readFile(path.join(temporary, name)))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    await context.route('**/*', (route) =>
      route
        .request()
        .url()
        .startsWith(origin + '/')
        ? route.continue()
        : route.abort(),
    )
    try {
      for (const [name, bytes] of files) {
        const source = name === 'LICENSE.txt' ? 'shared/LICENSE.txt' : name
        expect(bytes.equals(await readFile(path.join('public/experiments', source)))).toBe(true)
        const target = path.join(temporary, name)
        await mkdir(path.dirname(target), { recursive: true })
        await writeFile(target, bytes)
      }
      const local = await context.newPage(),
        errors: string[] = [],
        network: string[] = []
      local.on('pageerror', (error) => errors.push(error.message))
      local.on('request', (request) => {
        if (/^https?:/.test(request.url()) && !request.url().startsWith(origin + '/'))
          network.push(request.url())
      })
      await local.goto(`${origin}/${slug}/index.html`)
      await expect(local.locator('#art')).toHaveAttribute('data-ready', 'true')
      await local
        .getByLabel(slug === 'caustic' ? 'Words beneath the surface' : 'Your words, in the wind')
        .fill('OFFLINE / AND YOURS.')
      const save = local.waitForEvent('download')
      await local.locator('[data-capture]').click()
      const image = sharp(await readFile((await (await save).path())!))
      expect((await image.stats()).channels[0].stdev).toBeGreaterThan(10)
      expect(network).toEqual([])
      expect(errors).toEqual([])
    } finally {
      await context.close()
      await new Promise<void>((resolve) => server.close(() => resolve()))
      await rm(temporary, { recursive: true, force: true })
    }
  })
}
