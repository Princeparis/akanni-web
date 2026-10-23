import { test, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { renderInquiryEmail } from '../../src/emails/render-inquiry'
import { emailBrandAttachments } from '../../src/emails/brand'
import type { Inquiry } from '../../src/lib/contact'

const inquiry: Inquiry = {
  name: 'Ada Mensah',
  email: 'ada@example.com',
  company: 'Form & Field',
  topic: 'A website',
  subject: 'An independent studio, in motion.',
  message:
    'Hi Ridwan,\n\nWe’re building a digital home for a small, ambitious architecture studio. We want the experience to feel considered, tactile, and quietly surprising.\n\nWould you be open to talking about the identity and website together?\n\nThanks,\nAda',
}
const files = ['Project brief.pdf', 'Moodboard references.png']
const reference = 'eaef217a-032f-4d5a-ae3f-1bd8ebda7da1'
const payload = { inquiry, files, reference }

function preview(html: string) {
  for (const asset of emailBrandAttachments())
    html = html.replaceAll(
      `cid:${asset.cid}`,
      `data:image/png;base64,${asset.content.toString('base64')}`,
    )
  return html
}

test('email embeds the official brand as real PNGs, uses pale lavender, and exposes one clear reply action', async ({
  page,
}) => {
  const html = await renderInquiryEmail(payload)
  expect(html).toContain('<!--[if mso]>')
  expect(html).not.toMatch(/<svg\b|<script\b|src="https?:|#d9fe62|#dfff45/i)
  expect(html).toContain('#ded4ff')
  const assets = emailBrandAttachments()
  expect(assets).toHaveLength(2)
  for (const asset of assets) {
    expect(html).toContain(`src="cid:${asset.cid}"`)
    expect(asset.contentDisposition).toBe('inline')
    expect(asset.contentType).toBe('image/png')
    const image = sharp(asset.content)
    expect((await image.metadata()).format).toBe('png')
    expect((await image.stats()).channels.some((channel) => channel.stdev > 20)).toBe(true)
  }
  await page.setContent(preview(html))
  await expect(page.getByRole('img', { name: 'Rayab', exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Rayab', exact: true })
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBe(864)
  await expect(page.getByRole('heading', { name: inquiry.subject, exact: true })).toBeVisible()
  await expect(page.locator('[data-email-message]')).toHaveText(inquiry.message, {
    useInnerText: true,
  })
  const reply = new URL(
    (await page.getByRole('link', { name: 'Reply to Ada', exact: true }).getAttribute('href'))!,
  )
  expect(decodeURIComponent(reply.pathname)).toBe(inquiry.email)
  expect(reply.searchParams.get('subject')).toBe(`Re: ${inquiry.subject}`)
  await expect(page.getByText('Enclosed / 02 files')).toBeVisible()
})

test('email fills phone and tablet widths, uses desktop margins, and generates reviewable previews', async ({
  page,
}) => {
  const html = preview(await renderInquiryEmail(payload))
  await mkdir('artifacts/email', { recursive: true })
  await writeFile('artifacts/email/inquiry.html', html)
  for (const width of [320, 390, 520, 680, 768, 844, 932, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1100 })
    await page.setContent(html)
    const box = (await page.locator('.email-container').boundingBox())!
    if (width <= 1024) {
      expect(box.x).toBe(0)
      expect(box.width).toBe(width)
    } else {
      expect(box.width).toBe(640)
      expect(Math.abs(box.x - (width - 640) / 2)).toBeLessThan(1)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `artifacts/email/${width === 390 ? 'mobile' : 'desktop'}.png`,
        fullPage: true,
      })
  }
})

test('long subjects, messages and filenames wrap without overflowing small inboxes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  const long = {
    ...inquiry,
    name: 'A'.repeat(80),
    company: 'C'.repeat(100),
    subject: 'S'.repeat(120),
    email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.example`,
    message: 'M'.repeat(6000),
  }
  await page.setContent(
    preview(
      await renderInquiryEmail({
        inquiry: long,
        files: ['A'.repeat(145) + '.pdf', 'B'.repeat(145) + '.png', 'C'.repeat(145) + '.txt'],
        reference,
      }),
    ),
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.locator('[data-email-message]')).toHaveText(long.message)
  await expect(page.getByRole('heading', { name: long.subject, exact: true })).toBeVisible()
})

test('content remains safe and readable without images or optional head CSS', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  const unsafe =
    '<img src="https://attacker.example/pixel" onerror="alert(1)"><script>unsafe</script>'
  const html = await renderInquiryEmail({
    inquiry: { ...inquiry, message: unsafe },
    files: [],
    reference,
  })
  expect(html).toContain('&lt;script&gt;unsafe&lt;/script&gt;')
  expect(html).not.toContain('<script>unsafe</script>')
  await page.setContent(html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<img\b[^>]*>/g, ''))
  await expect(page.locator('script')).toHaveCount(0)
  await expect(page.locator('[data-email-message]')).toHaveText(unsafe)
  await expect(page.getByText('Yusuff Ridwan Akanni', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Reply to Ada', exact: true })).toBeVisible()
  await expect(page.getByText('Enclosed', { exact: false })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
