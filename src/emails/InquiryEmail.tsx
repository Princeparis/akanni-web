/* eslint-disable @next/next/no-head-element, @next/next/no-img-element -- An email document with MIME-embedded CID images, not a Next.js page. */
import React, { type CSSProperties } from 'react'
import { CONTACT_EMAIL, type Inquiry } from '@/lib/contact'
import { EMAIL_LOGO_SRC, EMAIL_MARK_SRC } from './brand'

const ink = '#10110c'
const paper = '#f7f6ed'
const accent = '#ded4ff'
const muted = '#65635f'
const font = 'Arial, Helvetica, sans-serif'
const label: CSSProperties = {
  fontSize: '10px',
  lineHeight: '16px',
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '1.4px',
  margin: 0,
}
const wrap: CSSProperties = { wordBreak: 'break-word', overflowWrap: 'anywhere' }
const table: CSSProperties = { borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }

export default function InquiryEmail({
  inquiry,
  files,
  reference,
}: {
  inquiry: Inquiry
  files: string[]
  reference: string
}) {
  const firstName = inquiry.name.trim().split(/\s+/)[0]
  const reply = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`
  const messageLines = inquiry.message.split(/\r?\n/)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{`${inquiry.subject} — Rayab / Open line`}</title>
        <style>{`
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
          a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
          @media screen and (max-width: 1024px) {
            .email-shell { padding: 0 !important; }
            .email-container { max-width: 100% !important; width: 100% !important; }
            .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
            .email-hero { font-size: 46px !important; line-height: 47px !important; letter-spacing: -2px !important; }
            .email-subject { font-size: 28px !important; line-height: 34px !important; }
          }
          @media screen and (max-width: 360px) {
            .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .email-hero { font-size: 40px !important; line-height: 42px !important; }
          }
        `}</style>
      </head>
      <body
        style={{ margin: 0, padding: 0, backgroundColor: '#e9e8e3', color: ink, fontFamily: font }}
      >
        <div
          style={
            {
              display: 'none',
              maxHeight: 0,
              overflow: 'hidden',
              opacity: 0,
              fontSize: '1px',
              lineHeight: '1px',
              msoHide: 'all',
            } as CSSProperties
          }
        >
          {inquiry.name}
          {inquiry.company ? ` / ${inquiry.company}` : ''} has an idea: {inquiry.subject}. A new
          conversation through Rayab.
        </div>
        <table
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ ...table, backgroundColor: '#e9e8e3' }}
        >
          <tbody>
            <tr>
              <td align="center" className="email-shell" style={{ padding: '40px 0' }}>
                <table
                  role="presentation"
                  cellPadding="0"
                  cellSpacing="0"
                  width="640"
                  className="email-container"
                  style={{ ...table, maxWidth: '640px', margin: '0 auto', backgroundColor: paper }}
                >
                  <tbody>
                    <tr>
                      <td
                        height="6"
                        style={{ backgroundColor: accent, fontSize: 0, lineHeight: '6px' }}
                      >
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '36px 36px 32px', backgroundColor: ink }}
                      >
                        <img
                          src={EMAIL_LOGO_SRC}
                          width="216"
                          height="40"
                          alt="Rayab"
                          style={{
                            display: 'block',
                            width: '216px',
                            height: '40px',
                            maxWidth: '100%',
                            color: paper,
                            fontSize: '28px',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '0 36px 36px', backgroundColor: ink, color: paper }}
                      >
                        <p style={{ ...label, color: accent, marginBottom: '20px' }}>
                          01 / Open line / A new inquiry
                        </p>
                        <h1
                          className="email-hero"
                          style={{
                            fontSize: '58px',
                            lineHeight: '59px',
                            fontWeight: 400,
                            letterSpacing: '-2.9px',
                            margin: '0 0 24px',
                            color: paper,
                          }}
                        >
                          A new
                          <br />
                          conversation.
                        </h1>
                        <p
                          style={{
                            ...wrap,
                            fontSize: '14px',
                            lineHeight: '23px',
                            color: '#c7c7be',
                            margin: 0,
                          }}
                        >
                          Good things start with a conversation.
                          <br />
                          This one starts with {inquiry.name}.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '17px 36px', backgroundColor: accent, color: ink }}
                      >
                        <p style={{ ...label, color: ink, letterSpacing: '1px' }}>
                          For Yusuff Ridwan Akanni / Creative engineer &amp; director
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '34px 36px 26px', backgroundColor: paper }}
                      >
                        <p style={{ ...label, color: muted, marginBottom: '12px' }}>
                          {inquiry.topic || 'A new idea'} / Subject
                        </p>
                        <h2
                          className="email-subject"
                          style={{
                            ...wrap,
                            fontSize: '34px',
                            lineHeight: '40px',
                            letterSpacing: '-1.2px',
                            fontWeight: 400,
                            margin: '0 0 28px',
                            color: ink,
                          }}
                        >
                          {inquiry.subject}
                        </h2>
                        <table
                          role="presentation"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            ...table,
                            borderTop: '1px solid #d9d7ce',
                            borderBottom: '1px solid #d9d7ce',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 0' }}>
                                <p style={{ ...label, color: muted, marginBottom: '7px' }}>
                                  On the other side
                                </p>
                                <p
                                  style={{
                                    ...wrap,
                                    fontSize: '17px',
                                    lineHeight: '25px',
                                    color: ink,
                                    margin: '0 0 2px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {inquiry.name}
                                </p>
                                {inquiry.company && (
                                  <p
                                    style={{
                                      ...wrap,
                                      fontSize: '14px',
                                      lineHeight: '22px',
                                      color: muted,
                                      margin: '0 0 6px',
                                    }}
                                  >
                                    {inquiry.company}
                                  </p>
                                )}
                                <a
                                  href={reply}
                                  style={{
                                    ...wrap,
                                    fontSize: '14px',
                                    lineHeight: '22px',
                                    color: ink,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                  }}
                                >
                                  {inquiry.email}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '0 36px 32px', backgroundColor: paper }}
                      >
                        <p style={{ ...label, color: muted, marginBottom: '14px' }}>
                          In their own words
                        </p>
                        <div
                          data-email-message
                          style={{
                            ...wrap,
                            fontSize: '16px',
                            lineHeight: '28px',
                            color: '#30322c',
                            margin: 0,
                          }}
                        >
                          {messageLines.map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              {index < messageLines.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {files.length > 0 && (
                      <tr>
                        <td
                          className="email-pad"
                          style={{ padding: '0 36px 30px', backgroundColor: paper }}
                        >
                          <table
                            role="presentation"
                            cellPadding="0"
                            cellSpacing="0"
                            style={{ ...table, borderTop: '1px solid #d9d7ce' }}
                          >
                            <colgroup>
                              <col style={{ width: '54px' }} />
                              <col />
                            </colgroup>
                            <tbody>
                              <tr>
                                <td colSpan={2} style={{ padding: '22px 0 10px' }}>
                                  <p style={{ ...label, color: muted }}>
                                    Enclosed / {String(files.length).padStart(2, '0')}{' '}
                                    {files.length === 1 ? 'file' : 'files'}
                                  </p>
                                </td>
                              </tr>
                              {files.map((file, index) => (
                                <tr key={index}>
                                  <td
                                    width="54"
                                    style={{
                                      width: '54px',
                                      padding: '12px 10px 12px 0',
                                      borderBottom: '1px solid #e0dfd8',
                                      verticalAlign: 'top',
                                    }}
                                  >
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        backgroundColor: '#eae4f6',
                                        padding: '5px 7px',
                                        fontSize: '9px',
                                        lineHeight: '13px',
                                        color: ink,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {file.split('.').pop()?.slice(0, 6).toUpperCase() || 'FILE'}
                                    </span>
                                  </td>
                                  <td
                                    style={{
                                      ...wrap,
                                      padding: '14px 0',
                                      borderBottom: '1px solid #e0dfd8',
                                      fontSize: '13px',
                                      lineHeight: '20px',
                                      color: ink,
                                    }}
                                  >
                                    {file}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '0 36px 36px', backgroundColor: paper }}
                      >
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={table}>
                          <tbody>
                            <tr>
                              <td
                                align="center"
                                style={{ backgroundColor: accent, padding: '18px 20px' }}
                              >
                                <a
                                  href={reply}
                                  style={{
                                    ...wrap,
                                    display: 'block',
                                    color: ink,
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    lineHeight: '22px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Reply to {firstName}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p
                          style={{
                            ...wrap,
                            fontSize: '11px',
                            lineHeight: '18px',
                            color: muted,
                            margin: '13px 0 0',
                          }}
                        >
                          Or simply hit Reply. Your response goes directly to {inquiry.name}.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{ padding: '29px 36px', backgroundColor: ink, color: paper }}
                      >
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={table}>
                          <tbody>
                            <tr>
                              <td
                                width="46"
                                style={{
                                  width: '46px',
                                  paddingRight: '14px',
                                  verticalAlign: 'top',
                                }}
                              >
                                <img
                                  src={EMAIL_MARK_SRC}
                                  width="32"
                                  height="32"
                                  alt=""
                                  style={{
                                    display: 'block',
                                    width: '32px',
                                    height: '32px',
                                    color: paper,
                                  }}
                                />
                              </td>
                              <td style={{ verticalAlign: 'top' }}>
                                <p
                                  style={{
                                    ...wrap,
                                    fontSize: '14px',
                                    lineHeight: '22px',
                                    margin: 0,
                                    color: paper,
                                  }}
                                >
                                  Yusuff Ridwan Akanni
                                </p>
                                <p
                                  style={{
                                    fontSize: '11px',
                                    lineHeight: '18px',
                                    margin: '3px 0 9px',
                                    color: '#bcbdb4',
                                  }}
                                >
                                  Creative engineer &amp; director
                                </p>
                                <p
                                  style={{
                                    ...label,
                                    fontSize: '9px',
                                    letterSpacing: '1px',
                                    margin: 0,
                                    color: accent,
                                  }}
                                >
                                  Strategy. Craft. Software.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="email-pad"
                        style={{
                          padding: '22px 36px 26px',
                          backgroundColor: '#e7e3ed',
                          color: '#5b5663',
                        }}
                      >
                        <p style={{ fontSize: '10px', lineHeight: '17px', margin: 0 }}>
                          From the contact form on your Rayab portfolio.
                          <br />
                          Delivered to{' '}
                          <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            style={{ color: '#5b5663', textDecoration: 'none' }}
                          >
                            {CONTACT_EMAIL}
                          </a>
                          .
                        </p>
                        <p
                          style={{
                            ...wrap,
                            fontSize: '9px',
                            lineHeight: '16px',
                            margin: '11px 0 0',
                            color: '#696371',
                          }}
                        >
                          Conversation ref. {reference}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
