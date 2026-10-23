# Loom — Rayab / Independent instrument 010

An original typographic fabric instrument by Yusuff Ridwan Akanni (Rayab).

## Run

Unzip the complete folder, keep `loom/` and `shared/` beside each other, and double-click **loom/index.html**. Classic deferred scripts allow direct `file://` use. No server, package manager, CDN, install, account or build is required. Use a recent browser with WebGL 2 and hardware acceleration. A clear fallback appears when the graphics context is unavailable.

These are the same files as the live portfolio. Every texture is drawn in memory; system fonts and inline vector icons require no external files. No commercial fonts, images, tracking or network requests are needed.

## Play

- Grab and drag any unpinned point on the fabric. Touch input uses the same picking and constraints.
- Banner pins the two top corners; Flag pins the left edge; Drape pins the entire top edge.
- Signal, Cobalt and Acid change the print. Edit your own words; `/` starts another line (up to three).
- Wind changes the forcing. Tension changes the constraint solver stiffness and iteration count.
- Send a gust, pause/resume motion, reset the fabric, enter fullscreen, and export the actual rendered canvas as PNG.
- Keyboard: focus the fabric, Enter grabs its centre, arrows pull it, Escape releases, Space sends a gust, R resets.
- Reduced motion starts paused; manual edits and gusts produce a static result. Resume motion explicitly starts animation.

## Read / change

`scene.js` contains the complete Verlet integration and structural, shear and bending constraints, pointer picking, normal reconstruction, projection, procedural print, and WebGL shaders. `style.css` defines the paper/coral design. `../shared/runtime.js` and `studio.css` manage the responsive shell, graphics lifecycle and PNG exports.

The simulation uses fixed 90 Hz substeps with capped catch-up, damped inertia, gravity and spatially varying wind. Iterative distance constraints hold the mesh together. This is a position-based cloth study, not a production textile solver: it does not implement self-collision, tearing, sewing or a physically calibrated aerodynamics model. Lighting and the ground shadow are artistic approximations.

Small viewports use fewer columns. Pixel ratio is capped. Frames stop when the canvas is offscreen or the document is hidden. Listeners, buffers, textures and programs are released when the document is destroyed. Words and images stay in browser memory. PNG exports contain the artwork without the surrounding controls.

MIT licence; see `LICENSE.txt`. Credit is appreciated: Yusuff Ridwan Akanni / Rayab.
