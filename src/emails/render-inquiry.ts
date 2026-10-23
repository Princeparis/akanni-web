import { createElement } from 'react'
import { render } from '@react-email/render'
import InquiryEmail from './InquiryEmail'

export async function renderInquiryEmail(props: Parameters<typeof InquiryEmail>[0]) {
  const html = await render(createElement(InquiryEmail, props))
  // Classic Windows Outlook ignores max-width. Its conditional wrapper keeps
  // desktop line lengths bounded; mobile/web clients ignore these comments.
  return html
    .replace(
      /(<body\b[^>]*>)/i,
      '$1<!--[if mso]><table role="presentation" align="center" width="640" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->',
    )
    .replace('</body>', '<!--[if mso]></td></tr></table><![endif]--></body>')
}
