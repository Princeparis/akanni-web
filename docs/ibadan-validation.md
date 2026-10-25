# Ibadan sculpture gallery validation — 25 October 2026

Validated against the final production build, served locally on port 3000. No external email was sent, and no delivery configuration was changed.

## Completed checks

- Production build: Node 22.23.4, repository-pinned pnpm 9.8.0; all 30 static routes generated. Build lint/type checks passed. The cloud's default pnpm 11/Node 24 launcher was incompatible; the existing pinned toolchain was used explicitly instead.
- ESLint across `src` and `tests`: passed. TypeScript `--noEmit`: passed.
- `tests/e2e/ibadan.spec.ts`: **19 passed** in 1.9 minutes. Two content/model checks and seventeen browser flows.
- Existing portfolio/immersive/studio regressions: **5 passed**. Keyboard menu dismissal, full-viewport responsive layouts, inner pages, ten experiments and the original eight in their original order remain intact.
- **24 checks passed overall.** No new runtime dependency or lockfile change.

## Coverage

1. Six acts, eighteen chronological episodes, twenty-three source records, source ID resolution, chronology distinctions and anachronism constraints.
2. Both local GLBs: valid headers, finite vertex coordinates, valid triangle indices, more than 30,000 triangles each, and retained CC0 attribution. All fourteen sculpture types have local preview assets and interpretation notes.
3. Centred entry and actual browser fullscreen entry/exit/re-entry; no portfolio chrome or iframe inside the experience.
4. Arrival perspectives, Efunsetan's commercial/political agency and enslaved labour, biography versus drama, and Mbari's named participants versus composite artist.
5. Native scrolling to the end of the chapter menu, global Lenis menu wheel scrolling and real emulated touch scrolling; the background remains locked.
6. All eighteen chapters in the complete text edition; direct timeline travel through every chapter and keyboard control of the phone scrubber.
7. Responsive 320×568, 390×844, 768×1024 and 844×390 layouts plus 1440×1000 desktop; full viewport, no horizontal document overflow, centred entrance, reachable navigation, historical paragraph visible on entry and native story scrolling.
8. Object inspection, rotate controls, pointer turning and back navigation, interpretation disclosure, and prevention of accidental chapter changes while inspecting.
9. Opt-in atmosphere, mute/resume/dispose and optional narration with a mocked available Nigerian English voice. No claim that headless Chromium has a real Nigerian voice installed.
10. WebGL creation failure, lost-context retry, model-download failure, and stable reduced-motion scenes; complete reading journey and evidence remain available.
11. Centred homepage invitation and transition directly into the main story without a second entry click.

Earlier checks exposed a phone-footer overlap, a delayed dialog-close/reopening race and frame-count-based transition stretching. These were fixed and the final production suite passed in full. Model and clothing lighting/framing were reviewed visually before the final build.

## Model and preview production

The Python model builder was executed against the hash-verified CC0 inputs. The local poster-rendering script was executed successfully and generated all fourteen WebP previews; its temporary public harness was removed automatically. The previous particle geometry implementation was removed because no shipped component uses it.

Final review images are in the ignored local `artifacts/ibadan-gallery/` directory: desktop/phone entry, Efunsetan story/inspection, small-screen arrival views, a model-study contact sheet, and homepage/menu previews. These are review artifacts, not extra application downloads.

## Limits

These checks validate the implementation and presentation rules, not archive authenticity. The owner-supplied brief remains the historical foundation and its original source access limits are preserved. Portrait faces and costumes are artistic interpretations; objects are illustrative and architecture is not a measured survey. Real iOS/Safari hardware, a physical low-end phone, historical likeness authentication and a recorded Nigerian narration have not been validated. Speech voices depend on the visitor's device. No generated or archival voice recording is shipped.
