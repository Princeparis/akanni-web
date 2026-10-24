# Ibadan revision validation

Validated against the production build on 24 October 2026.

## Results

- Production build: passed; 30 routes generated, including `/ibadan`.
- ESLint across `src` and `tests`, TypeScript and patch whitespace checks: passed.
- Ibadan suite: **16 passed** — two content/geometry checks and fourteen browser flows.
- Existing-site regression subset: **5 passed** — mobile menu dismissal/navigation, responsive homepage, narrow/tablet inner pages, ten-project collection and original experiment order.
- **21 automated checks passed in total.** No external email was sent.

The browser uses the cloud machine’s system Chromium. Tested layouts include 320×568, 390×844, 768×1024, 844×390 and desktop 1440×1000. Real wheel events and emulated mobile touch gestures reached the global menu footer while the underlying page stayed still. The journey’s own menu reached its final controls too. Desktop keyboard dismissal and destination focus previews work.

## What is verified

- Six acts, eighteen chronological episodes and twenty-three resolving source records. The supplied consultation limits are retained.
- Oral traditions and the conventional modern founding are distinct; no precise sort year is invented for the earlier origins or Efunsetan’s decade-spanning episode.
- The 1886/1893 distinction, the 1893 slavery correspondence, WNTV’s qualified launch statement and Cocoa House’s completion/commissioning distinction remain in the content.
- Mapo geometry is assigned to its 1929 episode; modern Bodija is not inserted into the early settlement. All geographic coordinates remain null.
- All spatial forms use finite, deterministic point samples; human, material and relationship layers are present. The main scenes’ viewpoint changes have corresponding human/historical content.
- Efunsetan’s evidence panel distinguishes scholarly biography from drama and acknowledges enslaved labour. Mbari’s people panel and location distinguish the Ibadan club and its participants.
- The homepage invitation and experience entry are centred. The transition, native fullscreen toggle, audio opt-in/mute/resume/disposal, complete text edition, reduced motion, context-loss retry and WebGL fallback work.
- Optional narration remains opt-in, selects a supplied available Nigerian-English voice in the test double, and follows chapter changes. This is a functional API/control test, not proof of an installed African voice on every visitor’s device.

## Boundaries of the result

The content checks verify attribution and presentation against the supplied brief; they do not independently authenticate every underlying historical claim. Full source consultation, archive work, site surveys, period reference boards, authenticated portraits and permissions remain as recorded in [the asset plan](ibadan-asset-plan.md). The original brief is preserved in `docs/research/`.

Geometry is deliberately schematic and figures are composites. No authenticated costume, building plan, battlefield route, historical voice, direct quotation or eyewitness account is invented. The climate/water layer is not a flood model. The modern ending is not a claim to document every event through 2026.

The attempted free speech-generation service was blocked by the cloud HTTP proxy. No prerecorded African narration is shipped. The working read-aloud option depends on device voice availability and pronunciation; a full transcript remains available. Native Safari/iOS voice quality and performance on physical low-end phones have not been measured by these Chromium checks.

Review captures are stored locally in ignored `artifacts/ibadan-remade/`. Reproduce with Node 22, the pinned pnpm, `pnpm build` and `playwright test tests/e2e/ibadan.spec.ts`. Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` in this cloud environment.
