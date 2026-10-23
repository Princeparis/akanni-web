'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { contrast, hslToHex, makePalette, normalizeHex } from '@/lib/creative-tools'
import { CopyButton, downloadText, reducedMotion } from './shared'
export default function PaletteStudio() {
  const root = useRef<HTMLDivElement>(null)
  const [base, setBase] = useState('#ba784c'),
    [harmony, setHarmony] = useState('Analogous')
  const [colors, setColors] = useState(() => makePalette('#ba784c', 'Analogous'))
  const [locked, setLocked] = useState<boolean[]>(Array(6).fill(false)),
    [status, setStatus] = useState(''),
    [revision, setRevision] = useState(0)
  useGSAP(
    () => {
      if (!reducedMotion())
        gsap.from('.palette-swatch', {
          y: 35,
          opacity: 0,
          stagger: 0.045,
          duration: 0.65,
          ease: 'expo.out',
        })
    },
    { scope: root, dependencies: [revision], revertOnUpdate: true },
  )
  function generate(hex = base, nextHarmony = harmony) {
    const normalized = normalizeHex(hex)
    if (!normalized) {
      setStatus('Enter a three- or six-digit hex color.')
      return
    }
    setBase(normalized)
    setHarmony(nextHarmony)
    const next = makePalette(normalized, nextHarmony)
    setColors((previous) => next.map((color, index) => (locked[index] ? previous[index] : color)))
    setRevision((value) => value + 1)
    setStatus(locked.every(Boolean) ? 'All colors are locked. Unlock one to explore.' : '')
  }
  const css = `:root {\n${colors.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n')}\n}`
  return (
    <div ref={root} className="palette-studio">
      <div className="tool-toolbar">
        <label>
          Base color
          <input
            aria-label="Base color"
            value={base}
            maxLength={7}
            onChange={(event) => setBase(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') generate()
            }}
          />
        </label>
        <button className="tool-button" onClick={() => generate()}>
          Apply color
        </button>
        <label>
          Color harmony
          <select value={harmony} onChange={(event) => generate(base, event.target.value)}>
            {['Analogous', 'Complementary', 'Triadic', 'Monochrome'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          className="tool-button tool-button-dark"
          onClick={() =>
            generate(
              hslToHex(Math.random() * 360, 25 + Math.random() * 40, 40 + Math.random() * 25),
            )
          }
        >
          Shuffle palette ↻
        </button>
      </div>
      <div className="palette-swatches">
        {colors.map((color, index) => {
          const white = contrast(color, '#ffffff'),
            dark = contrast(color, '#171717'),
            ink = white > dark ? '#ffffff' : '#171717',
            ratio = Math.max(white, dark)
          return (
            <div className="palette-swatch" key={index} style={{ background: color, color: ink }}>
              <div className="palette-swatch-top">
                <span>0{index + 1}</span>
                <button
                  aria-label={`${locked[index] ? 'Unlock' : 'Lock'} color ${index + 1}`}
                  aria-pressed={locked[index]}
                  onClick={() =>
                    setLocked((values) =>
                      values.map((value, position) => (position === index ? !value : value)),
                    )
                  }
                >
                  {locked[index] ? 'Locked ↗' : 'Lock +'}
                </button>
              </div>
              <span className="palette-letter" aria-hidden="true">
                Aa
              </span>
              <div className="palette-swatch-bottom">
                <button
                  aria-label={`Copy ${color}`}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color)
                      setStatus(`${color} copied.`)
                    } catch {
                      setStatus(`Select and copy ${color}.`)
                    }
                  }}
                >
                  {color} ↗
                </button>
                <small>
                  {ratio.toFixed(2)}:1 · {ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Large text'}
                  <br />
                  with {ink === '#ffffff' ? 'white' : 'dark'} text
                </small>
              </div>
            </div>
          )
        })}
      </div>
      <p className="tool-status" role="status">
        {status}
      </p>
      <div className="palette-export">
        <div>
          <span className="tool-eyebrow">A system, ready to go</span>
          <h2>
            Good colors.
            <br />
            Better together.
          </h2>
          <p>
            Lock the colors you love before shuffling. Contrast ratings help you choose readable
            text; they don’t certify a whole interface.
          </p>
          <CopyButton value={css} />
          <button
            className="tool-text-button"
            onClick={() =>
              downloadText(
                JSON.stringify({ name: 'Spectrum palette', colors }, null, 2),
                'spectrum-palette.json',
                'application/json',
              )
            }
          >
            Download JSON ↓
          </button>
        </div>
        <pre tabIndex={0}>
          <code>{css}</code>
        </pre>
      </div>
    </div>
  )
}
