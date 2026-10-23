# Contact: Open line

The contact address is `wemzain@gmail.com`, shared by the footer, copy control, navigation menu, and server-side recipient. The contact section remains on the existing lime footer. Its dark, cut-corner composer moves through the idea, sender details and attachments, then a letter-style review. Drafts stay in component memory through edits and failed requests; no browser storage or analytics receives their contents.

## Straight through Gmail

Nodemailer connects to Gmail over certificate-verified SMTPS on port 465. The email is rendered locally with the maintained `@react-email/render` package using a React template and email-compatible inline styles. No Resend service, account, API key, or verified custom domain is involved. The deprecated React Email component bundle is not installed.

The message now uses the official Rayab artwork as inline CID PNGs, an ink/paper layout with pale lavender accents, full-width mobile sections, a personal signature and a clear reply action. Sender branding is `Rayab / Open line` with a `[Rayab]` subject prefix. See [Email identity](email-identity.md) for design references, image embedding, responsive behavior and verification.

To enable actual inbox delivery:

1. Enable **2-Step Verification** for the Google account `wemzain@gmail.com`.
2. Create an **App Password** at [Google App Passwords](https://myaccount.google.com/apppasswords). Some managed or restricted Google accounts do not offer App Passwords; those accounts need a supported OAuth2 setup instead.
3. In the hosting project's secure environment settings (for example, Vercel's server environment variables), set `SMTP_PASSWORD` to that App Password. Do not use the normal account password, put credentials in chat/source control, or expose this variable with `NEXT_PUBLIC_`.
4. `SMTP_USER` defaults to `wemzain@gmail.com`; set it explicitly if desired. `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465` are already defaults. The transport always requires direct TLS and preserves certificate verification.
5. Redeploy or restart the Node server to load the credential, then send an inquiry and check Inbox/Spam. Google can restrict sign-ins or apply account sending limits. An SMTP acceptance confirms submission to the mail service, not final inbox placement.

For local development, use an ignored `.env.local`. Secrets sent through an HTTPS proxy do not provide a raw password to an SMTP transport; this cloud environment's proxy-secret bindings are therefore not a substitute for the server's secure runtime variable. Runtime name/presence and environment metadata were checked before requesting credentials; no SMTP credential was present. This cloud machine also returned `EAI_AGAIN` resolving `smtp.gmail.com`, so direct Gmail connectivity and authenticated inbox delivery have not been verified here.

The public address and mailto/copy controls work without SMTP configuration. The form returns an honest 503 when sending is unconfigured, preserves the draft, and provides a direct email link. It never displays a success receipt just because a button was clicked.

## Message and attachment behavior

- Required: name, reply email, subject, and message. Company and project type are optional.
- Every message goes to the fixed server-side address `wemzain@gmail.com`. The authenticated account is the sender; the visitor is `Reply-To`, so replies go directly to them. The client cannot set recipients, CC, BCC, or sender identity.
- The email includes escaped React HTML, a plain-text alternative, and attachments. No automatic reply is sent to an unverified visitor address.
- Up to three PDF, JPG/JPEG, PNG, WebP, or UTF-8 text files. Each file is limited to 2 MiB and all attachments together to 3 MiB, leaving room below Vercel's request-body limit. The UI rounds these limits to MB.
- The server bounds raw request bytes before multipart parsing, validates file signatures/content and extensions, normalizes filenames, and forwards buffers as attachments. It does not extract archives, execute uploads, save public files, or read attachment URLs/paths. File checks are format checks, not an antivirus scan.
- Requests must originate from the same site. Input bounds, header-injection checks, a honeypot, and per-process throttling (five valid send attempts per IP per 15 minutes) reduce abuse. Proxy IP headers must be supplied/overwritten by the hosting proxy. For distributed serverless deployment these in-memory limits are best effort; use hosting firewall/rate rules if stronger shared enforcement is needed.
- An unchanged retry uses the same draft ID and a payload fingerprint. In-flight/successful sends are deduplicated within the warm process for 15 minutes. Edits generate a new ID. A stable MIME Message-ID also identifies the message. SMTP does not offer global exactly-once delivery: cold-instance/network ambiguity can still produce duplicates.
- SMTP errors, upload problems, timeouts, and unconfigured delivery return failure responses; only an accepted fixed recipient produces the receipt. Logs contain only SMTP error codes, never message text, attachments, or credentials.

## Verify without emailing anyone

Use Node 22 and the pinned pnpm. Run normal lint/type checks and a production build, then:

```sh
corepack pnpm@9.8.0 test:contact:delivery
```

`scripts/verify-contact.mjs` generates a one-day local TLS certificate, adds that certificate as a trusted CA **only for its application subprocess**, and starts a local SMTPS mailbox. All SMTP host, user, and password values are overridden with explicit local test fixtures. It verifies the actual production route, Nodemailer authentication and transmission, fixed envelope recipient, reply-to header, HTML/plain text, escaped content, attachment bytes, retry handling, rejected files, simulated SMTP failure/retry, throttling, and missing credentials. It does not disable TLS checks, contact Gmail, or deliver messages off this machine. It removes its temporary files and stops its servers when done. OpenSSL must be installed for this check.

`tests/e2e/contact.spec.ts` covers the interactive steps, validation/focus, email controls, attachments, drag/drop, review, pending/failed/confirmed UI states, repeat-send prevention, responsive reduced motion, and API input rejection. UI send-response tests use intercepted responses; they do not prove Gmail delivery. Successful delivery is separately exercised through the local TLS mailbox above.

## Source map

- `src/lib/contact.ts`: shared address, schema limits, client/server validation.
- `src/components/ContactForm.tsx` and `contact-form.css`: accessible composer, files, draft review, feedback and responsive motion.
- `src/emails/InquiryEmail.tsx`: local React email document.
- `src/lib/contact-server.ts`: bounded multipart parsing, format checks, throttling/deduplication and SMTPS delivery.
- `src/app/api/contact/route.ts`: Node runtime endpoint and public-safe responses.

Official references consulted: [Nodemailer](https://github.com/nodemailer/nodemailer), [Google App Passwords](https://support.google.com/accounts/answer/185833), and [React Email renderer](https://github.com/resend/react-email/tree/main/packages/render). Google's help-page request was blocked in this cloud runtime; the setup links are provided for account-owner use.
