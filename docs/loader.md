# Kinetic introduction

The loader is an independent monochrome composition using the original Akanni symbol and local PP Neue Machina font. No homepage, navigation, portfolio, playground, footer, font binaries, or vector artwork changed for this update.

## Sequence and interaction

- A 24-contour toroidal sculpture assembles from a single ring. A GSAP ticker projects the geometry into SVG paths, with perspective and depth-sensitive line opacity.
- A scoped GSAP timeline reveals and rolls the text through “Ideas, in motion”, “into form”, and “made real”. The numeric counter represents sequence progress, rather than a measurement of network loading.
- Pointer movement eases the sculpture's orientation. Touch dragging or holding the explore control pauses the sequence while slowing the sculpture. Releasing resumes the sequence. Space and Enter provide the same hold interaction; pointer cancellation, blur, and focus loss release it.
- After about 4.85 seconds of active playback, the sculpture unravels and a circular mask opens onto the existing hero. The hero's existing entrance starts after the intro completes.
- Skip remains available throughout. Reduced motion bypasses the loader, including when the preference changes during playback. Playback remains once per tab session. Native scrolling and background focus are locked until completion; ticker callbacks, listeners, and tweens are cleaned up on exit.

## Reference access

Awwwards and Pinterest were requested directly, including the Awwwards loading-transitions collection and Pinterest's minimal-preloader search. Both returned proxy `403 Forbidden` errors. Text-reader attempts also failed. They were not visually inspected, and no claim of direct inspiration from their current pages is made.

Accessible technical references reviewed:

- [Official GSAP overview](https://github.com/greensock/GSAP), including object animation, SVG, responsive motion, and React guidance.
- [Codrops typography study](https://github.com/codrops/OnScrollTypographyAnimations), for its masked-type sequencing approach.

The wire sculpture, projection, layout, interactions, and transition in this revision are implemented locally without additional runtime packages.
