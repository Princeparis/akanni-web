'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { typeStep } from '@/lib/creative-tools'
import { CopyButton, downloadText, reducedMotion } from './shared'
const fonts = {
  'PP Neue Machina': 'var(--font-machina)',
  'PP Neue Montreal': 'var(--font-montreal)',
  'PP Kyoto': 'var(--font-kyoto)',
}
const names = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']
export default function TypeScale() {
  const root = useRef<HTMLDivElement>(null)
  const [base, setBase] = useState(16),
    [ratio, setRatio] = useState(1.25),
    [fluid, setFluid] = useState(true)
  const [font, setFont] = useState<keyof typeof fonts>('PP Neue Machina'),
    [sample, setSample] = useState('Make room for good ideas.')
  const sizes = names.map((name, index) => ({ name, ...typeStep(base, ratio, index - 2, fluid) }))
  const css = `:root {\n${sizes.map((item) => `  --text-${item.name}: ${item.css};`).join('\n')}\n}\n\nbody { font-family: "${font}", sans-serif; }`
  useGSAP(
    () => {
      if (!reducedMotion())
        gsap.from('.type-specimen', {
          y: 12,
          opacity: 0,
          stagger: 0.025,
          duration: 0.5,
          ease: 'power3.out',
        })
    },
    { scope: root, dependencies: [base, ratio, font, fluid], revertOnUpdate: true },
  )
  return (
    <div className="type-lab-layout" ref={root}>
      <aside className="tool-settings">
        <span className="tool-eyebrow">Set the rhythm</span>
        <label>
          Base size <output aria-hidden="true">{base}px</output>
          <input
            aria-label="Base font size"
            type="range"
            min={12}
            max={24}
            value={base}
            onChange={(event) => setBase(Number(event.target.value))}
          />
        </label>
        <label>
          Scale ratio
          <select value={ratio} onChange={(event) => setRatio(Number(event.target.value))}>
            {[
              [1.125, 'Major second'],
              [1.2, 'Minor third'],
              [1.25, 'Major third'],
              [1.333, 'Perfect fourth'],
              [1.414, 'Augmented fourth'],
              [1.618, 'Golden ratio'],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {value} / {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Typeface
          <select
            value={font}
            onChange={(event) => setFont(event.target.value as keyof typeof fonts)}
          >
            {Object.keys(fonts).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Preview text
          <input
            value={sample}
            maxLength={80}
            onChange={(event) => setSample(event.target.value)}
          />
        </label>
        <label className="tool-check">
          <input
            type="checkbox"
            checked={fluid}
            onChange={(event) => setFluid(event.target.checked)}
          />
          Fluid between 360–1440px
        </label>
        <CopyButton value={css} />
        <button
          className="tool-text-button"
          onClick={() => downloadText(css, 'type-scale.css', 'text/css')}
        >
          Download stylesheet ↓
        </button>
        <p className="tool-small">
          The preview uses the original local typefaces. Supply your own licensed font files when
          using the exported stylesheet elsewhere.
        </p>
      </aside>
      <section
        className="type-specimens"
        aria-label="Typography scale preview"
        style={{ fontFamily: `${fonts[font]}, sans-serif` }}
      >
        {sizes.map((item) => (
          <div className="type-specimen" key={item.name}>
            <div className="type-specimen-meta">
              <span>--text-{item.name}</span>
              <span>
                {fluid && item.minimum !== item.maximum ? `${item.minimum.toFixed(1)}—` : ''}
                {item.maximum.toFixed(1)}px
              </span>
            </div>
            <p style={{ fontSize: item.css, fontFamily: 'inherit' }}>
              {sample || 'Your words here.'}
            </p>
          </div>
        ))}
        <details className="tool-code-details">
          <summary>Inspect generated CSS +</summary>
          <pre tabIndex={0}>
            <code>{css}</code>
          </pre>
        </details>
      </section>
    </div>
  )
}
