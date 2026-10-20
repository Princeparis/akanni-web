# Akanni: design and interaction direction

The user-supplied Aeline and Horizon references inform the breathing room, rounded photographic frames, and disciplined section rhythm. The supplied Ilya Kulbachny, portrait-led product, and Yango references inform the oversized typography and identity-led hero. This implementation is an original composition, using Akanni's own typefaces, video, portrait, project artwork, and photography.

## Sources actually reviewed

- [Official GSAP React guidance](https://github.com/greensock/react): scoped `useGSAP`, automatic context cleanup, `contextSafe` for pointer handlers, and lifecycle-safe effects.
- [Official GSAP overview](https://github.com/greensock/GSAP): responsive animation through `matchMedia` and scroll animation through ScrollTrigger.
- [Codrops: On-Scroll Typography Animations](https://github.com/codrops/OnScrollTypographyAnimations): typographic rhythm, staged reveals, and motion as visual hierarchy.
- [Codrops: On-Scroll Image Layout Animations](https://github.com/codrops/ScrollBasedLayoutAnimations): image-led compositions and considered transitions between layouts.

The public README documents were read through their canonical raw GitHub URLs. Direct requests to Awwwards portfolio/animation collections, the Ilya Kulbachny and Dennis Snellenberg award pages, and GSAP's hosted docs were blocked by the cloud network policy. Those pages are not claimed as inspected, and no award status is claimed for this implementation.

## Decisions

- Warm ivory `#f5f4ef`, ink `#202321`, and electric blue `#284eea`. Cool green and lavender appear as quieter supporting surfaces.
- Retain PP Neue Montreal for primary typography, PP Kyoto for expressive italic contrast, and PP Neue Machina for compact labels. Existing Big Shoulders remains available.
- Hero: retain the original video; replace the blocking preloader with a brief masked heading entrance. Keep a visible film pause control. Respect reduced-motion preferences by pausing autoplay video and removing ornamental animation.
- Work: replace automatic story rotation and placeholder destinations with an asymmetric project grid, deliberate pointer motion, category filtering, and seven real local project pages.
- GSAP techniques: masked entrance timelines, scoped scroll reveals, scrubbed video/asterisk motion, pointer-following project imagery, magnetic links, and responsive media-query cleanup.
- Keep core content server-rendered or immediately available. Native dialogs provide focus trapping and Escape dismissal. Controls use semantic buttons, visible focus states, and clear accessible names.
- Touch layouts use a single-column work sequence, full-width cards, a compact menu, and large tap targets. Hover effects are optional enhancements.
- No external imagery or animation runtime is required. Existing artwork is relevant to the actual projects and avoids generic stock substitutions.

## Content model

All work lives in `src/data/projects.ts`; biography and experience remain in `src/data/about.ts`. The CMS, admin, database adapters, upload integrations, blog UI, blog APIs, and obsolete migration/seed tools were removed. Old CMS-specific tests were replaced with browser coverage of the current site.
