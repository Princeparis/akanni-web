# Matter & Pulse

Two additional independent creative projects complete the eight-project playground. The six utility components, their shared shell, and their content are unchanged. Earlier studies remain available and linked in a sketchbook section. The homepage, loader, gallery, header, footer, original fonts, and vector artwork are untouched.

## Matter — `/playground/matter`

A warm photographic studio for procedural sculpture. Three.js renders a tubular knot, a pleated radial bloom, or six interlocked orbital rings. A physically based surface reflects a locally generated `RoomEnvironment`; no environment map or other network asset is fetched. Three finishes, roughness, rotating studio light, three camera positions, and direct OrbitControls manipulation change the actual geometry/material/view.

GSAP choreographs form contraction/expansion, color and material changes, lighting, camera transitions, and masked type entrances. Pointer/touch orbit and pinch/scroll zoom remain direct. Canvas focus supports arrow-key rotation, +/− zoom, and 0 to reset. PNG capture explicitly renders and downloads the current canvas at its device-scaled resolution, excluding interface controls.

The stage observes its size and visibility. Rendering stops in hidden tabs, outside the viewport, and between edits with reduced motion. The latter disables automatic rotation and snaps transitions to their final states. Geometries, materials, environment targets, shadows, controls, listeners, observers, GSAP tweens, and the WebGL renderer are disposed on exit. Unsupported WebGL 2 shows a clear fallback; context loss offers a fresh studio instance through Retry.

## Pulse — `/playground/pulse`

A local, playable 16-step sequencer with four synthesized voices. The kick sweeps a sine oscillator; snare/hat filter deterministic noise; Tone plays a D-minor-related note sequence. Web Audio schedules ahead of the audio clock instead of using JavaScript intervals as the beat clock. Tempo (55–180 BPM), master volume, voice mute, individual steps, and four presets are editable. No audio context is created until the user presses Play. Audio stops when the tab becomes hidden, when stopped, or when leaving the route; route cleanup also closes the context.

The WebGL sculpture has 22,000 particles on desktop and 11,000 on small screens. Custom vertex/fragment shaders interpolate between an undulating orbit, spherical cloud, and wave surface. GSAP transforms each triggered voice into radial expansion, displacement, sparkle, or twist. Pointer movement bends the field; tapping/clicking scatters the sculpture and lets it reassemble. Shape changes morph rather than replacing a static image. Reduced motion keeps the sculpture still while the instrument and exports remain available. WebGL failure leaves the sequencer fully usable.

WAV export uses the same synthesis and compressor graph in an `OfflineAudioContext`. It renders two bars and takes the second to retain preceding release tails at the loop seam. Output is one 4/4 bar, stereo, 44.1 kHz, 16-bit PCM, at the chosen tempo and current volume/mute/pattern settings. Downloads remain local. The grid has actual pressed-state buttons and arrow/Home/End navigation; Space activates a focused step. Phones show two rows of eight steps per voice for larger targets.

## Delivery and review

- The two apps are dynamically imported only for their own routes. Three.js is shared by their bundles; the six utilities do not import it.
- The collection's two new WebP previews are captures of the running scenes, optimized to 960×768. No stock imagery or generated placeholder art is used.
- New browser checks verify real rendered PNGs, pointer orbit, WebGL loss/retry, all 64 sequencer steps, actual PCM samples and duration, silent export, audio start/stop/cleanup, keyboard use, fallbacks, and 320–1440px layouts.
- Desktop/mobile captures are stored locally in ignored `artifacts/immersive/`. This is Chromium cloud testing; physical-device and Safari/Firefox testing are not claimed.
