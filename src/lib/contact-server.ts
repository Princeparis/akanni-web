import { createHash } from 'node:crypto'
import nodemailer from 'nodemailer'
import { renderInquiryEmail } from '@/emails/render-inquiry'
import { emailBrandAttachments } from '@/emails/brand'
import {
  CONTACT_EMAIL,
  MAX_TOTAL_BYTES,
  validateAttachmentList,
  validateInquiry,
  type Inquiry,
} from './contact'

const REQUEST_LIMIT = MAX_TOTAL_BYTES + 64 * 1024
const WINDOW = 15 * 60 * 1000
const attempts = new Map<string, { start: number; count: number }>()
const deliveries = new Map<
  string,
  { fingerprint: string; time: number; delivery: Promise<string> }
>()

export class ContactError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message)
  }
}

function consumeLimit(ip: string) {
  const now = Date.now()
  for (const [key, value] of attempts) if (now - value.start > WINDOW) attempts.delete(key)
  if (attempts.size > 1000) attempts.delete(attempts.keys().next().value!)
  const entry = attempts.get(ip)
  if (entry && entry.count >= 5)
    throw new ContactError(
      429,
      'A few too many messages at once. Please try again in 15 minutes, or use the email link.',
    )
  attempts.set(ip, entry ? { ...entry, count: entry.count + 1 } : { start: now, count: 1 })
}

async function boundedForm(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;'))
    throw new ContactError(415, 'Please submit the contact form with its attachments.')
  if (Number(request.headers.get('content-length')) > REQUEST_LIMIT)
    throw new ContactError(413, 'That message is too large. Keep attachments together under 3 MB.')
  if (!request.body) throw new ContactError(400, 'Your message was empty.')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new ContactError(408, 'The upload took too long. Please try again.'))
        void reader.cancel()
      }, 15000)
    })
    while (true) {
      const chunk = await Promise.race([reader.read(), timeout])
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > REQUEST_LIMIT) {
        await reader.cancel()
        throw new ContactError(
          413,
          'That message is too large. Keep attachments together under 3 MB.',
        )
      }
      chunks.push(chunk.value)
    }
    const body = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }
    return await new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': request.headers.get('content-type')! },
      body,
    }).formData()
  } catch (error) {
    if (error instanceof ContactError) throw error
    throw new ContactError(400, 'The upload could not be read. Please select your files again.')
  } finally {
    clearTimeout(timer)
    reader.releaseLock()
  }
}

function attachmentType(file: File, bytes: Buffer) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf' && bytes.subarray(0, 5).toString() === '%PDF-') return 'application/pdf'
  if (ext === 'png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return 'image/png'
  if ((ext === 'jpg' || ext === 'jpeg') && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return 'image/jpeg'
  if (
    ext === 'webp' &&
    bytes.subarray(0, 4).toString() === 'RIFF' &&
    bytes.subarray(8, 12).toString() === 'WEBP'
  )
    return 'image/webp'
  if (ext === 'txt') {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      if (!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) return 'text/plain'
    } catch {
      /* Binary data is not a text attachment. */
    }
  }
  throw new ContactError(
    400,
    'One attachment does not match its file type. Please use an original PDF, image, or text file.',
    { attachments: 'One attachment does not match its file type.' },
  )
}

export async function handleContact(request: Request) {
  const origin = request.headers.get('origin')
  // Next can reconstruct request.url with an internal hostname. Match the real
  // request authority instead; browser JavaScript cannot forge its Host header.
  const url = new URL(request.url)
  const protocol =
    request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || url.protocol.slice(0, -1)
  const authority = request.headers.get('host') || url.host
  let expectedOrigin = ''
  try {
    expectedOrigin = new URL(`${protocol}://${authority}`).origin
  } catch {
    /* Reject an invalid authority. */
  }
  if (
    !origin ||
    origin !== expectedOrigin ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new ContactError(403, 'Please send your message from this website.')
  const form = await boundedForm(request)
  if (form.get('website'))
    throw new ContactError(
      400,
      'The form could not be submitted. Please use the email link instead.',
    )
  const fields = ['name', 'email', 'company', 'subject', 'message', 'topic'] as const
  const inquiry = Object.fromEntries(
    fields.map((field) => [
      field,
      typeof form.get(field) === 'string' ? String(form.get(field)).trim() : '',
    ]),
  ) as Inquiry
  const errors = validateInquiry(inquiry)
  if (Object.keys(errors).length)
    throw new ContactError(400, 'Check the highlighted fields and try again.', errors)
  const submissionId = form.get('submissionId')
  if (
    typeof submissionId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)
  )
    throw new ContactError(400, 'Please refresh the page before sending your message.')
  const uploads = form.getAll('attachments')
  if (uploads.some((value) => !(value instanceof File)))
    throw new ContactError(400, 'Please select your attachments again.')
  const files = uploads as File[]
  const fileError = validateAttachmentList(files)
  if (fileError) throw new ContactError(400, fileError, { attachments: fileError })
  const attachments = await Promise.all(
    files.map(async (file) => {
      const content = Buffer.from(await file.arrayBuffer())
      const contentType = attachmentType(file, content)
      const filename = file.name
        .normalize('NFKC')
        .replace(/[\x00-\x1f\x7f/\\\u202a-\u202e\u2066-\u2069]/g, '_')
        .slice(-150)
      return { filename, content, contentType }
    }),
  )
  const password = process.env.SMTP_PASSWORD?.replace(/\s/g, '')
  const user = process.env.SMTP_USER || CONTACT_EMAIL
  if (!password || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(user))
    throw new ContactError(
      503,
      'I couldn’t send that just now. Your draft is still here—please try again later or use the email link.',
    )

  const fingerprint = createHash('sha256').update(JSON.stringify(inquiry))
  for (const file of attachments)
    fingerprint.update(JSON.stringify([file.filename, file.content.length])).update(file.content)
  const digest = fingerprint.digest('hex')
  const now = Date.now()
  for (const [key, entry] of deliveries) if (now - entry.time > WINDOW) deliveries.delete(key)
  const existing = deliveries.get(submissionId)
  if (existing) {
    if (existing.fingerprint !== digest)
      throw new ContactError(409, 'Your draft changed. Please try sending it again.')
    try {
      return { reference: await existing.delivery }
    } catch {
      throw new ContactError(
        502,
        'I couldn’t send that just now. Your draft is still here—please try again or use the email link.',
      )
    }
  }
  consumeLimit(
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'local',
  )
  if (deliveries.size >= 1000)
    throw new ContactError(
      429,
      'The mailbox is busy. Please try again shortly, or use the email link.',
    )
  const delivery = (async () => {
    const html = await renderInquiryEmail({
      inquiry,
      files: attachments.map((file) => file.filename),
      reference: submissionId,
    })
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user, pass: password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    })
    try {
      const result = await transport.sendMail({
        from: { name: 'Rayab / Open line', address: user },
        to: CONTACT_EMAIL,
        replyTo: { name: inquiry.name, address: inquiry.email },
        subject: `[Rayab] ${inquiry.subject}`,
        messageId: `<inquiry.${submissionId}@${user.split('@')[1]}>`,
        html,
        text: [
          'RAYAB / OPEN LINE',
          'Strategy. Craft. Software.',
          '',
          `New inquiry from ${inquiry.name}${inquiry.company ? ` / ${inquiry.company}` : ''}`,
          `Reply to: ${inquiry.email}`,
          `Topic: ${inquiry.topic || 'General inquiry'}`,
          `Subject: ${inquiry.subject}`,
          '',
          inquiry.message,
          '',
          `Attachments: ${attachments.map((file) => file.filename).join(', ') || 'None'}`,
          `Reference: ${submissionId}`,
          '',
          `Reply directly to this email to write to ${inquiry.name}.`,
          'Yusuff Ridwan Akanni / Creative engineer & director',
        ].join('\n'),
        attachments: [...emailBrandAttachments(), ...attachments],
      })
      if (
        !result.accepted.some(
          (address) => typeof address === 'string' && address.toLowerCase() === CONTACT_EMAIL,
        )
      )
        throw new Error('Recipient not accepted')
      return submissionId
    } finally {
      transport.close()
    }
  })()
  deliveries.set(submissionId, { fingerprint: digest, time: now, delivery })
  try {
    return { reference: await delivery }
  } catch (error) {
    deliveries.delete(submissionId)
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
    console.error(
      '[contact] SMTP delivery failed:',
      /^[A-Z_]{2,40}$/.test(code) ? code : 'DELIVERY_FAILED',
    )
    throw new ContactError(
      502,
      'I couldn’t send that just now. Your draft is still here—please try again or use the email link.',
    )
  }
}
