# Akanni: restoring the original identity

The first redesign moved too far from the original site's identity. This revision restores the original visual language while retaining the CMS removal and security fixes.

## Branding and typography

- The exact header symbol and footer wordmark paths are recovered from original commit `7f83e41`. Their geometry is unchanged; SVG fill uses `currentColor` so the original artwork works across surfaces.
- PP Neue Machina is restored as the primary display and interface face. PP Neue Montreal remains the body-copy face. The original font binaries are unchanged. PP Kyoto and Big Shoulders remain available from the existing local assets.
- Full-bleed video, near-black surfaces, off-white typography, the original lime accent, cut-corner frames, and compact labels replace the light editorial treatment.

## Interaction direction

- A branded counter, name reveal, center divider, and opposing curtain wipe introduce the site. It plays once per tab session, can be skipped, and yields immediately for reduced motion.
- Hero typography follows the intro through masked, staggered GSAP entrances; the video eases from a close crop and parallax follows scrolling.
- Desktop selected work is a pinned horizontal sequence, with image parallax synchronized to the rail and a progress indicator. Touch layouts and reduced-motion users receive a normal project grid/stack.
- Body text uses GSAP SplitText line masking with automatic re-splitting. Vector logo paths reveal in sequence at the footer. Navigation uses a layered sheet entrance, masked and staggered links, drawn rules, and a choreographed exit.
- All motion belongs to scoped GSAP contexts and responsive media queries; route cleanup does not kill unrelated scroll triggers.

## Research access and references

The user-supplied visual references remain the visual source material. The original codebase is the authority for brand artwork and typeface roles. Direct Awwwards, Pinterest, Dennis Snellenberg, and Ilya Kulbachny page requests were retried for this revision and returned proxy `403 Forbidden` responses. Those sites have not been directly inspected, and no award-winning claim is made for this implementation.

Technical references previously read through their canonical GitHub sources:

- [Official GSAP React guidance](https://github.com/greensock/react)
- [Official GSAP overview](https://github.com/greensock/GSAP)
- [Codrops: On-Scroll Typography Animations](https://github.com/codrops/OnScrollTypographyAnimations)
- [Codrops: On-Scroll Image Layout Animations](https://github.com/codrops/ScrollBasedLayoutAnimations)

## Review status

This revision restores the original branding and typography while retaining the patched Next.js/React dependencies and CMS removal.

## Focused refinements

- The header uses the original icon only. Scroll progress between 40px and 280px contracts the header to a centered 560px floating bar, capped at the viewport width minus 32px. Returning to the top expands it. Reduced motion switches directly between the two layouts.
- The menu keeps the existing two-line toggle. A neutral paper sheet, large Machina links, independent masks and rule reveals replace the circular drawer reveal. Escape and navigation wait for the exit animation, focus stays inside the dialog, and background scrolling is locked.
- Decorative lime is reduced across interface arrows, small labels, service controls, and section surfaces. The footer's original lime remains unchanged, along with the small availability dots and hero asterisk.
- The playground now links to three standalone browser instruments: a generative flow field, a moiré interference study, and a damped spring grid. They have no portfolio header, brand mark, or contact footer. Each explains its underlying rules and includes keyboard-accessible controls, pause/play, inversion, and local PNG export.
- Experimental canvases resize for pixel density, pause when outside the viewport or in a hidden tab, and start static for reduced motion. No new runtime packages or external services were added.
- Homepage content, hero video, introduction sequence, selected-work interactions, photography, local typefaces, original vector geometry, and footer composition are preserved.
