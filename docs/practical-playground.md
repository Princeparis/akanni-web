# Practical creative tools

The six utilities below are preserved. The eight-project collection now adds Matter and Pulse as projects 07 and 08; Field Notes, Between the Lines, and Soft Systems remain linked separately under “From the sketchbook.” See `immersive-playground.md` for the two new projects.

| Tool       | Working features                                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sum        | Scientific arithmetic, degrees/radians, functions, right-associative powers, factorials, percentages, implicit multiplication, memory, keyboard entry, and reusable history. Closed parser; no evaluation of input as JavaScript. |
| Spectrum   | Six-color harmonies, color locking, shuffling, per-swatch text contrast, clipboard hex/CSS, and JSON downloads.                                                                                                                   |
| Type Lab   | Modular scales, original local typefaces, editable specimens, fluid CSS from 360–1440px, clipboard and stylesheet export.                                                                                                         |
| Focus      | Focus/break presets, custom 1–120-minute sessions, pause/resume/reset, elapsed-time calculation, session count, and an optional user-enabled chime.                                                                               |
| Frame      | Local image upload/drop, cover/contain, presets, proportion locking, matte/transparent padding, and PNG/JPEG/WebP export at 32–4096px per edge. Images are never uploaded.                                                        |
| Motion Lab | Draggable Bézier handles, equivalent keyboard sliders, presets including overshoot, GSAP CustomEase playback, and matching CSS/GSAP clipboard output.                                                                             |

Each utility opens without the portfolio navigation/footer and includes an explanation of its underlying rules. GSAP handles page entrances, calculator keys/results, palette and type changes, timer progress, image entrances, and the easing preview. Reduced motion keeps every control and export available.

## Gallery additions

Three new fictional editorial portraits—Alloy, Ember, and Nocturne—were generated to match the existing gallery's close crops, sculptural fashion, tactile skin/materials, and restrained studio lighting. Their generation prompts requested adult fictional models. They are labelled as generated studies in the cards, alternative text, and lightbox.

Assets live in `public/assets/generated/`. WebP conversion reduced the three files to approximately 535 KiB combined. All fifteen original files are preserved. The gallery now contains eighteen entries and uses row-order responsive columns so the three new portraits appear together at the top. Counts, lightbox titles, original image dimensions, and keyboard navigation come from `src/data/gallery.ts`.

## Scope

The homepage content, hero video, loader, original logo geometry, local font files, navigation, selected-work interactions, and footer are unchanged. No runtime dependencies were added. Existing experiment and CMS-removal behavior remains covered by the browser tests.
