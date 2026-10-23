export const tools = [
  {
    slug: 'calculator',
    number: '01',
    title: 'Sum',
    medium: 'Scientific calculator',
    description: 'A precise little machine for surprisingly big ideas.',
    introduction:
      'Trigonometry, powers, factorials, memory, and reusable history. A calculator with a little more character.',
    principle:
      'Expressions follow mathematical precedence. Powers associate from the right; unary minus applies after powers. Percent divides a value by 100. Switch between degrees and radians for trigonometry.',
    code: 'power → factorial [ ^ unary ]\nproduct → unary { × unary | ÷ unary }\nsum → product { + product | − product }',
  },
  {
    slug: 'palette-studio',
    number: '02',
    title: 'Spectrum',
    medium: 'Palette studio',
    description: 'Find a color system. Keep the good surprises.',
    introduction:
      'Six-color harmonies, locked favourites, readable text pairings, and CSS you can take to your next project.',
    principle:
      'Harmonies rotate a base hue around the HSL color wheel. Contrast uses WCAG relative luminance. The rating on each swatch applies to its suggested foreground text against that background.',
    code: 'contrast = (lighter + 0.05) / (darker + 0.05)\ncomplement = (hue + 180) % 360',
  },
  {
    slug: 'type-scale',
    number: '03',
    title: 'Type lab',
    medium: 'Fluid type generator',
    description: 'Give your next interface a rhythm that feels right.',
    introduction:
      'Tune a modular scale, try the original typefaces, edit the specimen, and export a responsive CSS system.',
    principle:
      'A modular scale multiplies a base size by a fixed ratio. Fluid CSS interpolates between 360px and 1440px viewports. Rem units retain the user’s font-size preferences. Font files are not included in the export.',
    code: 'size = base × ratio ^ step\nfont-size: clamp(minimum, intercept + slope × 1vw, maximum)',
  },
  {
    slug: 'focus-timer',
    number: '04',
    title: 'Focus',
    medium: 'Focus timer',
    description: 'Make room for one thing. Then another.',
    introduction:
      'A small sanctuary for focused work. Choose your session, settle in, and let one thing have your full attention.',
    principle:
      'The timer measures the distance to a real target timestamp instead of subtracting one each tick. That keeps it accurate when a tab becomes inactive. Pausing preserves the remaining time; completed sessions never start another timer without you.',
    code: 'remaining = Math.max(0, targetTime - Date.now())\nprogress = 1 - remaining / sessionDuration',
  },
  {
    slug: 'image-lab',
    number: '05',
    title: 'Frame',
    medium: 'Image resizer & exporter',
    description: 'The right image. The right size. Ready to use.',
    introduction:
      'Bring an image. Choose a frame. Export a web-ready PNG, JPEG, or WebP. Everything stays in your browser.',
    principle:
      'Contain preserves the whole image; cover fills the frame by cropping the excess. Canvas renders the result locally. Output is limited to 4096px per edge. PNG is lossless; the quality slider applies to JPEG and WebP.',
    code: 'scale = fit === "cover" ? max(target / source) : min(target / source)\ncanvas.drawImage(image, x, y, width, height)\ncanvas.toBlob(download, format, quality)',
  },
  {
    slug: 'motion-studio',
    number: '06',
    title: 'Motion lab',
    medium: 'Easing curve editor',
    description: 'Find the feeling between here and there.',
    introduction:
      'Shape a cubic Bézier curve, preview its movement, and copy production-ready CSS or GSAP code.',
    principle:
      'The horizontal axis is elapsed time; the vertical axis is movement progress. Control points shape acceleration. Y values outside 0–1 create overshoot. The GSAP preview and exported CSS use the same curve.',
    code: 'B(t) = (1−t)³P₀ + 3(1−t)²tP₁\n     + 3(1−t)t²P₂ + t³P₃',
  },
] as const
export type ToolSlug = (typeof tools)[number]['slug']
export type ToolDefinition = (typeof tools)[number]
