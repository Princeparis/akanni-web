'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  makePattern,
  PulseAudio,
  renderLoop,
  rhythmPresets,
  tracks,
  type Pattern,
  type RhythmPreset,
} from '@/lib/pulse-audio'
import { createPulseScene, type PulseScene } from './pulse-scene'
import { saveBlob, useReducedMotion } from './shared'

export default function Pulse() {
  const root = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<PulseScene | null>(null)
  const audio = useRef<PulseAudio | null>(null)
  const reduced = useReducedMotion()
  const [pattern, setPattern] = useState<Pattern>(() => makePattern('After hours'))
  const [muted, setMuted] = useState([false, false, false, false])
  const [preset, setPreset] = useState<string>('After hours')
  const [bpm, setBpm] = useState(110)
  const [bpmDraft, setBpmDraft] = useState('110')
  const [volume, setVolume] = useState(65)
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [starting, setStarting] = useState(false)
  const [shape, setShape] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('Sound starts when you press play. Headphones recommended.')
  const [visualFailed, setVisualFailed] = useState(false)

  useEffect(() => {
    if (!host.current) return
    try {
      scene.current = createPulseScene(host.current)
    } catch {
      setVisualFailed(true)
    }
    return () => {
      scene.current?.destroy()
      scene.current = null
    }
  }, [])
  useEffect(() => {
    scene.current?.setReduced(reduced)
  }, [reduced])
  useEffect(() => {
    scene.current?.setShape(shape)
  }, [shape, reduced])

  useEffect(() => {
    audio.current = new PulseAudio(
      (index, hits) => {
        setStep(index)
        scene.current?.pulse(hits)
      },
      () => {
        setPlaying(false)
        setStep(-1)
        setStatus('Audio was interrupted. Press play to start again.')
      },
    )
    const stopWhenHidden = () => {
      if (document.hidden && audio.current?.playing) {
        audio.current.stop()
        setPlaying(false)
        setStep(-1)
        setStatus('Loop stopped while the tab was hidden. Press play when you’re ready.')
      }
    }
    document.addEventListener('visibilitychange', stopWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden)
      void audio.current?.destroy()
      audio.current = null
    }
  }, [])
  useEffect(() => {
    if (audio.current) audio.current.pattern = pattern
  }, [pattern])
  useEffect(() => {
    if (audio.current) audio.current.muted = muted
  }, [muted])
  useEffect(() => {
    if (audio.current) audio.current.bpm = bpm
  }, [bpm])
  useEffect(() => {
    audio.current?.setVolume(volume / 100)
  }, [volume])

  const { contextSafe } = useGSAP(
    () => {
      if (reduced) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.pulse-title span', { yPercent: 110, duration: 1.2, stagger: 0.07 })
        .from(
          '.pulse-deck, .pulse-visual-label, .pulse-description',
          { opacity: 0, y: 20, duration: 0.9, stagger: 0.12 },
          0.3,
        )
        .from(
          '.pulse-step',
          {
            scale: 0.3,
            opacity: 0,
            duration: 0.5,
            stagger: { amount: 0.55, from: 'start' },
            ease: 'back.out(1.5)',
          },
          0.6,
        )
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  useEffect(() => {
    if (reduced || step < 0) return
    const targets = root.current?.querySelectorAll(
      `.pulse-step[data-step="${step}"][aria-pressed="true"]`,
    )
    if (!targets?.length) return
    const tween = gsap.fromTo(
      targets,
      { scale: 0.84 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' },
    )
    // A new step finishes the preceding pulse at rest. Reverting a GSAP context here
    // would restore a partially animated key-press transform every time the beat changes.
    return () => {
      tween.kill()
      gsap.set(targets, { scale: 1 })
    }
  }, [step, reduced])

  const togglePlayback = async () => {
    if (!audio.current) return
    if (playing) {
      audio.current.stop()
      setPlaying(false)
      setStep(-1)
      setStatus('Loop stopped. Your pattern is ready when you are.')
      return
    }
    setStarting(true)
    try {
      if (await audio.current.start()) {
        setPlaying(true)
        setStatus('Playing your loop. Tap any step to change it live.')
      } else setStatus('Audio could not start. Try pressing play again.')
    } catch {
      setStatus(
        'Audio is unavailable. Try a browser with Web Audio enabled; you can still edit your pattern.',
      )
    } finally {
      setStarting(false)
    }
  }
  const toggleStep = contextSafe((track: number, index: number, button: HTMLButtonElement) => {
    setPattern((previous) =>
      previous.map((row, r) =>
        r === track ? row.map((value, c) => (c === index ? !value : value)) : row,
      ),
    )
    setPreset('Custom pattern')
    if (!reduced)
      gsap.fromTo(
        button,
        { scale: 0.7, rotate: -8 },
        { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, .5)', overwrite: 'auto' },
      )
  })
  const navigateSteps = (event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) => {
    let nextRow = row,
      nextColumn = column
    if (event.key === 'ArrowLeft') nextColumn = (column + 15) % 16
    else if (event.key === 'ArrowRight') nextColumn = (column + 1) % 16
    else if (event.key === 'ArrowUp') nextRow = (row + 3) % 4
    else if (event.key === 'ArrowDown') nextRow = (row + 1) % 4
    else if (event.key === 'Home') nextColumn = 0
    else if (event.key === 'End') nextColumn = 15
    else return
    event.preventDefault()
    root.current
      ?.querySelector<HTMLButtonElement>(`[data-track="${nextRow}"][data-step="${nextColumn}"]`)
      ?.focus()
  }
  const exportLoop = async () => {
    setExporting(true)
    const exportBpm = bpm
    try {
      const blob = await renderLoop(pattern, muted, exportBpm, volume / 100)
      saveBlob(blob, `pulse-${exportBpm}bpm.wav`)
      setStatus(
        `Saved one 4/4 bar at ${exportBpm} BPM as a stereo, 44.1 kHz WAV. Your pattern, made portable.`,
      )
    } catch {
      setStatus(
        'This browser could not render a WAV. Try another browser with Offline Audio support.',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <main id="main" className="immersive-app pulse-app" ref={root}>
      <header className="immersive-nav">
        <Link href="/playground">↖ All experiments</Link>
        <span>Independent instrument / 008</span>
        <Link href="/playground/matter">Explore Matter ↗</Link>
      </header>
      <section className="pulse-heading">
        <div>
          <span className="immersive-eyebrow">A rhythm you can see</span>
          <h1 className="pulse-title" aria-label="Pulse">
            {'Pulse'.split('').map((letter, index) => (
              <span key={index} aria-hidden="true">
                {letter}
              </span>
            ))}
            <i aria-hidden="true">●</i>
          </h1>
        </div>
        <div className="pulse-description">
          <p>
            Make a little noise.
            <br />
            Leave a little something.
          </p>
          <span className="immersive-eyebrow">Four voices. Sixteen steps. Infinite detours.</span>
        </div>
      </section>

      <section className="pulse-visual" aria-label="Audio-reactive particle sculpture">
        <div className="pulse-render-host" ref={host} />
        <div className="pulse-visual-label">
          <span className={playing ? 'live-dot is-playing' : 'live-dot'} />
          {playing ? 'Sound in motion' : 'Waiting for your rhythm'}
          <small>Move to bend / tap to scatter</small>
        </div>
        <div className="pulse-visual-counter" aria-hidden="true">
          <span>{playing ? String(Math.floor(step / 4) + 1).padStart(2, '0') : '00'}</span> / 04
        </div>
        <div className="pulse-shape-picker" aria-label="Particle shape">
          {['Orbit', 'Cloud', 'Wave'].map((name, index) => (
            <button key={name} aria-pressed={shape === index} onClick={() => setShape(index)}>
              {name}
            </button>
          ))}
          <button
            aria-label="Scatter particles"
            disabled={reduced}
            onClick={() => scene.current?.scatter()}
          >
            ↗
          </button>
        </div>
        {visualFailed && (
          <div className="pulse-visual-fallback">
            <span aria-hidden="true">◎</span>
            <p>
              Particle rendering needs WebGL 2.
              <br />
              Your rhythm machine still works below.
            </p>
          </div>
        )}
        <span className="pulse-visual-signature" aria-hidden="true">
          P / {reduced ? 'STILL' : 'LIVE'}
        </span>
      </section>

      <section className="pulse-deck" aria-label="Rhythm sequencer">
        <div className="pulse-transport">
          <button
            className="pulse-play"
            onClick={togglePlayback}
            disabled={starting}
            aria-pressed={playing}
            aria-label={playing ? 'Stop loop' : 'Play loop'}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              {playing ? <path d="M3 3h10v10H3z" /> : <path d="M4 2l10 6-10 6z" />}
            </svg>
            {starting ? 'Starting…' : playing ? 'Stop' : 'Play the loop'}
          </button>
          <label className="pulse-tempo">
            <span>BPM</span>
            <input
              aria-label="Tempo"
              type="number"
              min="55"
              max="180"
              value={bpmDraft}
              onChange={(event) => {
                const text = event.target.value
                setBpmDraft(text)
                const value = Number(text)
                if (text && Number.isFinite(value) && value >= 55 && value <= 180) setBpm(value)
              }}
              onBlur={() => {
                const value = Number(bpmDraft)
                const next =
                  bpmDraft && Number.isFinite(value)
                    ? Math.max(55, Math.min(180, Math.round(value)))
                    : bpm
                setBpm(next)
                setBpmDraft(String(next))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
              }}
            />
          </label>
          <label className="pulse-volume">
            <span>
              Volume <output>{volume}%</output>
            </span>
            <input
              type="range"
              aria-label="Volume"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>
          <label className="pulse-preset">
            <span>Starting point</span>
            <select
              aria-label="Rhythm preset"
              value={preset}
              onChange={(event) => {
                const value = event.target.value as RhythmPreset
                setPattern(makePattern(value))
                setPreset(value)
                setStatus(`${value} loaded. Make it your own.`)
              }}
            >
              {preset === 'Custom pattern' && <option>Custom pattern</option>}
              {Object.keys(rhythmPresets).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <button className="pulse-export" onClick={exportLoop} disabled={exporting}>
            {exporting ? 'Rendering…' : 'Export WAV'}
            <span>↗</span>
          </button>
        </div>
        <div className="pulse-sequencer">
          <div className="pulse-beat-numbers" aria-hidden="true">
            <span>VOICE / MUTE</span>
            <div>
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} data-current={i === step}>
                  {i % 4 === 0 ? String(i / 4 + 1).padStart(2, '0') : '·'}
                </span>
              ))}
            </div>
          </div>
          {tracks.map((name, track) => (
            <div
              className={`pulse-track pulse-track-${track}${muted[track] ? ' is-muted' : ''}`}
              key={name}
            >
              <button
                className="pulse-track-name"
                aria-label={`Mute ${name}`}
                aria-pressed={muted[track]}
                onClick={() =>
                  setMuted((previous) => previous.map((value, i) => (i === track ? !value : value)))
                }
              >
                <span aria-hidden="true">0{track + 1}</span>
                {name}
                <i aria-hidden="true" />
              </button>
              <div className="pulse-step-row" role="group" aria-label={`${name} sequence`}>
                {pattern[track].map((active, index) => (
                  <button
                    key={index}
                    className="pulse-step"
                    data-track={track}
                    data-step={index}
                    data-current={index === step}
                    data-quarter={index % 4 === 0}
                    aria-label={`${name} step ${index + 1}`}
                    aria-pressed={active}
                    onClick={(event) => toggleStep(track, index, event.currentTarget)}
                    onKeyDown={(event) => navigateSteps(event, track, index)}
                  >
                    <span aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="pulse-mobile-hint">Each voice: steps 01–08, then 09–16.</p>
        <div className="pulse-deck-foot">
          <span>16 steps / 4 voices / 1 bar</span>
          <button
            onClick={() => {
              setPattern(makePattern('Blank canvas'))
              setPreset('Blank canvas')
              setStatus('A blank canvas. Tap a step to begin.')
            }}
          >
            Clear pattern ↺
          </button>
        </div>
      </section>
      <div className="immersive-status" role="status">
        {status}
      </div>
      <section className="immersive-notes pulse-notes">
        <div>
          <span className="immersive-eyebrow">Behind the rhythm</span>
          <h2>
            Sound, meet
            <br />
            something else.
          </h2>
        </div>
        <div>
          <p>
            This is a small synthesizer, not a playlist. Web Audio creates every kick, snare, hat,
            and melodic note. A look-ahead clock keeps the rhythm steady; GSAP turns each voice into
            a different force on thousands of WebGL particles.
          </p>
          <p>
            Click or tap steps to compose. Arrow keys move between steps; Space toggles the focused
            step. Mute voices, change tempo, or start from a preset. WAV export renders one bar
            locally with the same sounds and volume. Audio stops when you leave the tab. Reduced
            motion keeps the sculpture still while every music control stays usable.
          </p>
          <Link href="/playground/matter">A quieter kind of play. Explore Matter ↗</Link>
        </div>
      </section>
    </main>
  )
}
