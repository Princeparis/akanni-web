# Caustic & Loom / Independent instruments 09–10

The featured playground now has ten projects. The original six tools, Matter, Pulse, their data, shared styles, renderers, and preview assets are unchanged. The three earlier sketchbook studies remain accessible. Only the catalogue, routing, sitemap, build packaging, and collection-count assertions were extended to register these additions.

## Caustic — `/playground/caustic`

A dark liquid-light laboratory with editable refracted typography. A 256×256 RGBA16F ping-pong simulation evolves height and velocity using a four-neighbour Laplacian, damping and pointer impulses. A second GLSL pass samples the height gradient, refracts a procedural poster and separates the RGB channels. Mipmapped poster textures reduce minification aliasing. The wave buffers use linear-filtered half floats. Added analytic swells and procedural highlights are an artistic interpretation of caustics, not physical ray tracing.

Moonlight, Infrared and Daybreak alter the actual poster/colour treatment. Refraction, colour separation and persistence change shader/simulation parameters. Editing the words redraws the texture in memory; `/` creates lines. Drag or touch draws disturbances. Hover/arrow keys move the light; Space drops a ripple; R resets waves while preserving the chosen poster. A separate drop-ripple button provides the same impulse without precision input. PNG capture explicitly renders the current state before encoding the canvas.

## Loom — `/playground/loom`

A warm editorial fabric studio: custom typography printed onto a simulated suspended surface. The mesh has 1,125 points on wide initial views and 825 on smaller views. Verlet integration runs at fixed 90 Hz substeps with damped inertia, gravity and spatial wind; structural, shear and bending-distance constraints keep the fabric coherent. Banner anchors two corners, Flag anchors the left edge, and Drape anchors the top row. Flag wind travels away from the pole with reduced depth flutter; a depth envelope keeps strong gusts away from the camera. Tension changes solver stiffness/iterations. Wind and Send a gust influence real vertex positions.

The print is drawn locally onto a 2048×1180 canvas, attached with UVs, and lit with reconstructed vertex normals. Signal, Cobalt and Acid are actual texture palettes. The weave shader attenuates subpixel frequencies using derivatives. This model does not implement self-collision or tearing; its wind, lighting and ground shadow are artistic approximations.

Pointer/touch picking projects each unpinned point into screen space and selects the nearest point within 55 CSS pixels. Pointer capture keeps drags continuous. Escape/pointer cancellation releases the selected point; reset restores the current anchor scheme. Keyboard users can Enter to grab the centre, use arrows to pull, Escape to release, Space for a gust, and R to reset. PNG export captures the current printed fabric and stage without the UI.

## One source, two delivery formats

Each portfolio route embeds a same-origin independent document with an accessible iframe title and outer heading. The source lives under `public/experiments/{caustic,loom}/`, with an isolated shared runtime/styles in `public/experiments/shared/`. The live files are ordinary HTML, CSS and classic deferred JavaScript. They require no React, Three.js, build tooling, CDN, accounts, commercial fonts or external artwork. Every texture is generated in memory. Text is drawn as text, never inserted as HTML.

Each studio has a **Take the source / ZIP** link and a second source link in its explanatory notes:

- `/downloads/caustic-source.zip`
- `/downloads/loom-source.zip`

Each archive contains the experiment's `index.html`, `style.css`, `scene.js`, and `README.md`; shared `runtime.js` and `studio.css`; and a root MIT licence. Keep the experiment folder beside `shared/`, then open its `index.html`. Classic scripts support direct file use in ordinary browsers. Online navigation/source links adapt for `file://` so the extracted edition does not depend on the website. System fonts and inline SVG icons keep the download portable.

`node scripts/package-studios.mjs` (or `pnpm package:studios`) makes deterministic ZIP archives with standard DEFLATE, CRC-32 and ZIP records using Node built-ins only. The production build runs packaging first, preventing the downloadable source from drifting from the deployed code. There are no new dependencies. ZIP integrity has been checked with independent `unzip -t`.

## Motion, rendering and failure handling

Reduced motion starts both canvases paused. Pointer, keyboard, style and print edits still render a static result. Resume motion explicitly opts into animation. The runtime caps the accumulated time step and device pixel ratio/width, observes canvas size and intersection, and stops frames when the canvas is offscreen or its tab is hidden. Listeners, observers, animation frames, textures, buffers, programs and contexts are released when the document is destroyed. Browser back/forward cache can retain its context rather than tearing down a cached document.

WebGL 2 is required; Caustic also requires `EXT_color_buffer_float`. Unsupported graphics and context loss expose a readable fallback and Retry, disable GPU-dependent controls, and preserve the ZIP links. Rendering errors stop the loop. Neither experiment uploads text, images or interaction data. Downloads use short-lived local Blob URLs.

## Verification

`tests/e2e/studios.spec.ts` checks ten featured links and their original order; real nonblank GPU output/PNGs; pointer, keyboard and actual dispatched touch input; edited print and material/anchor changes; pause and offscreen rendering; 320–1440px layouts; reduced motion; unavailable/lost WebGL and retry; source download names, archive contents and byte-for-byte equivalence to live files; and extracted-source operation with all external requests blocked.

This managed Chromium blocks `file://` navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). Extracted files are therefore tested through a temporary loopback-only HTTP server, with every nonlocal request blocked. The test checks actual exported pixels and zero external requests; direct double-click execution is supported by the classic-script architecture but was not verified in this managed browser. No browser policy is bypassed. Physical devices, Safari and Firefox are not claimed.

The existing practical, immersive and earlier-study browser suites are also run as regression checks. Static WebP catalogue previews are captures of the actual rendered scenes. Ignored desktop/mobile captures are in `artifacts/studios/`.

References for the implementation: [Jakobsen, Advanced Character Physics](https://www.gamedeveloper.com/programming/advanced-character-physics), [Position Based Dynamics](https://matthias-research.github.io/pages/publications/posBasedDyn.pdf), and the [WebGL 2 specification](https://registry.khronos.org/webgl/specs/latest/2.0/).
