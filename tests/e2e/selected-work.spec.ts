import { test, expect, type Page } from '@playwright/test'

const names = ['Reswitch', 'Pivota', 'Metnov', 'FXApp']

async function scrollToProject(page: Page, index: number) {
  await page.locator('.work-sequence').evaluate((element, selected) => {
    const start = element.getBoundingClientRect().top + scrollY
    window.scrollTo(0, start + ((element.clientHeight - innerHeight) * selected) / 3)
  }, index)
  await expect(
    page.getByRole('button', { name: `Show ${names[index]}`, exact: true }),
  ).toHaveAttribute('aria-current', 'true')
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
})

test('the deck reverses, exposes only the current project, and releases into the next section', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('#work')).toHaveAttribute('data-enhanced', 'true')
  for (const index of [0, 1, 2, 3, 2, 1, 0]) {
    await scrollToProject(page, index)
    await expect(page.locator('.work-project:not([inert])')).toHaveCount(1)
    await expect(
      page.getByRole('link', { name: `View ${names[index]} project`, exact: true }),
    ).toBeVisible()
  }
  await scrollToProject(page, 3)
  await page.locator('.work-bottom').scrollIntoViewIfNeeded()
  await expect(page.getByRole('link', { name: 'All projects', exact: true })).toBeInViewport()
  expect(
    await page.locator('.work-sticky').evaluate((element) => element.getBoundingClientRect().top),
  ).toBeLessThan(0)
  // The section still follows the discipline strip and precedes the biography.
  expect(
    await page
      .locator('#work')
      .evaluate((element) => [
        element.previousElementSibling?.className,
        element.nextElementSibling?.id,
      ]),
  ).toEqual(['discipline-strip', 'about'])
  expect(errors).toEqual([])
})

test('index keyboard controls select projects without losing focus, and the chosen project opens', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('#work')).toHaveAttribute('data-enhanced', 'true')
  await scrollToProject(page, 0)
  const first = page.getByRole('button', { name: 'Show Reswitch', exact: true })
  await first.focus()
  await page.keyboard.press('End')
  const last = page.getByRole('button', { name: 'Show FXApp', exact: true })
  await expect(last).toBeFocused()
  await expect(last).toHaveAttribute('aria-current', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('button', { name: 'Show Metnov', exact: true })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Show Metnov', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  await expect(first).toHaveAttribute('aria-current', 'true')
  await page.getByRole('button', { name: 'Next featured project', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Show Pivota', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.getByRole('button', { name: 'Previous featured project', exact: true }).click()
  await expect(first).toHaveAttribute('aria-current', 'true')
  await page.getByRole('button', { name: 'Show Metnov', exact: true }).click()
  const link = page.getByRole('link', { name: 'View Metnov project', exact: true })
  await expect(page.getByRole('button', { name: 'Show Metnov', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/portfolio/metnov-brand')
  await expect(page.getByRole('heading', { name: 'Metnov', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.locator('#work')).toHaveAttribute('data-enhanced', 'true')
  await scrollToProject(page, 1)
  await expect(page.getByRole('link', { name: 'View Pivota project', exact: true })).toBeVisible()
})

test('reduced motion reveals every project and switching preferences restores the deck', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#work')).not.toHaveAttribute('data-enhanced', 'true')
  for (const name of names) {
    await expect(
      page.getByRole('link', { name: `View ${name} project`, exact: true }),
    ).toBeVisible()
  }
  await expect(page.locator('.work-project[inert]')).toHaveCount(0)
  await expect(page.locator('.work-step-controls')).not.toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('#work')).toHaveAttribute('data-enhanced', 'true')
  await scrollToProject(page, 2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#work')).not.toHaveAttribute('data-enhanced', 'true')
  await expect(page.locator('.work-project[inert]')).toHaveCount(0)
  await expect(page.locator('.work-art-plane').nth(2)).toHaveCSS('transform', 'none')
})

test('short landscape screens use a readable static collection', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('/')
  await expect(page.locator('#work')).not.toHaveAttribute('data-enhanced', 'true')
  for (const name of names) {
    await expect(
      page.getByRole('link', { name: `View ${name} project`, exact: true }),
    ).toBeVisible()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test.describe('touch collection', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('native touch scrolling advances the deck and tap controls open the right project', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('#work')).toHaveAttribute('data-enhanced', 'true')
    await scrollToProject(page, 0)
    // Dispatch actual browser touch input rather than just resizing a desktop window.
    const client = await page.context().newCDPSession(page)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 190, y: 570 }],
    })
    for (const y of [500, 420, 340, 260, 180]) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: 190, y }],
      })
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(
        await page
          .locator('.work-sequence')
          .evaluate((element) => element.getBoundingClientRect().top + scrollY + 150),
      )
    // Native momentum scrolling consumes a tap as a stop gesture. Wait for it to settle
    // before testing a deliberate selection, just as a visitor would.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let previous = scrollY
          let still = 0
          const check = () => {
            still = Math.abs(scrollY - previous) < 0.5 ? still + 1 : 0
            previous = scrollY
            if (still >= 12) resolve()
            else requestAnimationFrame(check)
          }
          requestAnimationFrame(check)
        }),
    )
    await page.getByRole('button', { name: 'Show FXApp', exact: true }).tap()
    await expect(page.getByRole('button', { name: 'Show FXApp', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await page.getByRole('link', { name: 'View FXApp project', exact: true }).tap()
    await expect(page).toHaveURL('/portfolio/fxapp')
  })
})
