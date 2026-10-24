# Ibadan — A living memory

The native `/ibadan` route is a full-viewport experience in the existing Next.js application. It has its own entry, navigation, scene, chapter index, field notes and exit. The portfolio header/footer are omitted on this route. The main navigation links directly to it; none of the ten playground experiments is changed. No iframe, downloaded model, external rendering service or separate playground environment is involved.

## Historical content and research status

The owner clarified that content research is also in scope. This implementation includes a selective 13-chapter survey: earlier origin traditions; the 1829 emergence of the present city; Osogbo in 1840; the Kiriji era; British intervention in 1893; the 1901 railway; the university's 1948 founding and 1962 autonomy; the Western Region; WNTV in 1959; independence and Cocoa House; Oyo State in 1976; the modern rail link in 2021; and the living city. It does **not** claim to cover every event in Ibadan's history.

Content is prepared from general historical knowledge, with source verification explicitly pending. Public HTTP requests to Britannica, University of Ibadan, Oyo State, BBC and Wikipedia were rejected by the environment's network proxy (403 tunnel responses). An approved elevated request to Britannica was also rejected with HTTP 403. No successful page retrieval or completed source verification is claimed. The reference links in `src/data/ibadan.ts` and the experience's field notes are **reading/verification links**, not citations presented as inspected evidence.

The visible entry status and “About this edition” explain that limitation. Search indexing is disabled for this edition until verification is completed. Oral origin traditions are separated from the founding of the present city. The text avoids a “first television station in Africa” superlative, historical population estimates, unverified current rulers, and invented quotations. It acknowledges conflict, resistance and colonial inequality rather than presenting an uninterrupted celebratory account. The contents should be independently verified against institutional and historical sources when the source-access blocker is resolved.

## Art direction and interpretation

Original procedural point clouds represent imagined hills, gathering circles, an hourglass talking drum, a working hoe, a weaving-inspired shuttle, a railway wheel, an open book, a calabash, a television, a simplified tower and a roofscape. These are interpretive symbols, not authenticated artefacts, measured reconstructions, historical photographs or evidence for an object's use in a particular event. Per-chapter notes make those relationships explicit. The forms can be replaced with curated asset point samples later without replacing the experience.

The ink, cream, warm earth, pale violet and blue-grey palette extends the site's editorial typography. A GPU shader disperses points along deterministic paths between forms, with soft luminosity, depth, restrained orbit lines and subtle atmospheric grain. The intro already contains a particle drum; Enter moves directly into the first chapter. All geometry is generated locally. No image-generation, stock asset, texture download or third-party font request is needed.

## Interaction and audio

- Begin requests browser fullscreen directly from the visitor's gesture, after unlocking opted-in audio. A header control enters/exits fullscreen, and native fullscreen-change events keep it correct when the visitor leaves with Esc or browser controls. Fullscreen is limited to the experience's root element and released when it unmounts. Standard and prefixed WebKit APIs are supported; unsupported or denied requests preserve the full-viewport journey without blocking navigation.
- Scroll, arrow keys, Previous/Next, chapter ticks and a modal index navigate the chapters. Home/End jump to the ends. The closing Next control restarts the journey. Horizontal swipes on the story navigate on touch screens; dragging the canvas rotates the object.
- Holding still on the canvas disperses the sculpture; release reforms it. The equivalent Release/Gather buttons support keyboards. Inspect centres the sculpture and hides story copy, exposing rotation and reset controls. Escape leaves inspection. Ambient motion can be paused separately from navigation.
- A gesture on Begin starts the optional original Web Audio soundscape. The entry sound preference and persistent in-session mute button allow silent entry. Sine layers and filtered procedural noise form a low-level, slowly retuned atmosphere. It is not traditional music, a reconstruction or an archival recording.
- Hidden tabs suspend audio and rendering. Returning resumes the opted-in soundscape when the browser permits it. Audio failure never blocks entering or navigating. Source nodes, buffers, listeners, observers, animation frames and WebGL resources are released when leaving the experience.
- Reduced motion removes idle animation, animated entry text and morph travel. Chapter changes remain immediate and functional; explicit inspection and release controls remain available. WebGL failure retains the full text journey, sources and navigation with a retry action.

## Source map

- `src/app/ibadan/page.tsx`: native route and metadata.
- `src/data/ibadan.ts`: narrative, dates, object interpretation, reference links and verification status.
- `src/components/ibadan/IbadanExperience.tsx`: experience state, responsive UI, input, dialogs and lifecycle.
- `particle-forms.ts`: deterministic 3D samples.
- `ibadan-scene.ts`: lazy-loaded Three.js renderer, shader morphs, interactions and disposal.
- `ibadan-audio.ts`: generated ambient soundscape.
- `ibadan.css`: route-scoped full-viewport layout, responsive typography and accessible panels.

The Three.js scene chunk is loaded only when visiting this route. Existing dependencies are sufficient. Build with Node 22 and the pinned pnpm. Browser tests cover full-screen sizes, real particle rendering, navigation, notes, inspection, audio opt-in/lifecycle, reduced motion and WebGL failure. Captures are written to ignored `artifacts/ibadan/` for visual review.
