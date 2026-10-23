import { test, expect, type Page } from '@playwright/test'

const idea = {
  subject: 'A thoughtful digital home',
  message: 'I would love to work together on a new website for an independent design studio.',
}
const region = (page: Page) => page.getByRole('region', { name: 'Send an inquiry' })

async function observeAudio(page: Page) {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    const records: { context: AudioContext; gesture: boolean; notes: number[] }[] = []
    Object.assign(window, { __contactAudio: records })
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options)
        const record = {
          context: this,
          gesture: navigator.userActivation.isActive,
          notes: [] as number[],
        }
        records.push(record)
        const create = this.createOscillator.bind(this)
        this.createOscillator = () => {
          const oscillator = create()
          const start = oscillator.start.bind(oscillator)
          oscillator.start = (when = 0) => {
            record.notes.push(oscillator.frequency.value)
            start(when)
          }
          return oscillator
        }
      }
    }
  })
  await page.reload()
}

const audioState = (page: Page) =>
  page.evaluate(() =>
    (
      window as unknown as {
        __contactAudio: { context: AudioContext; gesture: boolean; notes: number[] }[]
      }
    ).__contactAudio.map(({ context, gesture, notes }) => ({
      state: context.state,
      gesture,
      notes,
    })),
  )

async function fillIdea(page: Page) {
  const form = region(page)
  await form.getByLabel('Give it a name').fill(idea.subject)
  await form.getByLabel('Tell me a little more').fill(idea.message)
  await form.getByRole('button', { name: 'A website', exact: true }).click()
  await form.getByRole('button', { name: 'A little about you', exact: true }).click()
}
async function fillPerson(page: Page) {
  const form = region(page)
  await form.getByLabel('Your name', { exact: true }).fill('Jamie Rivera')
  await form.getByLabel('Your email', { exact: true }).fill('jamie@example.com')
  await form.getByLabel('Company or studio').fill('Fieldwork Studio')
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('akanni-intro-seen', 'true'))
  await page.goto('/')
})

test('personal email is used in the footer, clipboard, and navigation menu', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await expect(page.locator('.footer-email a')).toHaveAttribute('href', 'mailto:wemzain@gmail.com')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('wemzain@gmail.com')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.locator('.mobile-menu-email')).toHaveAttribute(
    'href',
    'mailto:wemzain@gmail.com',
  )
  await page.keyboard.press('Escape')
  await page.locator('.footer-title').click()
  await expect(region(page).getByRole('heading', { name: 'What’s on your mind?' })).toBeInViewport()
})

test('steps validate required fields, move focus, and preserve the idea when going back', async ({
  page,
}) => {
  const form = region(page)
  await form.getByRole('button', { name: 'A little about you', exact: true }).click()
  await expect(form.getByLabel('Give it a name')).toBeFocused()
  await expect(form.getByLabel('Give it a name')).toHaveAttribute('aria-invalid', 'true')
  await fillIdea(page)
  await form.getByRole('button', { name: 'Review your message' }).click()
  await expect(form.getByLabel('Your name', { exact: true })).toBeFocused()
  await fillPerson(page)
  await form.getByRole('button', { name: 'Back to the idea' }).click()
  await expect(form.getByLabel('Give it a name')).toHaveValue(idea.subject)
  await expect(form.getByLabel('Tell me a little more')).toHaveValue(idea.message)
  await form.getByRole('button', { name: 'A little about you', exact: true }).click()
  await expect(form.getByLabel('Your email', { exact: true })).toHaveValue('jamie@example.com')
})

test('attachments can be added and removed and invalid or oversized files are rejected', async ({
  page,
}) => {
  await fillIdea(page)
  const form = region(page),
    input = form.getByLabel('Select inquiry attachments')
  await input.setInputFiles([
    { name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from('A small project brief.') },
  ])
  await expect(form.getByRole('list', { name: 'Selected attachments' })).toContainText('brief.txt')
  await form.getByRole('button', { name: 'Remove brief.txt' }).click()
  await expect(form.getByRole('list', { name: 'Selected attachments' })).toHaveCount(0)
  await input.setInputFiles([
    { name: 'vector.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') },
  ])
  await expect(form.getByRole('alert')).toContainText('Use PDF')
  await input.setInputFiles([
    { name: 'large.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(2 * 1024 * 1024 + 1) },
  ])
  await expect(form.getByRole('alert')).toContainText('under 2 MB')
  await input.setInputFiles([
    {
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Useful context for this project.'),
    },
  ])
  await expect(form.getByRole('alert')).toHaveCount(0)
  await expect(form.getByRole('list', { name: 'Selected attachments' })).toContainText('notes.txt')
})

test('drag and drop adds real files and review displays the actual draft', async ({ page }) => {
  await fillIdea(page)
  await fillPerson(page)
  const form = region(page)
  const transfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['A reference note.'], 'reference.txt', { type: 'text/plain' }))
    return transfer
  })
  await form.locator('.inquiry-dropzone').dispatchEvent('dragenter', { dataTransfer: transfer })
  await expect(form.locator('.inquiry-dropzone')).toHaveClass(/is-dragging/)
  await form.locator('.inquiry-dropzone').dispatchEvent('drop', { dataTransfer: transfer })
  await expect(form.getByRole('list', { name: 'Selected attachments' })).toContainText(
    'reference.txt',
  )
  await form.getByRole('button', { name: 'Review your message' }).click()
  await expect(form.getByRole('heading', { name: 'One last look. Then, hello.' })).toBeFocused()
  await expect(form.locator('.inquiry-letter')).toContainText('jamie@example.com')
  await expect(form.locator('.inquiry-letter')).toContainText(idea.subject)
  await expect(form.getByLabel('Message preview')).toHaveText(idea.message)
  await expect(form.locator('.inquiry-enclosures')).toContainText('reference.txt')
})

test('an unsuccessful send keeps the draft, and a confirmed success shows the receipt', async ({
  page,
}) => {
  await observeAudio(page)
  expect(await audioState(page)).toEqual([])
  const form = region(page)
  await fillIdea(page)
  await fillPerson(page)
  await form
    .getByLabel('Select inquiry attachments')
    .setInputFiles([
      { name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from('My project brief.') },
    ])
  await form.getByRole('button', { name: 'Review your message' }).click()
  let requests = 0
  const ids: string[] = []
  await page.route('**/api/contact', async (route) => {
    requests++
    const payload = route.request().postDataBuffer()!.toString('utf8')
    expect(payload).toContain('jamie@example.com')
    expect(payload).toContain('brief.txt')
    expect(payload).toContain('My project brief.')
    ids.push(payload.match(/name="submissionId"\r\n\r\n([^\r]+)/)![1])
    await route.fulfill({
      status: requests === 1 ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        requests === 1
          ? { ok: false, message: 'That message could not be sent. Your draft is still here.' }
          : { ok: true, reference: ids[1] },
      ),
    })
  })
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(form.getByRole('alert')).toContainText('Your draft is still here')
  await expect(form.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled()
  await expect(form.locator('.inquiry-letter')).toContainText(idea.subject)
  await expect(form.locator('.inquiry-enclosures')).toContainText('brief.txt')
  const failureAudio = (await audioState(page))[0]
  expect(failureAudio.gesture).toBe(true)
  expect(failureAudio.notes).toHaveLength(6)
  expect(failureAudio.notes[3]).toBeLessThan(failureAudio.notes[0])
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(form.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
  await expect(form.getByRole('status')).toContainText('jamie@example.com')
  expect(ids[0]).toBe(ids[1])
  const successAudio = (await audioState(page))[0]
  expect(successAudio.notes).toHaveLength(15)
  expect(successAudio.notes[9]).toBeGreaterThan(successAudio.notes[6])
  expect(successAudio.notes[12]).toBeGreaterThan(successAudio.notes[9])
  await expect.poll(async () => (await audioState(page))[0].state).toBe('suspended')
  await form.getByRole('button', { name: 'Start another conversation' }).click()
  await expect(form.getByLabel('Give it a name')).toHaveValue('')
})

test('pending submission disables repeat sends until the server confirms it', async ({ page }) => {
  await observeAudio(page)
  const form = region(page)
  await fillIdea(page)
  await fillPerson(page)
  await form.getByRole('button', { name: 'Review your message' }).click()
  let complete: (() => void) | undefined
  let calls = 0
  await page.route('**/api/contact', async (route) => {
    calls++
    await new Promise<void>((resolve) => {
      complete = resolve
    })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, reference: '8fbb23d9-3551-42fe-b3b4-5a898e2e5d77' }),
    })
  })
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(form.getByRole('button', { name: 'Sending your message' })).toBeDisabled()
  await form.locator('form').evaluate((element) => (element as HTMLFormElement).requestSubmit())
  await expect.poll(() => calls).toBe(1)
  expect((await audioState(page))[0].notes).toHaveLength(0)
  complete!()
  await expect(form.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
  expect((await audioState(page))[0].notes).toHaveLength(9)
})

test('muting during a pending send suppresses the chime and remembers the choice across navigation', async ({
  page,
}) => {
  await observeAudio(page)
  const form = region(page)
  await fillIdea(page)
  await fillPerson(page)
  await form.getByRole('button', { name: 'Review your message' }).click()
  let complete: (() => void) | undefined
  await page.route('**/api/contact', async (route) => {
    await new Promise<void>((resolve) => {
      complete = resolve
    })
    await route.fulfill({ json: { ok: true, reference: '8fbb23d9-3551-42fe-b3b4-5a898e2e5d77' } })
  })
  await form.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(form.getByRole('button', { name: 'Sending your message' })).toBeDisabled()
  await expect.poll(() => Boolean(complete)).toBe(true)
  await form.getByRole('button', { name: 'Submission sounds' }).click()
  await expect(form.getByRole('button', { name: 'Submission sounds' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  complete!()
  await expect(form.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
  expect((await audioState(page))[0].notes).toHaveLength(0)
  await page.getByRole('link', { name: 'All projects', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio$/)
  // The contact form lives in the persistent site footer, so route changes keep
  // its existing context asleep and its mute preference intact.
  await expect.poll(async () => (await audioState(page))[0].state).toBe('suspended')
  await expect(region(page).getByRole('button', { name: 'Submission sounds' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await page.goto('/')
  await expect(region(page).getByRole('button', { name: 'Submission sounds' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(await audioState(page)).toEqual([])
})

for (const unavailable of ['missing', 'blocked'] as const) {
  test(`a ${unavailable} audio device never prevents a successful submission`, async ({ page }) => {
    await page.addInitScript((mode) => {
      if (mode === 'missing') {
        Object.defineProperty(window, 'AudioContext', { value: undefined })
        Object.defineProperty(window, 'webkitAudioContext', { value: undefined })
      } else {
        Object.defineProperty(window.AudioContext.prototype, 'state', { get: () => 'suspended' })
        window.AudioContext.prototype.resume = () =>
          Promise.reject(new DOMException('Blocked', 'NotAllowedError'))
      }
    }, unavailable)
    await page.reload()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await fillIdea(page)
    await fillPerson(page)
    const form = region(page)
    await form.getByRole('button', { name: 'Review your message' }).click()
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        json: { ok: true, reference: '8fbb23d9-3551-42fe-b3b4-5a898e2e5d77' },
      }),
    )
    await form.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(form.getByRole('heading', { name: 'Message sent.' })).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('small screens and reduced motion keep all steps usable without overflow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await fillIdea(page)
    await fillPerson(page)
    await region(page).getByRole('button', { name: 'Review your message' }).click()
    await expect(
      region(page).getByRole('button', { name: 'Send message', exact: true }),
    ).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(region(page).locator('.inquiry-panel')).toHaveCSS('transform', 'none')
  }
})

test('the real endpoint rejects cross-site, malformed, and forged attachment requests before delivery', async ({
  request,
  baseURL,
}) => {
  const form = {
    name: 'Jamie',
    email: 'jamie@example.com',
    subject: 'A new idea',
    message: 'A proper inquiry for a creative project.',
    submissionId: '8fbb23d9-3551-42fe-b3b4-5a898e2e5d77',
  }
  let response = await request.post('/api/contact', {
    headers: { Origin: 'https://unrelated.example' },
    multipart: form,
  })
  expect(response.status()).toBe(403)
  response = await request.post('/api/contact', { headers: { Origin: baseURL! }, data: form })
  expect(response.status()).toBe(415)
  response = await request.post('/api/contact', {
    headers: { Origin: baseURL! },
    multipart: { ...form, email: 'bad', subject: '' },
  })
  expect(response.status()).toBe(400)
  expect((await response.json()).fields.email).toBeTruthy()
  response = await request.post('/api/contact', {
    headers: { Origin: baseURL! },
    multipart: {
      ...form,
      attachments: {
        name: 'forged.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('This is not a PDF.'),
      },
    },
  })
  expect(response.status()).toBe(400)
  expect((await response.json()).fields.attachments).toBeTruthy()
  response = await request.post('/api/contact', {
    headers: { Origin: baseURL! },
    multipart: { ...form, website: 'a bot trap' },
  })
  expect(response.status()).toBe(400)
})
