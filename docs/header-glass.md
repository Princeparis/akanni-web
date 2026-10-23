# Refractive navigation surface

The shrinking header now develops a custom optical surface between scroll positions 40px and 280px. Its existing width, position, links, logo, sound control, and menu behavior remain intact. The contracted corners use a 24px radius; the opaque black background and CSS border are removed.

## Rendering

`HeaderGlass.tsx` owns two decorative canvases below the ordinary HTML controls. The primary surface is a WebGL lens. The fallback is a sampled Canvas 2D surface; it keeps navigation readable if GPU initialization fails or the WebGL context is lost. Context restoration recreates GPU resources and resumes the lens.

`glass/page-scene.ts` paints a bounded region around the header into an offscreen texture. It reads the site's actual same-origin images, live video frames, canvas content, text ranges, colours, linear gradients, clipping rectangles, opacity, and simple stacking order. It does not request screen-capture access, clone or replay the whole document, fetch external content, or expose page pixels to a server.

`glass/optics.ts` band-limits this texture before applying an analytic rounded glass profile. The fragment shader uses the profile's normals and Snell refraction with an index of 1.47 to displace the sample near the bevel. Multi-tap soft transmission, small wavelength separation, Fresnel reflectance, directional rim highlights, and an opposing caustic supply depth. The tint adapts to source brightness to retain readable foreground controls. Pointer position changes the light direction; reduced motion keeps that light fixed. No CSS `filter` or `backdrop-filter` supplies the header effect.

The existing GSAP contraction also animates `--glass-progress`, so the lens gains strength and opacity with the shape transformation. At the page top it is invisible. CSS supplies a light hero shade there. High-contrast/forced-colour preferences receive a system-colour navigation surface instead of optics.

## Performance and cleanup

- Render at most 30 frames per second and cap output density at 1.75.
- Sample only the header region plus a 40px optical margin; no full-page screenshot texture.
- Observe viewport intersections and reuse the page's paint tree until its structure changes.
- Redraw for scrolling, layout, media, content, or lighting changes. Static content settles without repeated texture uploads; video and canvas sources remain live.
- Suspend drawing while the navigation dialog covers the page or the tab is hidden. High-contrast mode bypasses drawing.
- Remove listeners and observers, cancel animation frames, and delete shaders, buffers, textures, and programs on cleanup or route changes.
- No new runtime dependency or API credential is needed.

## Browser boundary

Ordinary web APIs do not expose the browser's fully composited DOM as a live WebGL texture. This is a site-specific approximation of the backdrop, not Apple's native system compositor or an arbitrary-DOM renderer. CSS pseudo-elements, inline SVG artwork, complex gradients, blend modes, shadows, and perspective-transformed DOM layers are not rasterized exactly; transformed media use their visible axis-aligned bounds. Unsupported/cross-origin media are omitted rather than tainting the texture. The current site's main imagery and video are local and supported. On content-free dark areas the lens correctly has little colour to refract.

These limits apply to the source reconstruction; the primary lens itself performs GPU refraction and softening. The Canvas 2D fallback provides soft transmission and edge lighting, without the GPU's refraction or colour separation. Modern Chromium was tested, including touch emulation and GPU-loss recovery; physical Safari/iOS and Android GPU behavior have not been verified here.

## Validation

`tests/e2e/header-glass.spec.ts` verifies contraction strength, actual artwork and live canvas updates, attenuation of one-pixel detail, refraction across a colour boundary at the top bevel, GPU loss/restoration, unavailable WebGL, route changes, responsive reduced motion, and high contrast. The existing header/menu, homepage, and project-deck tests cover shared behavior.

The pixel tests crop and materialize screenshot buffers before measuring them, so foreground labels and controls are excluded from optical measurements.

Technical references consulted:

- [MDN: WebGL texImage2D sources](https://github.com/mdn/content/blob/main/files/en-us/web/api/webglrenderingcontext/teximage2d/index.md)
- [MDN: Canvas drawImage sources](https://github.com/mdn/content/blob/main/files/en-us/web/api/canvasrenderingcontext2d/drawimage/index.md)
- [Three.js Refractor](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Refractor.js), for the boundary between a renderable scene texture and page DOM. The lens implementation uses its own WebGL shaders and does not import Three.js.
