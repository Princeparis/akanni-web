import { EMAIL_BRAND } from './brand-assets.generated'

export const EMAIL_LOGO_SRC = `cid:${EMAIL_BRAND.wordmark.cid}`
export const EMAIL_MARK_SRC = `cid:${EMAIL_BRAND.mark.cid}`

export function emailBrandAttachments() {
  return Object.entries(EMAIL_BRAND).map(([name, asset]) => ({
    filename: `rayab-${name}.png`,
    content: Buffer.from(asset.base64, 'base64'),
    contentType: 'image/png',
    contentDisposition: 'inline' as const,
    cid: asset.cid,
  }))
}
