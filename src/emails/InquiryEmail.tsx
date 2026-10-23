/* eslint-disable @next/next/no-head-element -- This is a complete email document, not a Next.js page. */
import { CONTACT_EMAIL, type Inquiry } from '@/lib/contact'

export default function InquiryEmail({
  inquiry,
  files,
  reference,
}: {
  inquiry: Inquiry
  files: string[]
  reference: string
}) {
  const label = {
    color: '#888b7e',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 10px',
  }
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{inquiry.subject}</title>
      </head>
      <body
        style={{
          backgroundColor: '#f3f3ee',
          color: '#171912',
          fontFamily: 'Arial, Helvetica, sans-serif',
          margin: 0,
          padding: '32px 12px',
        }}
      >
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0 }}>
          A new conversation from {inquiry.name}: {inquiry.subject}
        </div>
        <table
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          style={{ width: '100%', maxWidth: '620px', margin: '0 auto', backgroundColor: '#fff' }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: '28px 32px',
                  backgroundColor: '#d9fe62',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}
              >
                RAYAB / OPEN LINE
              </td>
            </tr>
            <tr>
              <td style={{ padding: '36px 32px 24px' }}>
                <p style={label}>A new conversation</p>
                <h1
                  style={{
                    fontSize: '32px',
                    letterSpacing: '-1px',
                    lineHeight: '1.15',
                    margin: '0 0 24px',
                  }}
                >
                  {inquiry.subject}
                </h1>
                <p style={{ fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
                  <strong>{inquiry.name}</strong>
                  {inquiry.company ? ` · ${inquiry.company}` : ''}
                  <br />
                  <a href={`mailto:${inquiry.email}`} style={{ color: '#22281a' }}>
                    {inquiry.email}
                  </a>
                  <br />
                  {inquiry.topic || 'General inquiry'}
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0 32px 32px' }}>
                <div
                  style={{
                    borderTop: '1px solid #e5e7dc',
                    paddingTop: '24px',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {inquiry.message}
                </div>
              </td>
            </tr>
            {files.length > 0 && (
              <tr>
                <td style={{ padding: '0 32px 32px' }}>
                  <p style={label}>Attached to this conversation</p>
                  {files.map((file, index) => (
                    <p key={index} style={{ margin: '6px 0', fontSize: '13px' }}>
                      ↳ {file}
                    </p>
                  ))}
                </td>
              </tr>
            )}
            <tr>
              <td
                style={{
                  padding: '24px 32px',
                  backgroundColor: '#f4f5ef',
                  fontSize: '12px',
                  lineHeight: '1.8',
                  color: '#65695c',
                }}
              >
                Reply to this email to write directly to {inquiry.name}.<br />
                Sent to {CONTACT_EMAIL} from your portfolio’s contact form.
                <br />
                <span style={{ fontSize: '10px' }}>Reference {reference}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
