'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ibadanChapters, ibadanEdition, ibadanReferences } from '@/data/ibadan'
import { BrandMark } from '@/components/Brand'
import { IbadanAudio } from './ibadan-audio'
import type { IbadanScene } from './ibadan-scene'
import './ibadan.css'

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {on ? (
        <path
          d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ) : (
        <path d="m16 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  )
}

export default function IbadanExperience() {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<IbadanScene | null>(null)
  const audio = useRef<IbadanAudio | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const story = useRef<HTMLHeadingElement>(null)
  const active = useRef(0)
  const entered = useRef(false)
  const soundWanted = useRef(true)
  const lastWheel = useRef(0)
  const wheelDistance = useRef(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const [started, setStarted] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [sound, setSound] = useState(false)
  const [soundPreference, setSoundPreference] = useState(true)
  const [audioNotice, setAudioNotice] = useState('')
  const [reduced, setReduced] = useState(false)
  const [paused, setPaused] = useState(false)
  const [inspect, setInspect] = useState(false)
  const [released, setReleased] = useState(false)
  const [panel, setPanel] = useState<'chapters' | 'notes' | null>(null)
  const current = ibadanChapters[chapter]

  useEffect(() => {
    const ambience = new IbadanAudio()
    audio.current = ambience
    const visibility = () => {
      if (document.hidden) {
        ambience.pause()
        setSound(false)
      } else if (entered.current && soundWanted.current) void ambience.start().then(setSound)
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      ambience.dispose()
      audio.current = null
    }
  }, [])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReduced(media.matches)
      scene.current?.setReduced(media.matches)
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setReady(false)
    void import('./ibadan-scene')
      .then(({ createIbadanScene }) => {
        if (cancelled || !host.current) return
        try {
          const engine = createIbadanScene(host.current, () => {
            setFailed(true)
            setReady(false)
          })
          scene.current = engine
          engine.setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches)
          if (entered.current) engine.setChapter(active.current)
          setReady(true)
        } catch {
          setFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      scene.current?.destroy()
      scene.current = null
    }
  }, [retry])

  useEffect(() => {
    scene.current?.setInspect(inspect)
  }, [inspect, ready])
  useEffect(() => {
    scene.current?.setPaused(paused)
  }, [paused, ready])
  useEffect(() => {
    scene.current?.release(released)
  }, [released, ready])

  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(ibadanChapters.length - 1, index))
    if (next === active.current) return
    active.current = next
    setChapter(next)
    setReleased(false)
    scene.current?.setChapter(next)
    audio.current?.setChapter(next)
  }, [])

  useEffect(() => {
    if (!started) return
    const keydown = (event: KeyboardEvent) => {
      if (dialog.current?.open) return
      if (event.key === 'Escape') {
        setInspect(false)
        setReleased(false)
        return
      }
      if ((event.target as HTMLElement).closest('button, a, input')) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        go(active.current + 1)
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        go(active.current - 1)
      }
      if (event.key === 'Home') {
        event.preventDefault()
        go(0)
      }
      if (event.key === 'End') {
        event.preventDefault()
        go(ibadanChapters.length - 1)
      }
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [started, go])

  useEffect(() => {
    if (panel) dialog.current?.showModal()
    else dialog.current?.close()
  }, [panel])

  const begin = () => {
    entered.current = true
    setStarted(true)
    scene.current?.setChapter(0)
    if (soundWanted.current)
      void audio.current?.start().then((playing) => {
        setSound(playing)
        if (!playing)
          setAudioNotice('Sound is unavailable on this device. The journey continues silently.')
      })
    requestAnimationFrame(() => story.current?.focus({ preventScroll: true }))
  }
  const toggleSound = () => {
    const wanted = started ? !sound : !soundWanted.current
    soundWanted.current = wanted
    setSoundPreference(wanted)
    setAudioNotice('')
    if (!started) return
    if (!wanted) {
      audio.current?.stop()
      setSound(false)
    } else
      void audio.current?.start().then((playing) => {
        setSound(playing)
        if (!playing) setAudioNotice('Audio could not start. You can continue silently.')
      })
  }

  return (
    <main
      id="main"
      className={`ibadan-app${started ? ' has-entered' : ''}${inspect ? ' is-inspecting' : ''}${reduced ? ' is-reduced' : ''}`}
      style={
        {
          '--ibadan-accent': current.accent,
          '--ibadan-chapters': ibadanChapters.length,
        } as CSSProperties
      }
      data-lenis-prevent
      data-chapter={current.id}
      data-ready={ready}
      tabIndex={-1}
      onWheel={(event) => {
        if (
          !started ||
          panel ||
          inspect ||
          event.ctrlKey ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
        )
          return
        const now = performance.now()
        if (now - lastWheel.current < 1100) return
        wheelDistance.current += event.deltaY
        if (Math.abs(wheelDistance.current) > 95) {
          go(active.current + Math.sign(wheelDistance.current))
          lastWheel.current = now
          wheelDistance.current = 0
        }
      }}
    >
      <div className="ibadan-atmosphere" aria-hidden="true" />
      <div className="ibadan-stage" ref={host} aria-hidden={failed} />
      <div className="ibadan-vignette" aria-hidden="true" />
      <div className="ibadan-grain" aria-hidden="true" />
      <header className="ibadan-header">
        <Link href="/" className="ibadan-brand" aria-label="Return to Rayab portfolio">
          <BrandMark />
          <span>
            Rayab<span>Places we carry / 001</span>
          </span>
        </Link>
        <span className="ibadan-header-title">
          Ibadan <i /> A living memory
        </span>
        <div className="ibadan-header-actions">
          {started && (
            <button
              onClick={toggleSound}
              aria-label={sound ? 'Mute Ibadan soundscape' : 'Enable Ibadan soundscape'}
              aria-pressed={sound}
            >
              <SoundIcon on={sound} />
              <span>Sound {sound ? 'on' : 'off'}</span>
            </button>
          )}
          <Link href="/" className="ibadan-exit">
            Exit <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {!started ? (
        <section className="ibadan-intro" aria-labelledby="ibadan-title">
          <span className="ibadan-eyebrow ibadan-intro-kicker">
            <i /> A place. A people. A living memory.
          </span>
          <h1 id="ibadan-title">
            Ìbàdàn
            <span>
              A city, carried
              <br />
              in <em>memory.</em>
            </span>
          </h1>
          <p>
            From the first gathering to a city still becoming.
            <br />
            History, held in a thousand points of light.
          </p>
          <div className="ibadan-entry-actions">
            <button className="ibadan-enter" onClick={begin}>
              Begin the journey <span aria-hidden="true">↗</span>
            </button>
            <button
              className="ibadan-entry-sound"
              onClick={toggleSound}
              aria-label="Entry soundscape"
              aria-pressed={soundPreference}
            >
              <SoundIcon on={soundPreference} />
              {soundPreference ? 'Soundscape on' : 'Soundscape off'}
            </button>
          </div>
          <span className="ibadan-edition">{ibadanEdition.status}</span>
        </section>
      ) : (
        <>
          <section
            className="ibadan-story"
            aria-labelledby="ibadan-chapter-title"
            onTouchStart={(event) => {
              touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
            }}
            onTouchEnd={(event) => {
              if (!touch.current) return
              const dx = event.changedTouches[0].clientX - touch.current.x,
                dy = event.changedTouches[0].clientY - touch.current.y
              if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5)
                go(active.current + (dx < 0 ? 1 : -1))
              touch.current = null
            }}
          >
            <div className="ibadan-story-copy" key={current.id}>
              <span className="ibadan-eyebrow">
                <span className="ibadan-chapter-number">
                  {String(chapter + 1).padStart(2, '0')}
                </span>{' '}
                / {current.period}
              </span>
              <h2 id="ibadan-chapter-title" ref={story} tabIndex={-1}>
                {current.title.split('\n').map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p>{current.text}</p>
              <button className="ibadan-text-action" onClick={() => setPanel('notes')}>
                Open the field notes <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
          <div className="ibadan-object-label">
            <span className="ibadan-eyebrow">In the particle archive</span>
            <strong>{current.object}</strong>
            <span>Drag to turn · Hold to disperse</span>
          </div>
          <div className="ibadan-scene-controls" aria-label="Sculpture controls">
            <button onClick={() => setInspect(!inspect)} aria-pressed={inspect}>
              {inspect ? 'Return to story' : 'Inspect object'}{' '}
              <span aria-hidden="true">{inspect ? '−' : '+'}</span>
            </button>
            <button onClick={() => setReleased(!released)} aria-pressed={released}>
              {released ? 'Gather particles' : 'Release particles'}{' '}
              <span aria-hidden="true">⤢</span>
            </button>
            {inspect && (
              <>
                <button onClick={() => scene.current?.rotate(-1)} aria-label="Rotate object left">
                  ↶
                </button>
                <button onClick={() => scene.current?.rotate(1)} aria-label="Rotate object right">
                  ↷
                </button>
                <button onClick={() => scene.current?.reset()}>Reset view</button>
              </>
            )}
            <button
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
              aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
            >
              {paused ? 'Play' : 'Pause'} <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
            </button>
          </div>
          <nav className="ibadan-timeline" aria-label="Ibadan chapters">
            <div className="ibadan-timeline-heading">
              <span className="ibadan-eyebrow">A journey in {ibadanChapters.length} chapters</span>
              <button onClick={() => setPanel('chapters')}>
                Chapter index <span aria-hidden="true">⊞</span>
              </button>
            </div>
            <ol>
              {ibadanChapters.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => go(index)}
                    aria-label={`Chapter ${index + 1}: ${item.label}`}
                    aria-current={chapter === index ? 'step' : undefined}
                  >
                    <span className="ibadan-tick">
                      <i />
                    </span>
                    <span className="ibadan-timeline-label">{item.label}</span>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <footer className="ibadan-bottom">
            <span className="ibadan-travel-hint">
              Scroll to travel <span aria-hidden="true">↓</span>
              <span>or use ← →</span>
            </span>
            <div>
              <button
                onClick={() => go(chapter - 1)}
                disabled={chapter === 0}
                aria-label="Previous chapter"
              >
                ←
              </button>
              <span aria-live="polite" aria-atomic="true">
                {String(chapter + 1).padStart(2, '0')}{' '}
                <i>/ {String(ibadanChapters.length).padStart(2, '0')}</i>
                <span className="sr-only">{current.label}</span>
              </span>
              <button
                onClick={() => go(chapter === ibadanChapters.length - 1 ? 0 : chapter + 1)}
                aria-label={
                  chapter === ibadanChapters.length - 1 ? 'Restart the journey' : 'Next chapter'
                }
              >
                {chapter === ibadanChapters.length - 1 ? '↺' : '→'}
              </button>
            </div>
            <button className="ibadan-edition-button" onClick={() => setPanel('notes')}>
              About this edition ↗
            </button>
          </footer>
        </>
      )}

      {(!ready || failed) && (
        <div className={`ibadan-render-status${failed ? ' is-fallback' : ''}`} role="status">
          {failed ? (
            <>
              <span>The particle view is unavailable on this device.</span>
              <span>The complete text journey and chapter controls still work.</span>
              <button onClick={() => setRetry(retry + 1)}>Retry the particle view ↗</button>
            </>
          ) : (
            'Gathering the particles…'
          )}
        </div>
      )}
      {audioNotice && (
        <p className="ibadan-audio-notice" role="status">
          {audioNotice}
          <button onClick={() => setAudioNotice('')} aria-label="Dismiss audio notice">
            ×
          </button>
        </p>
      )}

      <dialog
        className="ibadan-dialog"
        ref={dialog}
        aria-labelledby="ibadan-panel-title"
        onClose={() => setPanel(null)}
        onCancel={() => setPanel(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPanel(null)
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const buttons = dialog.current?.querySelectorAll<HTMLElement>('button, a[href]')
          if (!buttons?.length) return
          const first = buttons[0],
            last = buttons[buttons.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }}
      >
        <div className="ibadan-panel" data-lenis-prevent>
          <div className="ibadan-panel-top">
            <span className="ibadan-eyebrow">Ibadan / A living memory</span>
            <button onClick={() => setPanel(null)} aria-label="Close panel">
              Close ×
            </button>
          </div>
          <h2 id="ibadan-panel-title">
            {panel === 'chapters' ? 'Find your way.' : 'A closer look.'}
          </h2>
          {panel === 'chapters' ? (
            <>
              <p>Follow the journey, or enter wherever your curiosity takes you.</p>
              <ol className="ibadan-chapter-index">
                {ibadanChapters.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        go(index)
                        setPanel(null)
                      }}
                      aria-current={chapter === index ? 'step' : undefined}
                    >
                      <small>{String(index + 1).padStart(2, '0')}</small>
                      <span>
                        {item.label}
                        <small>{item.period}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <span className="ibadan-eyebrow">
                {current.period} / {current.object}
              </span>
              <h3>{current.title.replace('\n', ' ')}</h3>
              <p>{current.note}</p>
              <p>{current.detail}</p>
              <div className="ibadan-reference-reading">
                <span className="ibadan-eyebrow">Reference reading · verification pending</span>
                <ul>
                  {ibadanReferences
                    .filter((reference) =>
                      (current.references as readonly string[]).includes(reference.id),
                    )
                    .map((reference) => (
                      <li key={reference.id}>
                        <a href={reference.url} target="_blank" rel="noopener noreferrer">
                          {reference.title} ↗
                        </a>
                        <span>{reference.scope}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="ibadan-curation-note">
                <span className="ibadan-eyebrow">About this edition</span>
                <p>{ibadanEdition.notice}</p>
                <p>
                  All forms are original procedural illustrations. The ambience is composed in the
                  browser. No archival image, recording or externally hosted model is presented as
                  an authentic historical asset.
                </p>
              </div>
            </>
          )}
        </div>
      </dialog>
    </main>
  )
}
