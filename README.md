# Akanni — Creative Engineer

A portfolio for Yusuff Ridwan Akanni. Next.js 15, React 19, GSAP, and Lenis. All content and imagery are local; no CMS or database is required. Contact delivery uses Gmail SMTP through Nodemailer and needs a server-side Google App Password.

## Development

Use Node 22 (also pinned in `.nvmrc` and `package.json`) and pnpm 9.8.0:

```sh
corepack pnpm@9.8.0 install --frozen-lockfile
corepack pnpm@9.8.0 dev
```

For this cloud environment, set `COREPACK_HOME=/workspace/.cache/corepack`. Use the existing checkout; no separate worktree is needed.

```sh
corepack pnpm@9.8.0 lint
corepack pnpm@9.8.0 typecheck
corepack pnpm@9.8.0 build
corepack pnpm@9.8.0 test
```

Install Playwright Chromium with `corepack pnpm@9.8.0 exec playwright install chromium` on a new machine. To use the cloud machine's existing Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. Tests start the development server if necessary. Stop the development server before a production build; both use `.next`.

## Content and design

- `src/data/projects.ts`: project artwork, descriptions, categories, and services.
- `src/data/about.ts`: existing biography and experience content.
- `src/app/globals.css`: shared responsive design system.
- `public/brand/rayab/`: supplied Rayab icon, wordmark, and lockup masters, plus matching browser icons. `src/components/Brand.tsx` renders the icon and wordmark with surface-aware colors.
- `src/data/tools.ts`: six practical tools; `src/data/immersive.ts`: Matter and Pulse; `src/data/experiments.ts`: earlier visual studies.
- `src/components/immersive/`: independent Three.js/GSAP sculpture studio and Web Audio rhythm instrument. See `docs/immersive-playground.md` for controls, rendering, and exports.
- `src/data/studios.ts` and `public/experiments/`: Caustic and Loom complete the ten-project collection. Both ship their exact standalone HTML/CSS/JavaScript as source ZIPs. `pnpm package:studios` regenerates them; production builds do this automatically. See [Caustic & Loom](docs/caustic-and-loom.md).
- `src/data/gallery.ts`: original frames and generated editorial studies.
- `/ibadan`: a full-screen particle history with six acts, eighteen chronological chapters, fourteen detailed particle models and an interactive timeline. The homepage has a centred invitation; `src/data/ibadan.ts` and `ibadan-sources.ts` preserve the owner-supplied research, evidence status and source limits. See [Ibadan experience](docs/ibadan-experience.md) and [asset plan](docs/ibadan-asset-plan.md).
- `public/`: original fonts, project artwork, photography, video, music, and résumé; new gallery assets are in `public/assets/generated/`.
- `docs/design-direction.md`: research sources and visual/interaction decisions.
- `src/components/ContactForm.tsx`: three-part inquiry composer; `src/app/api/contact/route.ts`: bounded, validated contact delivery. See [Contact delivery](docs/contact-delivery.md) for Gmail setup and attachment limits.

`NEXT_PUBLIC_SITE_URL` is optional. Set it to the deployed origin to generate absolute metadata and sitemap URLs; without it the sitemap is intentionally empty. No invented production domain is used.

The app builds all seven project pages statically. `next start` serves the production build; the Dockerfile sets `BUILD_STANDALONE=true` to use Next's standalone output. Docker Compose runs only the web application.

## Vercel

The application pins Node `22.x`, matching the Vercel project setting. Next.js and React use patched releases. The normal build command is `pnpm run build`; no security bypasses are needed. Set the server-only `SMTP_PASSWORD` to a Google App Password to enable contact delivery, then redeploy. See `docs/vercel-security-fix.md` for the deployment-block diagnosis and dependency decisions.
