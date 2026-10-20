import { test, expect } from '@playwright/test'

test('homepage, motion controls, and local project navigation work', async ({ page }) => {
  const errors: string[] = []
  const cmsRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (/\/api\//.test(request.url())) cmsRequests.push(request.url())
  })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Creative by nature. Engineer by craft.' }),
  ).toBeVisible()
  const pause = page.getByRole('button', { name: 'Pause background video' })
  await pause.click()
  await expect(page.locator('video')).toHaveJSProperty('paused', true)
  await page.getByRole('button', { name: 'Play background video' }).click()
  await expect(page.locator('video')).toHaveJSProperty('paused', false)
  await page.getByRole('link', { name: 'Explore selected work' }).click()
  await expect(page).toHaveURL(/#work$/)
  await page.getByRole('link', { name: 'View Reswitch project', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/reswitch$/)
  await expect(page.getByRole('heading', { name: 'Reswitch', exact: true })).toBeVisible()
  expect(cmsRequests).toEqual([])
  expect(errors).toEqual([])
})

test('project filters show the right work and every project resolves', async ({
  page,
  request,
}) => {
  await page.goto('/portfolio')
  await expect(page.locator('.project-card')).toHaveCount(7)
  await page.getByRole('button', { name: /^Brand/ }).click()
  await expect(page.locator('.project-card')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: 'Metnov', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /^Web/ }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Metnov Digital' })).toBeVisible()
  await page.getByRole('button', { name: /^All/ }).click()
  const paths = await page
    .locator('.project-art')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  for (const path of paths) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
  }
})

test('mobile menu supports keyboard dismissal and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const menu = page.locator('#mobile-navigation')
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await menu.getByRole('link', { name: /Visual diary/ }).click()
  await expect(page).toHaveURL('/gallery')
  await expect(menu).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'The way I see things.' })).toBeVisible()
})

test('gallery supports next, previous, Escape, and focus restoration', async ({ page }) => {
  await page.goto('/gallery')
  const firstImage = page.getByRole('button', { name: 'Open visual diary image 1', exact: true })
  await firstImage.click()
  const viewer = page.getByRole('dialog', { name: 'Visual diary image viewer' })
  await expect(viewer).toBeVisible()
  await expect(viewer.locator('.gallery-full-image')).toHaveAttribute('src', /img1\.jpeg/)
  await page.keyboard.press('ArrowRight')
  await expect(viewer.locator('.gallery-full-image')).toHaveAttribute('src', /img2\.jpeg/)
  await viewer.getByRole('button', { name: 'Previous image' }).click()
  await expect(viewer.locator('.gallery-full-image')).toHaveAttribute('src', /img1\.jpeg/)
  await page.keyboard.press('Escape')
  await expect(viewer).not.toBeVisible()
  await expect(firstImage).toBeFocused()
})

test('responsive layouts fit the viewport and reduced motion keeps content available', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Creative by nature. Engineer by craft.' }),
    ).toBeVisible()
    await expect(page.locator('video')).toHaveJSProperty('paused', true)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `horizontal overflow at ${width}px`,
    ).toBe(true)
    await page.getByText('Beyond the screen', { exact: false }).click()
    await expect(page.locator('.personal-note')).toHaveAttribute('open', '')
  }
})

test('blog, CMS, and API routes are removed; the playground works', async ({ page, request }) => {
  for (const path of ['/admin', '/journal', '/api/journals', '/api/graphql']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(404)
  }
  await page.goto('/playground')
  await page.getByRole('button', { name: 'Switch between craft and code' }).click()
  await expect(page.getByRole('button', { name: 'Switch between craft and code' })).toHaveText(
    'Code.',
  )
  await page.getByRole('button', { name: 'Spin the asterisk' }).click()
  await expect(page.getByRole('button', { name: 'Spin the asterisk' })).toBeVisible()
})

test('sound and contact controls reflect their real state', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.getByRole('button', { name: 'Play background music' }).click()
  await expect(page.locator('audio')).toHaveJSProperty('paused', false)
  await expect(page.getByRole('button', { name: 'Pause background music' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Pause background music' }).click()
  await expect(page.locator('audio')).toHaveJSProperty('paused', true)
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.getByRole('status')).toHaveText('Email address copied.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('akanni@metnov.org')
})

test('inner pages fit narrow and tablet viewports', async ({ page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/portfolio', '/portfolio/metnov-web', '/gallery', '/playground']) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path} overflows at ${width}px`,
      ).toBe(true)
    }
  }
})
