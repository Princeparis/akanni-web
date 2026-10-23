'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  createMatterScene,
  finishes,
  type MatterFinish,
  type MatterForm,
  type MatterScene,
} from './matter-scene'
import { saveBlob, useReducedMotion } from './shared'

function Star() {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 2v36M2 20h36M7 7l26 26M7 33L33 7" />
    </svg>
  )
}

export default function Matter() {
  const root = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<MatterScene | null>(null)
  const reduced = useReducedMotion()
  const [form, setForm] = useState<MatterForm>('Knot')
  const [finish, setFinish] = useState<MatterFinish>('Chrome')
  const [roughness, setRoughness] = useState(18)
  const [light, setLight] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const [view, setView] = useState<'Perspective' | 'Front' | 'Above'>('Perspective')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!host.current) return
    setFailed(false)
    setReady(false)
    try {
      scene.current = createMatterScene(host.current, () => {
        setFailed(true)
        setReady(false)
      })
      setReady(true)
    } catch {
      setFailed(true)
    }
    return () => {
      scene.current?.destroy()
      scene.current = null
    }
  }, [retry])
  useEffect(() => {
    scene.current?.setReduced(reduced)
  }, [reduced, ready])
  useEffect(() => {
    scene.current?.setForm(form)
  }, [form, ready])
  useEffect(() => {
    scene.current?.setFinish(finish)
  }, [finish, ready])
  useEffect(() => {
    scene.current?.setRoughness(roughness / 100)
  }, [roughness, ready])
  useEffect(() => {
    scene.current?.setLight(light)
  }, [light, ready])
  useEffect(() => {
    scene.current?.setSpinning(spinning)
  }, [spinning, ready])
  useEffect(() => {
    scene.current?.view(view)
  }, [view, ready])

  useGSAP(
    () => {
      if (reduced) return
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .from('.matter-title span', { yPercent: 110, rotate: 4, duration: 1.25, stagger: 0.055 })
        .from(
          '.matter-intro, .matter-controls, .matter-stage-label',
          { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 },
          0.35,
        )
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  const capture = async () => {
    if (!scene.current) return
    setExporting(true)
    try {
      const blob = await scene.current.capture()
      if (!blob) throw new Error('No frame')
      saveBlob(blob, `matter-${form.toLowerCase()}-${finish.toLowerCase()}.png`)
      setStatus('Your sculpture is saved as a PNG. Make another?')
    } catch {
      setStatus('The frame could not be saved. Try again or reload the studio.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <main id="main" className="immersive-app matter-app" ref={root}>
      <header className="immersive-nav">
        <Link href="/playground">↖ All experiments</Link>
        <span>Independent instrument / 007</span>
        <Link href="/playground/pulse">Next: Pulse ↗</Link>
      </header>
      <section className="matter-heading">
        <div>
          <span className="immersive-eyebrow">A study in light, form & feeling</span>
          <h1 className="matter-title" aria-label="Matter">
            {'Matter'.split('').map((letter, index) => (
              <span aria-hidden="true" key={index}>
                {letter}
              </span>
            ))}
            <sup>07</sup>
          </h1>
        </div>
        <div className="matter-intro">
          <span className="matter-symbol">
            <Star />
          </span>
          <p>
            Something impossible.
            <br />
            Something you can touch.
          </p>
          <span className="immersive-eyebrow">A small sculpture studio, in your browser.</span>
        </div>
      </section>

      <section className="matter-workspace" aria-label="3D sculpture studio">
        <div className="matter-stage" data-lenis-prevent data-ready={ready}>
          <div ref={host} className="matter-render-host" />
          <div className="matter-stage-label">
            <span className="live-dot" /> Real-time sculpture
          </div>
          <span className="matter-specimen" aria-hidden="true">
            FORM — {String(['Knot', 'Bloom', 'Orbit'].indexOf(form) + 1).padStart(2, '0')}
            <br />
            {form.toUpperCase()} / {finish.toUpperCase()}
          </span>
          <div className="matter-orientation" aria-hidden="true">
            <i />Y<span>X</span>
            <b>Z</b>
          </div>
          <div className="matter-stage-bottom">
            <p>Drag to turn. Scroll or pinch to get closer.</p>
            <div className="matter-view-actions">
              <button disabled={!ready} onClick={() => scene.current?.zoom(1)} aria-label="Zoom in">
                +
              </button>
              <button
                disabled={!ready}
                onClick={() => scene.current?.zoom(-1)}
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                disabled={!ready}
                onClick={() => {
                  scene.current?.resetView()
                  setView('Perspective')
                }}
                aria-label="Reset view"
              >
                ↺
              </button>
            </div>
          </div>
          {!ready && !failed && (
            <div className="matter-stage-message" role="status">
              Casting a little light…
            </div>
          )}
          {failed && (
            <div className="matter-stage-message" role="alert">
              <span>
                3D needs WebGL 2.
                <br />
                Enable hardware acceleration or try another browser.
              </span>
              <button onClick={() => setRetry((value) => value + 1)}>Retry the studio ↗</button>
            </div>
          )}
        </div>

        <aside className="matter-controls" aria-label="Sculpture settings">
          <div className="matter-control-heading">
            <span className="immersive-eyebrow">Make it yours</span>
            <span aria-hidden="true">↙</span>
          </div>
          <fieldset disabled={!ready}>
            <legend>
              <span>01</span> The form
            </legend>
            <div className="matter-form-options">
              {(['Knot', 'Bloom', 'Orbit'] as const).map((value) => (
                <button key={value} aria-pressed={form === value} onClick={() => setForm(value)}>
                  <span aria-hidden="true">
                    {value === 'Knot' ? '∞' : value === 'Bloom' ? <Star /> : '◎'}
                  </span>
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={!ready}>
            <legend>
              <span>02</span> The surface
            </legend>
            <div className="matter-finish-options">
              {(Object.keys(finishes) as MatterFinish[]).map((value) => (
                <button
                  key={value}
                  aria-pressed={finish === value}
                  onClick={() => {
                    setFinish(value)
                    setRoughness(Math.round(finishes[value].roughness * 100))
                  }}
                >
                  <i className={`finish-${value.toLowerCase()}`} />
                  <span>{value}</span>
                  <b aria-hidden="true">{finish === value ? '●' : '○'}</b>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="matter-tuning" disabled={!ready}>
            <legend>
              <span>03</span> The feeling
            </legend>
            <label>
              <span>
                Roughness <output>{roughness}%</output>
              </span>
              <input
                type="range"
                aria-label="Surface roughness"
                min="0"
                max="100"
                value={roughness}
                onChange={(event) => setRoughness(Number(event.target.value))}
              />
            </label>
            <label>
              <span>
                Studio light <output>{light}°</output>
              </span>
              <input
                type="range"
                aria-label="Studio light angle"
                min="-180"
                max="180"
                value={light}
                onChange={(event) => setLight(Number(event.target.value))}
              />
            </label>
          </fieldset>
          <fieldset disabled={!ready}>
            <legend>
              <span>04</span> The perspective
            </legend>
            <div className="matter-camera-options">
              {(['Perspective', 'Front', 'Above'] as const).map((value) => (
                <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>
                  {value}
                </button>
              ))}
            </div>
            <button
              className="matter-rotation"
              aria-pressed={spinning && !reduced}
              disabled={reduced}
              onClick={() => setSpinning((value) => !value)}
            >
              <span>
                {reduced
                  ? 'Reduced motion · rotation off'
                  : spinning
                    ? 'Ⅱ Pause rotation'
                    : '▷ Auto-rotate'}
              </span>
              <i aria-hidden="true" />
            </button>
          </fieldset>
          <button className="matter-export" disabled={!ready || exporting} onClick={capture}>
            {exporting ? 'Capturing…' : 'Capture your object'}
            <span>PNG ↗</span>
          </button>
        </aside>
      </section>
      <div className="immersive-status" role="status">
        {status || 'Made by you. Rendered here. Saved wherever you like.'}
      </div>
      <section className="immersive-notes matter-notes" id="matter-notes">
        <div>
          <span className="immersive-eyebrow">Behind the object</span>
          <h2>
            A little form.
            <br />A lot of possibility.
          </h2>
        </div>
        <div>
          <p>
            Three procedural forms, shaped in real time. A physically based material reflects a
            virtual studio, while GSAP choreographs each change of form, surface, and camera.
            Nothing here is a pre-rendered video.
          </p>
          <p>
            Drag or swipe the object to orbit. Focus the canvas and use arrow keys to rotate, + / −
            to zoom, and 0 to reset. Capture exports your current view at the canvas resolution.
            Your device’s reduced-motion preference turns off automatic rotation and transitions.
          </p>
          <Link href="/playground/pulse">Now, make a little noise. Explore Pulse ↗</Link>
        </div>
      </section>
    </main>
  )
}
