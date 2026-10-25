import { test, expect, type Page } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import { ibadanActs, ibadanChapters, ibadanSources } from '../../src/data/ibadan'
import { ibadanGallery } from '../../src/data/ibadan-gallery'
import * as THREE from 'three'
import { sampleModelSurface } from '../../src/components/ibadan/particle-surface'

async function enterQuietly(page: Page) {
  await page.getByRole('button', { name: 'Entry atmosphere' }).click()
  await page.getByRole('button', { name: 'Enter the story', exact: true }).click()
  await expect(page.locator('main')).toHaveClass(/phase-story/)
}
async function episode(page: Page, id: string) {
  const item = ibadanChapters.find((item) => item.id === id)!
  await page.getByRole('button', { name: 'Open journey menu', exact: true }).click()
  const dialog = page.getByRole('dialog'),
    act = dialog.getByRole('button', { name: new RegExp(ibadanActs[item.act - 1].title) })
  if ((await act.getAttribute('aria-expanded')) !== 'true') await act.click()
  await dialog
    .getByRole('button', { name: new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
    .click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', id)
}

test('the supplied chronology and evidence remain coherent, complete and attributable', () => {
  expect(ibadanActs).toHaveLength(6)
  expect(ibadanChapters).toHaveLength(18)
  expect(ibadanSources).toHaveLength(23)
  const years = ibadanChapters.flatMap((chapter) =>
    chapter.sortYear === null ? [] : [chapter.sortYear],
  )
  expect(years).toEqual([...years].sort((a, b) => a - b))
  const ids = new Set(ibadanSources.map((source) => source.id as string))
  for (const chapter of ibadanChapters) {
    expect(chapter.historicalClaims.length).toBeGreaterThan(0)
    for (const claim of chapter.historicalClaims) {
      expect(claim.sourceIds.length).toBeGreaterThan(0)
      expect(claim.sourceIds.every((id) => ids.has(id))).toBe(true)
    }
    expect(chapter.locations.every((location) => location.coordinates === null)).toBe(true)
    expect(
      chapter.assets.every((asset) => asset.verificationStatus.includes('Creative reconstruction')),
    ).toBe(true)
    expect(chapter.uncertainties.length).toBeGreaterThan(0)
  }
  const byId = Object.fromEntries(ibadanChapters.map((chapter) => [chapter.id, chapter]))
  expect(byId.origins.historicalClaims[0].evidenceStatus).toBe(
    'Oral tradition / disputed chronology',
  )
  expect(byId.arrival.historicalClaims[0].evidenceStatus).toBe('Conventional date')
  expect(byId.kiriji.text).toContain('1886')
  expect(byId.kiriji.text).toContain('1893')
  expect(byId.agreement.text).toContain('continuation of domestic slavery')
  expect(byId.wntv.text).toContain('31 October 1959')
  expect(byId.wntv.text).not.toMatch(/Africa.s first/)
  expect(byId.cocoa.text).toContain('1964')
  expect(byId.cocoa.text).toContain('1965')
  expect(byId.efunsetan.historicalClaims[0].sourceIds).toContain('S06')
  expect(byId.efunsetan.text).toContain('enslaved labour')
  expect(
    ibadanChapters
      .filter((chapter) => chapter.form === 'mapo')
      .every((chapter) => chapter.sortYear! >= 1929),
  ).toBe(true)
  expect(
    ibadanChapters
      .filter((chapter) => chapter.locations[0].name.includes('Bodija'))
      .every((chapter) => chapter.sortYear! >= 1976),
  ).toBe(true)
})

test('portrait source models have usable topology and retained CC0 provenance', async () => {
  for (const name of ['iyalode-study', 'commander-study']) {
    const bytes = await readFile(`public/ibadan/models/${name}.glb`)
    expect(bytes.toString('utf8', 0, 4)).toBe('glTF')
    expect(bytes.readUInt32LE(4)).toBe(2)
    expect(bytes.readUInt32LE(8)).toBe(bytes.length)
    const jsonLength = bytes.readUInt32LE(12)
    const document = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength))
    const positions = document.accessors[0],
      triangles = document.accessors[2]
    expect(positions.count).toBeGreaterThan(16000)
    expect(triangles.count / 3).toBeGreaterThan(30000)
    expect(document.asset.copyright).toContain('not an authenticated likeness')
    const binary = 20 + jsonLength + 8
    const positionView = document.bufferViews[positions.bufferView]
    const finite = Array.from({ length: positions.count * 3 }, (_, i) =>
      bytes.readFloatLE(binary + positionView.byteOffset + i * 4),
    ).every(Number.isFinite)
    expect(finite).toBe(true)
    const indexView = document.bufferViews[triangles.bufferView]
    const validIndices = Array.from({ length: triangles.count }, (_, i) =>
      bytes.readUInt32LE(binary + indexView.byteOffset + i * 4),
    ).every((value) => value < positions.count)
    expect(validIndices).toBe(true)
  }
  expect(await readFile('public/ibadan/models/MAKEHUMAN-CC0.txt', 'utf8')).toContain('CC0')
  expect(Object.keys(ibadanGallery)).toEqual(ibadanChapters.map((chapter) => chapter.id))
  expect(new Set(Object.values(ibadanGallery).map((item) => item.sculpture)).size).toBe(14)
  for (const exhibit of Object.values(ibadanGallery)) {
    expect(
      (await readFile(`public/ibadan/posters/${exhibit.sculpture}.webp`)).length,
    ).toBeGreaterThan(1000)
    expect(exhibit.note.length).toBeGreaterThan(60)
  }
})

test('particles follow transformed triangle area, preserve normals and exclude display bases', () => {
  const root = new THREE.Group()
  root.position.set(1, 2, 3)
  root.scale.setScalar(2)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 2, 0, 0, 0, 2, 0, 10, 0, 0, 11, 0, 0, 10, 1, 0], 3),
  )
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial()
  root.add(new THREE.Mesh(geometry, material))
  const baseGeometry = new THREE.BoxGeometry(100, 100, 100)
  const base = new THREE.Mesh(baseGeometry, material)
  base.userData.presentation = true
  root.add(base)
  const sample = sampleModelSurface(root, 6000)
  expect(sample.positions).toEqual(sampleModelSurface(root, 6000).positions)
  let large = 0
  for (let i = 0; i < 6000; i++) {
    if (sample.positions[i * 3] < 8) large++
  }
  expect(large / 6000).toBeGreaterThan(0.77)
  expect(large / 6000).toBeLessThan(0.83)
  expect([...sample.positions].every(Number.isFinite)).toBe(true)
  expect([...sample.positions].filter((_, i) => i % 3 === 2).every((z) => z === 3)).toBe(true)
  expect([...sample.normals].filter((_, i) => i % 3 === 2).every((z) => z > 0.999)).toBe(true)
  geometry.dispose()
  baseGeometry.dispose()
  material.dispose()
})

test('entry is centred, cinematic, full screen, and retains real browser fullscreen controls', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ibadan')
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.site-header,.site-footer,iframe,.brand-intro')).toHaveCount(0)
  const bounds = (await page
    .getByRole('button', { name: 'Enter the story', exact: true })
    .boundingBox())!
  expect(Math.abs(bounds.x + bounds.width / 2 - 720)).toBeLessThan(2)
  await mkdir('artifacts/ibadan-particles', { recursive: true })
  await page.screenshot({ path: 'artifacts/ibadan-particles/entry-desktop.png' })
  await page.getByRole('button', { name: 'Entry atmosphere' }).click()
  await page.getByRole('button', { name: 'Enter the story', exact: true }).click()
  await expect(page.locator('main')).toHaveClass(/phase-opening/)
  await expect(page.locator('main')).toHaveClass(/phase-story/)
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'true')
  expect(await page.evaluate(() => document.fullscreenElement?.id)).toBe('main')
  await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'false')
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-fullscreen', 'true')
  expect(errors).toEqual([])
})

test('arrival viewpoints connect a composite household to settlement and migration', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await enterQuietly(page)
  await episode(page, 'arrival')
  await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-scene', 'arrival')
  await page.getByRole('button', { name: 'Follow a household', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText('creative composite')
  await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-view', 'people')
  await page.getByRole('button', { name: 'Read the settlement', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText('different needs')
  await page.getByRole('button', { name: 'Follow the paths', exact: true }).click()
  await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-view', 'routes')
  await page.getByRole('button', { name: 'Read the evidence', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Conventional date')
  await expect(page.getByRole('dialog')).toContainText('S03')
  await expect(page.getByRole('dialog')).toContainText('Full PDF access failed')
})

test('Efunsetan has commerce, coercion and political agency with scholarship distinguished from drama', async ({
  page,
}) => {
  await page.goto('/ibadan')
  await enterQuietly(page)
  await episode(page, 'efunsetan')
  await page.getByRole('button', { name: 'Look at the labour', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText(
    'never resources to collect or command',
  )
  await page.getByRole('button', { name: 'Read the power', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText('commercial agency')
  await page.getByRole('button', { name: 'People & relationships', exact: false }).click()
  await expect(page.getByRole('dialog')).toContainText('Efunsetan Aniwura')
  await expect(page.getByRole('dialog')).toContainText('Aare Latoosa')
  await page.getByRole('button', { name: 'See the historical evidence', exact: false }).click()
  await expect(page.getByRole('dialog')).toContainText('History is not the same as drama')
  await expect(page.getByRole('dialog')).toContainText('S06')
})

test('Mbari connects a composite artist to its historical participants with distinct participant viewpoints', async ({
  page,
}) => {
  await page.goto('/ibadan')
  await enterQuietly(page)
  await episode(page, 'mbari')
  await expect(page.locator('.ibadan-spatial-label')).toContainText('Onireke Road near Dugbe')
  await page.getByRole('button', { name: 'Enter the rehearsal', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText('1961')
  await page.getByRole('button', { name: 'Around the table', exact: true }).click()
  await expect(page.locator('.ibadan-caption-text')).toContainText('not reproduced Mbari works')
  await page.getByRole('button', { name: 'Join the audience', exact: true }).click()
  await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-view', 'routes')
  await page.getByRole('button', { name: 'People & relationships', exact: false }).click()
  await expect(page.getByRole('dialog')).toContainText('Wole Soyinka')
  await expect(page.getByRole('dialog')).toContainText('Composite viewpoint')
})

test('the chapter menu scrolls natively to its final items and keeps the page locked', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 568 })
  await page.goto('/ibadan')
  await enterQuietly(page)
  await page.getByRole('button', { name: 'Open journey menu', exact: true }).click()
  const panel = page.locator('.ibadan-panel')
  expect(await panel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  await page.mouse.move(280, 470)
  await page.mouse.wheel(0, 1000)
  await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  await expect(page.locator('.ibadan-menu-end button')).toBeInViewport()
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.getByRole('button', { name: /The unfinished city/ }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /The city is still being made/ })
    .click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'water')
})

test('the global site menu scrolls past its final link under Lenis and previews focused destinations', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
  await page.setViewportSize({ width: 390, height: 568 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const sheet = page.locator('.menu-sheet')
  expect(await sheet.evaluate((element) => element.hasAttribute('data-lenis-prevent'))).toBe(true)
  await expect
    .poll(() => sheet.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(1)
  expect(await sheet.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  const y = await page.evaluate(() => scrollY)
  await page.mouse.move(280, 475)
  await page.mouse.wheel(0, 1100)
  await expect.poll(() => sheet.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await expect(page.locator('.mobile-menu-email')).toBeInViewport()
  expect(await page.evaluate(() => scrollY)).toBe(y)
  await page.getByRole('button', { name: 'Close navigation menu' }).click()
  await expect(page.locator('#mobile-navigation')).not.toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: /Ibadan/ })
    .focus()
  await expect(page.locator('.menu-live-preview')).toContainText('A city made and remade')
})

test('the text edition exposes all eighteen chronological episodes and their human subjects', async ({
  page,
}) => {
  await page.goto('/ibadan')
  await page.getByRole('button', { name: 'Read without 3D', exact: false }).click()
  const article = page.getByRole('article', { name: 'Text edition' })
  for (let i = 0; i < ibadanChapters.length; i++) {
    await expect(
      article.getByRole('heading', { name: ibadanChapters[i].title, exact: true }),
    ).toBeVisible()
    await expect(article).toContainText('People & relationships')
    if (i < ibadanChapters.length - 1)
      await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Restart the journey', exact: true }).click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'origins')
})

test('small phones, portrait tablets and landscape retain centred entry and readable controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mkdir('artifacts/ibadan-particles', { recursive: true })
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/ibadan')
    const button = page.getByRole('button', { name: 'Enter the story', exact: true }),
      box = (await button.boundingBox())!
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2)
    await expect(button).toBeInViewport()
    await enterQuietly(page)
    expect(await page.locator('main').boundingBox()).toEqual({ x: 0, y: 0, width, height })
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true)
    await expect(page.getByRole('button', { name: 'Next chapter', exact: true })).toBeInViewport()
    await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
    const text = (await page.locator('.ibadan-caption-text').boundingBox())!
    const caption = (await page.locator('.ibadan-caption').boundingBox())!
    expect(text.y + 19).toBeLessThan(caption.y + caption.height)
    await page.screenshot({ path: `artifacts/ibadan-particles/arrival-${width}.png` })
  }
})

test('audio remains opt in, can mute and resume, and closes on leaving the experience', async ({
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
  await page.getByRole('button', { name: 'Enter the story', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Mute Ibadan atmosphere' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(await states()).toEqual(['running'])
  await page.getByRole('button', { name: 'Mute Ibadan atmosphere' }).click()
  await expect.poll(states).toEqual(['suspended'])
  await page.getByRole('button', { name: 'Enable Ibadan atmosphere' }).click()
  await expect.poll(states).toEqual(['running'])
  await page.getByRole('link', { name: 'Exit Ibadan experience' }).click()
  await expect(page).toHaveURL('/')
  await expect.poll(states).toEqual(['closed'])
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull()
})

test('optional narration prefers an available Nigerian English voice and follows the chapter', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const spoken: { text: string; voice: string; lang: string }[] = []
    Object.assign(window, { __spoken: spoken })
    class Utterance {
      text: string
      voice: { name: string } | null = null
      lang = ''
      onstart: (() => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance })
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [
          { name: 'Available British voice', lang: 'en-GB' },
          { name: 'Available Nigerian voice', lang: 'en-NG' },
        ],
        addEventListener: () => {},
        removeEventListener: () => {},
        cancel: () => {},
        speak: (utterance: Utterance) => {
          spoken.push({
            text: utterance.text,
            voice: utterance.voice?.name || '',
            lang: utterance.lang,
          })
          queueMicrotask(() => utterance.onstart?.())
        },
      },
    })
  })
  await page.goto('/ibadan')
  await enterQuietly(page)
  expect(
    await page.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken.length),
  ).toBe(0)
  await page.getByRole('button', { name: 'Listen to the story', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Stop narration', exact: true })).toBeVisible()
  const spoken = await page.evaluate(
    () =>
      (window as unknown as { __spoken: { text: string; voice: string; lang: string }[] }).__spoken,
  )
  expect(spoken.at(-1)?.voice).toBe('Available Nigerian voice')
  expect(spoken.at(-1)?.lang).toBe('en-NG')
  await page.getByRole('button', { name: 'Next chapter', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __spoken: { text: string }[] }).__spoken.at(-1)?.text,
      ),
    )
    .toContain('1829')
  await page.getByRole('button', { name: 'Stop narration', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Listen to the story', exact: true })).toBeVisible()
})

test('WebGL failure retains the complete text journey and evidence', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/ibadan')
  await page.getByRole('button', { name: 'Enter the story', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Text edition' })).toBeVisible()
  await episode(page, 'efunsetan')
  await expect(page.getByRole('article', { name: 'Text edition' })).toContainText(
    'Efunsetan Aniwura',
  )
  await page
    .getByRole('button', { name: 'Evidence, sources & interpretation', exact: false })
    .click()
  await expect(page.getByRole('dialog')).toContainText('S06')
})

test('lost contexts retry cleanly and reduced motion produces stable spatial scenes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await enterQuietly(page)
  await page
    .locator('canvas')
    .evaluate((canvas) => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
  await expect(page.getByRole('article', { name: 'Text edition' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry spatial edition', exact: false }).click()
  await expect(page.locator('main')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('canvas')).toHaveCount(1)
  await page.locator('main').focus()
  await page.waitForTimeout(100)
  const before = await page.screenshot()
  await page.waitForTimeout(200)
  expect(await page.screenshot()).toEqual(before)
})

test('the homepage has a centred invitation and a transition into the experience', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const invitation = page.getByRole('link', { name: 'Enter the Ibadan story', exact: false })
  await invitation.scrollIntoViewIfNeeded()
  const box = (await invitation.boundingBox())!
  expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(2)
  await invitation.click()
  await expect(page.locator('.ibadan-invitation-veil')).toBeVisible()
  await expect(page).toHaveURL('/ibadan')
  await expect(page.locator('main')).toHaveClass(/phase-story/)
  await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-renderer', 'particles')
})

test('touch scrolling reaches the global menu footer while Lenis keeps the underlying page still', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 568 },
    hasTouch: true,
    isMobile: true,
    baseURL: test.info().project.use.baseURL,
  })
  const page = await context.newPage()
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const sheet = page.locator('.menu-sheet')
  await expect
    .poll(() => sheet.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(1)
  const initial = await page.evaluate(() => scrollY),
    session = await context.newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 280, y: 480 }],
  })
  for (const y of [410, 330, 250, 170, 90])
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 280, y }],
    })
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => sheet.evaluate((element) => element.scrollTop)).toBeGreaterThan(30)
  await expect(page.locator('.mobile-menu-email')).toBeInViewport()
  expect(await page.evaluate(() => scrollY)).toBe(initial)
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeInViewport()
  await context.close()
})

test('the particle model can be inspected, turned by controls and touch, and closed without losing chronology', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await enterQuietly(page)
  await episode(page, 'efunsetan')
  const stage = page.locator('.ibadan-stage')
  await expect(stage).toHaveAttribute('data-renderer', 'particles')
  await page.getByRole('button', { name: 'Inspect the model', exact: false }).click()
  await expect(page.getByRole('region', { name: 'Model inspection' })).toContainText(
    'not an authenticated likeness',
  )
  await page.getByRole('button', { name: 'Rotate model right', exact: true }).click()
  const first = await stage.getAttribute('data-turned')
  await page.getByRole('button', { name: 'Rotate model right', exact: true }).click()
  expect(await stage.getAttribute('data-turned')).not.toBe(first)
  const box = (await page.locator('canvas').boundingBox())!
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4, { steps: 6 })
  await page.mouse.up()
  await page.mouse.wheel(0, 500)
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'efunsetan')
  expect(await stage.getAttribute('data-turned')).not.toBe(first)
  await page.getByRole('button', { name: 'Back to the story', exact: false }).click()
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'efunsetan')
  await expect(page.locator('.ibadan-caption')).toBeVisible()
  await page.getByRole('button', { name: 'Read the evidence', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('CC0 MakeHuman')
})

test('the eighteen-stop timeline and phone scrubber travel directly through the full chronology', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ibadan')
  await enterQuietly(page)
  const timeline = page.getByRole('navigation', { name: 'Historical timeline' })
  for (const chapter of ibadanChapters) {
    await timeline
      .getByRole('button', { name: `${chapter.dateLabel}: ${chapter.title}`, exact: true })
      .click()
    await expect(page.locator('main')).toHaveAttribute('data-chapter', chapter.id)
    await expect(page.locator('.ibadan-stage')).toHaveAttribute('data-scene', chapter.id)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  const slider = page.getByRole('slider', { name: 'Travel through the Ibadan timeline' })
  await slider.focus()
  await slider.press('Home')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'origins')
  await slider.press('End')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'water')
  await slider.press('ArrowLeft')
  await expect(page.locator('main')).toHaveAttribute('data-chapter', 'state')
})

test('a model download failure keeps the complete reading journey available', async ({ page }) => {
  await page.route('**/ibadan/models/*.glb', (route) => route.abort())
  await page.goto('/ibadan')
  await page.getByRole('button', { name: 'Enter the story', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Text edition' })).toBeVisible()
  await episode(page, 'mapo')
  await expect(page.getByRole('article', { name: 'Text edition' })).toContainText('1929')
})
