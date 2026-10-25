# Ibadan: A City Made and Remade

A full-viewport Next.js experience at `/ibadan`, organised as six acts and eighteen chronological chapters. The history and source register come from the [owner's supplied brief](research/ibadan-history-brief.md). The visible medium is the original particle style, with detailed surface-based models replacing the earlier generic human volumes.

## Experience

The homepage invitation and direct entry share a large centred Ibadan wordmark and an interpretive particle portrait. The homepage transition goes directly into the story. Direct entry offers atmosphere, a text edition and user-initiated browser fullscreen; the experience always fills the viewport even without the native fullscreen API.

Each chapter has a dominant date, a clear reading column and a separate object display. An eighteen-stop timeline exposes the complete chronology. Visitors can jump by date, use previous/next or arrow keys, open the six-act index, and scrub the mobile timeline. Index and source drawers scroll natively, independently of Lenis. The existing global menu's wheel/touch scrolling fix remains intact.

The gallery has fourteen detailed particle models: talking drum, carried vessel, commander portrait, blade, open book, Efunsetan portrait, document, steam locomotive, Mapo Hall, television receiver, composite artist, Cocoa House/cocoa pod, modern civic grouping and water/vessel. The models are sampled by triangle area, with extra density on facial surfaces. Only point sprites write visible colour; an invisible depth pass keeps far-side particles from showing through faces. Presentation plinths are excluded. The camera does not continually orbit. Objects enter/leave directionally; reduced motion composes them immediately. Visitors can drag to turn an object or use inspect/rotate/reset controls.

On desktop, narrative and object occupy separate columns. On phones the model appears above the story. Native scrolling keeps longer narratives and all viewpoint/source actions available on short screens. The source panel, people panel and complete text edition remain available without 3D or audio.

## Models and history

The human facial geometry is built from explicitly CC0 MakeHuman graphical assets. No MakeHuman application source is imported. An original offline Python builder produces two local GLB heads, each with more than 30,000 triangles. Clothes, accessories, objects and architectural forms are original source meshes. They are sampled into 120,000 points on desktop or 65,000 on mobile; lightweight previews render the same particle models.

**Oluyole and Efunsetan are interpretive portrait studies, not authenticated likenesses.** The modern artist is a composite, not a named Mbari participant. Model and costume limits are stated in inspection and evidence panels. Objects are illustrative; architecture is not a measured survey. The script does not invent historical quotes, signatures, eyewitness accounts or precise earlier founding dates.

Source S01–S23 access and consultation limits remain in `src/data/ibadan-sources.ts`. The content distinguishes earlier traditions from c.1829, the 1886 settlement from the war's broader end by 1893, university founding from autonomy, and Cocoa House completion from commissioning. WNTV uses 31 October 1959 without an unqualified continental-priority claim. Mapo and modern Bodija are kept in the correct periods.

See [the 3D research and production decisions](research/ibadan-3d-direction.md), [asset provenance](ibadan-asset-plan.md) and [source input hashes](research/ibadan-model-sources.json).

## Audio and access

Atmosphere is original Web Audio synthesis, available after an explicit gesture, independently mutable, suspended when hidden and disposed on exit. Optional narration is the browser's modern Speech Synthesis reading, preferring an installed Nigerian English voice, followed by other available African English voices. Device availability and pronunciation vary. The transcript is always available; no prerecorded or archival African narration is claimed. Earlier testing of a free speech service was blocked by the cloud proxy, so no generated recording is shipped.

The renderer uses bounded pixel ratios, normal-based particle shading and a four-cloud buffer cache. It renders on demand, stops when hidden or replaced by the text edition, and disposes resources on leaving. Graphics creation, lost-context and model-download failures preserve the complete text journey and a retry option. Fullscreen denial never blocks entry.

The ten playground projects, contact delivery, email templates and the homepage project section are unchanged by this revision.
