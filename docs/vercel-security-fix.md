# Vercel deployment security fix — 20 October 2026

## Cause confirmed by the deployment log

The build for `aa177f6` completed compilation, lint, TypeScript checks, static generation, and Vercel output creation successfully. Deployment then stopped with:

> Build cache cleared after a dependency security block. Redeploy to build with a clean cache.
> Vulnerable version of Next.js detected, please update immediately.

Next.js 15.4.4 was the deployment blocker. The broad Node engine range also overrode the project's Node 22 setting and selected Node 24.

## Changes

- Next.js and `eslint-config-next`: 15.4.4 → 15.5.28, the current patched Next 15 backport release verified through the npm registry.
- React and React DOM: 19.1.0 → 19.1.10, the matching patched maintenance release.
- Sharp: 0.34.2 → 0.35.5; a scoped override also updates Next's optional Sharp dependency so an older image processor is not retained.
- Next's PostCSS dependency uses patched 8.5.31 through a scoped override.
- Remove Next's unused optional Sass peer with pnpm's supported dependency-removal override. The site has no Sass/SCSS files; retaining this former CMS dependency kept unnecessary vulnerable packages in the production graph. Remove this exclusion if Sass support is intentionally introduced later.
- Playwright: 1.54.1 → 1.64.1, including its browser-download security fix.
- Pin `engines.node` to `22.x` and add `.nvmrc` so Vercel uses the configured Node major without an automatic major-version upgrade.
- Regenerate and verify the pnpm lockfile. No Vercel security checks are disabled or bypassed.

Sources: [Next.js release](https://github.com/vercel/next.js/releases/tag/v15.5.28), official npm package metadata, and the npm advisory database queried by `pnpm audit`.

## Verification

Executed with Node 22.23.3 and pnpm 9.8.0:

- Frozen-lockfile installation passed.
- `pnpm build` passed with Next.js 15.5.28, including lint and TypeScript validation.
- Standalone ESLint and TypeScript checks passed.
- Nine Playwright tests passed against the production server, including AVIF/WebP image optimization and the existing desktop/mobile interaction coverage.
- `pnpm audit --prod` reported zero known advisories. A separate full audit still reports development-only linter/tooling advisories; this is not a claim that the entire development dependency graph is advisory-free.

Vercel's next deployment must build the new commit. The failed deployment's old build cannot be made deployable by retrying the same vulnerable commit. Vercel deployment itself has not been verified from this cloud machine.
