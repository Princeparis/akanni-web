export const CONTACT_EMAIL = 'wemzain@gmail.com'
export const CONTACT_TOPICS = [
  'A digital product',
  'A brand identity',
  'A website',
  'Something else',
] as const
export const MAX_FILES = 3
export const MAX_FILE_BYTES = 2 * 1024 * 1024
export const MAX_TOTAL_BYTES = 3 * 1024 * 1024
export const ATTACHMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.txt'
export const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'])
export type Inquiry = {
  name: string
  email: string
  company: string
  subject: string
  message: string
  topic: string
}
export type InquiryErrors = Partial<Record<keyof Inquiry | 'attachments', string>>
export const EMPTY_INQUIRY: Inquiry = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
  topic: '',
}

export function validateInquiry(values: Inquiry): InquiryErrors {
  const errors: InquiryErrors = {}
  if (!values.subject.trim() || values.subject.trim().length > 120 || /[\r\n]/.test(values.subject))
    errors.subject = 'Give your message a subject, up to 120 characters.'
  if (values.message.trim().length < 10 || values.message.length > 6000)
    errors.message = 'Tell me a little more—between 10 and 6,000 characters.'
  if (!values.name.trim() || values.name.trim().length > 80 || /[\r\n]/.test(values.name))
    errors.name = 'Add your name, up to 80 characters.'
  if (
    !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(values.email.trim()) ||
    values.email.length > 254
  )
    errors.email = 'Add an email address I can reply to.'
  if (values.company.length > 100 || /[\r\n]/.test(values.company))
    errors.company = 'Keep the company name under 100 characters.'
  if (values.topic && !(CONTACT_TOPICS as readonly string[]).includes(values.topic))
    errors.topic = 'Choose one of the project types.'
  return errors
}

export function validateAttachmentList(files: Pick<File, 'name' | 'size'>[]) {
  if (files.length > MAX_FILES) return 'Up to 3 files, please. Remove one before adding another.'
  if (
    files.some((file) => !ALLOWED_EXTENSIONS.has(file.name.split('.').pop()?.toLowerCase() || ''))
  )
    return 'Use PDF, JPG, PNG, WebP, or plain text files.'
  if (files.some((file) => file.size === 0)) return 'One of those files is empty. Try another copy.'
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return 'Keep each file under 2 MB.'
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES)
    return 'Keep all attachments together under 3 MB.'
  return null
}

export function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.ceil(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
