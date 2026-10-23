# Rayab / Open line email identity

The incoming contact email extends the portfolio's visual system: official Rayab wordmark and mark, ink `#10110c`, paper `#f7f6ed`, large editorial type, compact numbered labels, square edges and fine rules. The owner requested a complementary secondary accent with a lightness similar to the site's lime. This email edition uses pale lavender `#ded4ff`; the website's palette and original SVG files are unchanged.

Phones, landscape phones and tablets up to 1024px use the full available message width with no outer card gutter. Text has 20–24px inner padding. Wider screens get a centred 640px reading column and vertical margins. Inline styles provide the base layout, so removing optional head CSS still leaves a fluid, readable document. Layout uses presentation tables, explicit image dimensions and system font fallbacks. An MSO-only wrapper bounds the column in classic Windows Outlook, which ignores `max-width`.

## Research and art direction

The following rendered public community examples and their source were reviewed in the React Email repository at commit `e0561e164e9c28859d24373804e30b364931ee77`:

| Reference                                                                                                                                                               | Applied principle                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Linear login code](https://github.com/resend/react-email/blob/e0561e164e9c28859d24373804e30b364931ee77/apps/demo/emails/Community/magic-links/linear-login-code.tsx)   | Logo first, a clear type hierarchy, and one unmistakable primary action.                       |
| [Raycast magic link](https://github.com/resend/react-email/blob/e0561e164e9c28859d24373804e30b364931ee77/apps/demo/emails/Community/magic-links/raycast-magic-link.tsx) | A recognisable brand greeting and signature, with careful whitespace around the human message. |
| [Stripe welcome](https://github.com/resend/react-email/blob/e0561e164e9c28859d24373804e30b364931ee77/apps/demo/emails/Community/welcome/stripe-welcome.tsx)             | A disciplined reading column, restrained rules, readable body text and a prominent action.     |

The screenshots in `apps/web/public/examples/` were visually inspected alongside those files. These are community examples, rather than a claim about the brands' current production emails. The layout, wording, artwork and palette here are designed for Rayab. Really Good Emails, Email Love and Can I Email were attempted but blocked by the cloud HTTP proxy; they were not inspected. The public Git repository was accessible through the existing Git connection. No external email service or new dependency was added.

The email repeats the site's “Good things start with a conversation,” “On the other side,” and “Strategy. Craft. Software.” language. Its main content shows the actual subject, sender, company, reply address, message and attachment names. The personal signature identifies Yusuff Ridwan Akanni as a creative engineer & director. The branded sender label is `Rayab / Open line`, with a `[Rayab]` subject prefix. To and Reply-To retain the existing authenticated delivery behavior.

## Real artwork inside the message

`scripts/prepare-email-brand.mjs` rasterizes the official `rayab_wordmark.svg` and `rayab_icon.svg`. It preserves their paths, changes the accent to the approved pale lavender and composites onto the email's ink background. The 864×160 wordmark displays at 216×40; the 144×145 mark displays at 32×32. These opaque high-resolution PNGs avoid dependence on remote image loading, SVG support, transparency against dark-mode backgrounds or a configured production origin.

The generated module contains the PNG bytes and source SVG hashes. Nodemailer sends the images as inline Content-ID attachments referenced by matching `cid:` sources in the HTML. No credentials, domain, image host or public URL is required. Inline branding is separate from the visitor's files; the Enclosed list only counts visitor attachments. The server still accepts and deduplicates the same user inquiry payload.

`pnpm prepare:email-brand` rebuilds the module, and the normal production build runs it automatically. The module is bundled with the Node handler, so Vercel/standalone deployment does not need an extra runtime filesystem asset or file-tracing rule. Logs never include the message or image payloads.

## Rendering and verification

- React escapes all visitor input. Explicit `<br>` elements preserve message line breaks in clients with limited whitespace CSS. Fixed table layout and wrapping handle long subjects, filenames, names and reply addresses.
- The reply action uses a safely encoded mailto address and subject. Native Reply still uses the visitor's Reply-To header. No automatic message is sent to the visitor.
- A branded plain-text alternative carries the same message, files and reference. Semantic labels and the personal signature remain readable when images are hidden.
- The head requests a light colour scheme, and artwork has its own background. Email clients can apply their own dark-mode transformations; native Gmail, Outlook and Apple Mail inbox screenshots are not claimed.
- `tests/e2e/email-template.spec.ts` checks real logo pixels/CID references, action targets, message fidelity, edge-to-edge 320–1024px layouts (including landscape phones), desktop centring, long-input wrapping, image-free/head-style-free rendering and safe escaping. Review HTML and desktop/mobile images are written to ignored `artifacts/email/`.
- `scripts/verify-contact.mjs` exercises the actual production route against a local certificate-verified SMTPS mailbox. It parses the captured MIME, verifies both referenced PNGs are real inline parts, checks the branded subject/plain text and Outlook wrapper, and retains the existing delivery, attachment, validation, retry and error checks. It never sends an email outside the machine.

The owner previously confirmed that Gmail delivery works in the deployed website. This update verifies the new HTML and MIME locally; authenticated live inbox delivery is not repeated by these automated checks.
