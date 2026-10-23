# Selected work: spatial collection

The homepage work section remains between the discipline strip and biography. Its four projects, artwork, links, and written content still come from `src/data/projects.ts`. No project detail pages or other homepage sections were changed.

## Interaction

A sticky stage turns vertical scrolling into a reversible sequence of artwork sheets. Each departing sheet tilts and travels beyond the frame while the next rises into place. Masked letter transitions follow the artwork. A brief settled interval gives each project time to read. The section releases naturally into the existing All projects link and biography.

The collection index jumps to a settled project. Desktop pointer and keyboard focus reveal small artwork previews; a pointer-following View badge appears over the main artwork. Previous/next buttons offer direct control. The index also accepts arrow keys, Home, and End without moving keyboard focus away from the controls. Only the current project is interactive and exposed to assistive technology while the deck is active; a polite announcement identifies selections.

Phones and tablets up to 1000px use a compact index beneath the artwork, shallower sheet rotations, and a shorter scroll sequence. Swipes use native browser scrolling; there are no wheel/touch interception handlers or forced scroll snapping. Native momentum behaves normally, including consuming the first tap to stop an active fling.

Reduced motion and screens shorter than 560px use the regular, fully linked project collection. Changing motion preferences or rotating the screen tears down the scoped timeline and restores the appropriate layout. The server-rendered section also contains the full collection, but the existing site-wide intro blocks use of the homepage with JavaScript disabled; this change does not modify that intro.

## Implementation

- `src/components/SelectedWork.tsx`: semantic collection, accessible controls, scoped GSAP timeline, pointer badge.
- `src/components/selected-work.css`: all section styles, responsive stage, static fallback, artwork previews.
- `src/app/globals.css`: obsolete horizontal filmstrip styles removed; other sections retain their existing rules.
- `tests/e2e/selected-work.spec.ts`: scroll reversal, active-link access, section handoff, keyboard controls, route cleanup, motion preference changes, landscape fallback, and native touch scrolling/taps.
- `tests/e2e/portfolio.spec.ts`: existing homepage checks now verify the spatial deck on desktop and mobile.

CSS supplies sticky positioning. GSAP ScrollTrigger scrubs transforms and image scale, using the site's existing Lenis synchronization. React state changes at project boundaries, rather than every animation frame. Pointer listeners and badge tweens are removed with the component. The deck's width follows available viewport height on desktop so artwork keeps a useful ratio on laptop screens. No new runtime dependency, external service, or asset is required.

## Research

The following sources were read for motion principles and implementation guidance:

- [Codrops: On-Scroll Image Layout Animations](https://github.com/codrops/ScrollBasedLayoutAnimations): coordinated layout and inner-image motion across a scroll sequence; README and `js/index.js` inspected.
- [Codrops: On-Scroll 3D Grid Animations](https://github.com/codrops/Scroll3DGrid): perspective as a visual direction; README inspected.
- [Codrops: Stack Motion Hover Effects](https://github.com/codrops/StackMotionHoverEffects): artwork previews as a tactile discovery cue; README inspected.
- [Official GSAP React guidance](https://github.com/greensock/react): context scoping, matchMedia, and cleanup.
- [Official ScrollTrigger type reference](https://github.com/greensock/GSAP/blob/master/types/scroll-trigger.d.ts): scroll range and refresh behavior.

Direct Codrops, GSAP documentation, and Dennis Snellenberg website requests returned proxy 403 responses. Their live demos were not inspected. This implementation uses original component code and the repository's existing artwork, fonts, palette, and cut-corner geometry.
