# Akanni — Creative Engineer

A portfolio for Yusuff Ridwan Akanni. Next.js 15, React 19, GSAP, and Lenis. All content and imagery are local; no CMS, database, or API credentials are required.

## Development

Use Node 22 or 24 and the pinned pnpm 9.8.0:

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
- `public/`: original fonts, project artwork, photography, video, music, and résumé.
- `docs/design-direction.md`: research sources and visual/interaction decisions.

`NEXT_PUBLIC_SITE_URL` is optional. Set it to the deployed origin to generate absolute metadata and sitemap URLs; without it the sitemap is intentionally empty. No invented production domain is used.

The app builds all seven project pages statically. `next start` serves the production build; the Dockerfile sets `BUILD_STANDALONE=true` to use Next's standalone output. Docker Compose runs only the web application.
