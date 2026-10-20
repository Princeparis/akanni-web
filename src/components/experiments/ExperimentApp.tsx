'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { experiments } from '@/data/experiments'
import CanvasScene from './CanvasScene'
import './experiments.css'

const controls = {
  'flow-field': [
    { label: 'Field complexity', min: 4, max: 32, step: 1, initial: 12 },
    { label: 'Particle speed', min: 0.3, max: 3, step: 0.1, initial: 1.2 },
  ],
  moire: [
    { label: 'Ring spacing', min: 4, max: 18, step: 0.5, initial: 8 },
    { label: 'Separation', min: 15, max: 240, step: 1, initial: 130 },
  ],
  'spring-grid': [
    { label: 'Stiffness', min: 8, max: 100, step: 1, initial: 34 },
    { label: 'Damping', min: 1, max: 14, step: 0.5, initial: 4 },
  ],
} as const

export default function ExperimentApp({
  experiment,
}: {
  experiment: (typeof experiments)[number]
}) {
  const sliders = controls[experiment.slug]
  const [settings, setSettings] = useState({
    a: sliders[0].initial as number,
    b: sliders[1].initial as number,
    seed: 1,
    inverted: false,
  })
  const [playing, setPlaying] = useState(false)
  const [status, setStatus] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPlaying(!media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const next =
    experiments[
      (experiments.findIndex((item) => item.slug === experiment.slug) + 1) % experiments.length
    ]
  const save = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) {
        setStatus('Could not save the frame. Please try again.')
        return
      }
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${experiment.slug}-${settings.seed}.png`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('Frame saved as a PNG.')
    }, 'image/png')
  }
  return (
    <main id="main" className={`experiment-app experiment-${experiment.slug}`}>
      <header className="experiment-bar">
        <Link href="/playground">← All experiments</Link>
        <span>Independent studies / {experiment.number}</span>
        <a href="#experiment-notes">How it works ↙</a>
      </header>
      <section className="experiment-heading">
        <div>
          <span className="experiment-kicker">
            {experiment.medium} / Study {experiment.number}
          </span>
          <h1>{experiment.title}</h1>
        </div>
        <p>{experiment.introduction}</p>
      </section>
      <section className="experiment-instrument" aria-label={`${experiment.title} instrument`}>
        <div className="experiment-stage">
          <CanvasScene
            kind={experiment.slug}
            settings={settings}
            playing={playing}
            canvasRef={canvas}
          />
          <span className="canvas-caption" aria-hidden="true">
            {experiment.slug === 'spring-grid'
              ? 'Move to pull · Click to ripple'
              : experiment.slug === 'moire'
                ? 'Move to shift the pattern'
                : 'Move to bend the current'}
          </span>
          <span className="canvas-state">{playing ? 'Live' : 'Paused'}</span>
        </div>
        <div className="experiment-controls">
          <div className="experiment-sliders">
            {sliders.map((control, index) => (
              <label key={control.label} htmlFor={`experiment-control-${index}`}>
                <span>
                  {control.label}
                  <output aria-hidden="true">{index === 0 ? settings.a : settings.b}</output>
                </span>
                <input
                  id={`experiment-control-${index}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={index === 0 ? settings.a : settings.b}
                  onChange={(event) =>
                    setSettings((value) => ({
                      ...value,
                      [index === 0 ? 'a' : 'b']: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="experiment-buttons">
            <button
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? 'Pause experiment' : 'Play experiment'}
              aria-pressed={playing}
            >
              {playing ? 'Ⅱ Pause' : '▷ Play'}
            </button>
            <button onClick={() => setSettings((value) => ({ ...value, seed: value.seed + 1 }))}>
              {experiment.slug === 'flow-field'
                ? '↻ Reseed'
                : experiment.slug === 'spring-grid'
                  ? '↻ Disturb'
                  : '↻ Shift'}
            </button>
            <button
              onClick={() => setSettings((value) => ({ ...value, inverted: !value.inverted }))}
              aria-pressed={settings.inverted}
            >
              ◐ Invert
            </button>
            <button onClick={save}>Save PNG ↗</button>
          </div>
        </div>
      </section>
      <div className="experiment-help">
        <p>
          {experiment.interaction} Motion starts paused when your device requests reduced motion.
        </p>
        <span role="status">{status}</span>
      </div>
      <section className="experiment-notes" id="experiment-notes">
        <div>
          <span className="experiment-kicker">A look under the surface</span>
          <h2>
            Simple rules.
            <br />
            Unexpected results.
          </h2>
          <p>{experiment.principle}</p>
          <div className="experiment-concepts">
            {experiment.concepts.map((concept) => (
              <span key={concept}>{concept}</span>
            ))}
          </div>
        </div>
        <div className="experiment-code">
          <span className="experiment-kicker">The idea in code / JavaScript</span>
          <pre>
            <code>{experiment.code}</code>
          </pre>
          <p>{experiment.equation}</p>
        </div>
      </section>
      <footer className="experiment-end">
        <Link href="/playground">← Back to the collection</Link>
        <Link href={`/playground/${next.slug}`}>Next study: {next.title} ↗</Link>
      </footer>
    </main>
  )
}
