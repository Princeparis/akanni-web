# Caustic — Rayab / Independent instrument 009

An original liquid-light laboratory by Yusuff Ridwan Akanni (Rayab).

## Run

Unzip the complete folder, keep `caustic/` and `shared/` beside each other, and double-click **caustic/index.html**. This uses classic deferred scripts, so it works directly from `file://`; no server, package manager, CDN, account or build is required. A recent browser with WebGL 2, hardware acceleration, and `EXT_color_buffer_float` is needed. If unavailable, the page displays a fallback with setup advice.

The files in this ZIP are the same files used by the live portfolio. Fonts are system fonts and icons are inline vectors. No images, commercial fonts, analytics, network APIs or other assets are required.

## Play

- Drag or touch the canvas to disturb the wave field. Hover moves the light.
- Moonlight, Infrared and Daybreak change the underlying poster and highlights.
- Refraction bends the poster. Colour separation offsets the RGB samples. Wave persistence changes damping.
- Edit the words; `/` starts a new line (up to three lines).
- Drop a ripple, pause/resume, reset the waves, toggle fullscreen, or download a PNG of the actual canvas.
- Focus the canvas: arrow keys move the light; Space adds a ripple; R resets.
- Reduced motion starts paused. Manual edits render a static result. Resume motion explicitly opts into animation.

## Read / change

`scene.js` includes the complete GLSL wave and optical shaders, ping-pong framebuffers, procedural poster and inputs. `style.css` defines the atmosphere. `../shared/runtime.js` manages WebGL, safe PNG downloads, keyboard-independent controls, sizing, visibility and cleanup. `../shared/studio.css` defines the responsive instrument shell.

The finite-difference wave equation is stepped at 60 Hz with a capped accumulator. The shader derives a surface normal from the height gradient and offsets red, green and blue separately. Caustic highlights are a procedural approximation, not physical light transport. The simulation is visual, not a scientific measurement tool.

Rendering pauses when the canvas is outside the viewport or the tab is hidden. Device pixel ratio and image width are bounded. GPU resources and listeners are released on document teardown. No input leaves the browser. PNG exports contain the current artwork, not the control panel.

MIT licence; see `LICENSE.txt`. Credit is appreciated: Yusuff Ridwan Akanni / Rayab.
