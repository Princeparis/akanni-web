# Akanni: restoring the original identity

The first redesign moved too far from the original site's identity. This local revision restores the original visual language while retaining the CMS removal and security fixes.

## Branding and typography

- The exact header symbol and footer wordmark paths are recovered from original commit `7f83e41`. Their geometry is unchanged; SVG fill uses `currentColor` so the original artwork works across surfaces.
- PP Neue Machina is restored as the primary display and interface face. PP Neue Montreal remains the body-copy face. The original font binaries are unchanged. PP Kyoto and Big Shoulders remain available from the existing local assets.
- Full-bleed video, near-black surfaces, off-white typography, the original lime accent, cut-corner frames, and compact labels replace the light editorial treatment.

## Interaction direction

- A branded counter, name reveal, center divider, and opposing curtain wipe introduce the site. It plays once per tab session, can be skipped, and yields immediately for reduced motion.
- Hero typography follows the intro through masked, staggered GSAP entrances; the video eases from a close crop and parallax follows scrolling.
- Desktop selected work is a pinned horizontal sequence, with image parallax synchronized to the rail and a progress indicator. Touch layouts and reduced-motion users receive a normal project grid/stack.
- Body text uses GSAP SplitText line masking with automatic re-splitting. Vector logo paths reveal in sequence at the footer. Navigation uses a circular reveal.
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
