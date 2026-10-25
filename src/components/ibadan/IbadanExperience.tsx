'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ibadanActs, ibadanChapters, ibadanEdition, ibadanSources } from '@/data/ibadan'
import { BrandMark } from '@/components/Brand'
import { IbadanAudio } from './ibadan-audio'
import type { IbadanScene } from './ibadan-scene'
import { useIbadanFullscreen } from './use-ibadan-fullscreen'
import { useIbadanNarration } from './use-ibadan-narration'
import { ibadanGallery } from '@/data/ibadan-gallery'
import './ibadan.css'

type Panel = 'journey' | 'evidence' | 'people' | 'audio' | null
function Icon({ name }: { name: 'sound' | 'screen' | 'menu' | 'close' | 'voice' }) {
  const paths = {
    sound: 'M4 9h3l5-4v14l-5-4H4V9Zm12-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
    screen: 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6',
    menu: 'M4 7h16M4 12h10M4 17h16',
    close: 'm6 6 12 12M6 18 18 6',
    voice: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-4 0h8',
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
function Preview({ id }: { id: string }) {
  return (
    <Image
      className="ibadan-world-preview"
      src={`/ibadan/posters/${ibadanGallery[id].sculpture}.webp`}
      alt=""
      width={600}
      height={600}
      unoptimized
    />
  )
}

export default function IbadanExperience() {
  const root = useRef<HTMLElement>(null),
    host = useRef<HTMLDivElement>(null),
    scene = useRef<IbadanScene | null>(null),
    audio = useRef<IbadanAudio | null>(null)
  const dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    readerHost = useRef<HTMLElement>(null),
    captionHost = useRef<HTMLElement>(null)
  const active = useRef(0),
    entered = useRef(false),
    soundWanted = useRef(true),
    wheel = useRef({ distance: 0, last: 0 }),
    openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [phase, setPhase] = useState<'cover' | 'opening' | 'story'>('cover'),
    [chapter, setChapter] = useState(0),
    [view, setView] = useState(-1)
  const [inspecting, setInspecting] = useState(false)
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0),
    [reduced, setReduced] = useState(false),
    [paused, setPaused] = useState(false)
  const [reader, setReader] = useState(false),
    [sound, setSound] = useState(false),
    [soundPreference, setSoundPreference] = useState(true),
    [notice, setNotice] = useState('')
  const [panel, setPanel] = useState<Panel>(null),
    [expandedAct, setExpandedAct] = useState(1),
    [preview, setPreview] = useState(0)
  const fullscreen = useIbadanFullscreen(root)
  const current = ibadanChapters[chapter],
    act = ibadanActs[current.act - 1],
    perspective = view >= 0 ? current.viewpoints[view] : null
  const narration = useIbadanNarration(current.narration, (speaking) =>
    audio.current?.setDucked(speaking),
  )
  const sources = ibadanSources.filter((source) =>
    current.historicalClaims.some((claim) => claim.sourceIds.includes(source.id)),
  )
  const previewChapter = ibadanChapters[preview]
  const exhibit = ibadanGallery[current.id]
  const started = phase !== 'cover'
  const homeArrival = useRef(false)

  useEffect(() => {
    if (sessionStorage.getItem('ibadan-enter-from-home') !== 'true') return
    sessionStorage.removeItem('ibadan-enter-from-home')
    homeArrival.current = true
    entered.current = true
    soundWanted.current = false
    setSoundPreference(false)
    setPhase('opening')
  }, [])
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
      if (openingTimer.current) clearTimeout(openingTimer.current)
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
    setReady(false)
    setFailed(false)
    void import('./ibadan-scene')
      .then(async ({ createIbadanScene }) => {
        if (cancelled || !host.current) return
        try {
          const engine = await createIbadanScene(host.current, () => {
            setFailed(true)
            setReady(false)
            if (entered.current) setReader(true)
          })
          if (cancelled) {
            engine.destroy()
            return
          }
          scene.current = engine
          engine.setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches)
          engine.setEntered(entered.current)
          engine.setChapter(active.current)
          setReady(true)
          if (homeArrival.current) {
            homeArrival.current = false
            openingTimer.current = setTimeout(
              () => {
                setPhase('story')
                heading.current?.focus({ preventScroll: true })
              },
              matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500,
            )
          }
        } catch {
          if (cancelled) return
          setFailed(true)
          if (entered.current) {
            setReader(true)
            setPhase('story')
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
          if (entered.current) {
            setReader(true)
            setPhase('story')
          }
        }
      })
    return () => {
      cancelled = true
      scene.current?.destroy()
      scene.current = null
    }
  }, [retry])
  useEffect(
    () => scene.current?.setPaused(paused || reader || Boolean(panel)),
    [paused, reader, panel, ready],
  )
  useEffect(() => scene.current?.setVisible(!reader), [reader, ready])
  useEffect(() => scene.current?.setInspection(inspecting), [inspecting, ready])
  useEffect(() => {
    scene.current?.setView(perspective?.focus || 'place')
  }, [perspective, ready])
  useEffect(() => {
    if (panel) dialog.current?.showModal()
    else dialog.current?.close()
  }, [panel])
  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(ibadanChapters.length - 1, index))
    if (next === active.current) return
    active.current = next
    setChapter(next)
    setInspecting(false)
    setView(-1)
    setPreview(next)
    setExpandedAct(ibadanChapters[next].act)
    scene.current?.setChapter(next)
    audio.current?.setChapter(next)
    readerHost.current?.scrollTo({ top: 0 })
    captionHost.current?.scrollTo({ top: 0 })
  }, [])
  useEffect(() => {
    if (!started) return
    const keys = (event: KeyboardEvent) => {
      if (dialog.current?.open || (event.target as HTMLElement).closest('button,a,input,select'))
        return
      if (event.key === 'Escape') setInspecting(false)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(active.current + 1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(active.current - 1)
      }
      if (!reader && event.key === 'Home') {
        event.preventDefault()
        go(0)
      }
      if (!reader && event.key === 'End') {
        event.preventDefault()
        go(ibadanChapters.length - 1)
      }
    }
    document.addEventListener('keydown', keys)
    return () => document.removeEventListener('keydown', keys)
  }, [started, go, reader])
  const begin = (textOnly = false) => {
    if (entered.current) return
    entered.current = true
    setReader(textOnly || failed)
    setPhase(reduced || textOnly || failed ? 'story' : 'opening')
    scene.current?.setEntered(true)
    if (!textOnly && soundWanted.current)
      void audio.current?.start().then((playing) => {
        setSound(playing)
        if (!playing)
          setNotice(
            'The atmosphere could not start on this device. You can continue with the text and scene.',
          )
      })
    else {
      soundWanted.current = false
      setSoundPreference(false)
    }
    void fullscreen.enter()
    openingTimer.current = setTimeout(
      () => {
        setPhase('story')
        heading.current?.focus({ preventScroll: true })
      },
      reduced || textOnly ? 0 : 1500,
    )
  }
  const toggleSound = () => {
    const wanted = started ? !sound : !soundWanted.current
    soundWanted.current = wanted
    setSoundPreference(wanted)
    if (!started) return
    if (!wanted) {
      audio.current?.stop()
      setSound(false)
    } else
      void audio.current?.start().then((playing) => {
        setSound(playing)
        if (!playing) setNotice('Atmosphere is unavailable. The journey remains fully usable.')
      })
  }
  const openJourney = () => {
    setPreview(chapter)
    setExpandedAct(current.act)
    setPanel('journey')
  }
  const evidence = () => setPanel('evidence')
  const selectView = (index: number) => {
    setView(index)
    captionHost.current?.scrollTo({ top: 0 })
    scene.current?.setView(index < 0 ? 'place' : current.viewpoints[index].focus)
  }

  return (
    <main
      ref={root}
      id="main"
      className={`ibadan-app phase-${phase}${reader ? ' is-reader' : ''}${reduced ? ' is-reduced' : ''}${inspecting ? ' is-inspecting' : ''}`}
      data-chapter={current.id}
      data-ready={ready}
      data-fullscreen={fullscreen.fullscreen}
      data-lenis-prevent
      tabIndex={-1}
      onWheel={(event) => {
        if (
          phase !== 'story' ||
          panel ||
          reader ||
          inspecting ||
          event.ctrlKey ||
          (event.target as HTMLElement).closest('[data-native-scroll]') ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
        )
          return
        const now = performance.now()
        if (now - wheel.current.last < 1400) return
        wheel.current.distance += event.deltaY
        if (Math.abs(wheel.current.distance) > 120) {
          go(active.current + Math.sign(wheel.current.distance))
          wheel.current = { distance: 0, last: now }
        }
      }}
    >
      <div className="ibadan-atmosphere" aria-hidden="true" />
      <div className="ibadan-stage" ref={host} aria-hidden={reader || failed} />
      <div className="ibadan-light" aria-hidden="true" />
      <header className="ibadan-header">
        <Link href="/" aria-label="Return to Rayab portfolio" className="ibadan-brand">
          <BrandMark />
          <span>
            The Ibadan archive<small>A project by Rayab</small>
          </span>
        </Link>
        {started && (
          <button className="ibadan-act-label" onClick={openJourney}>
            <span>Act {String(current.act).padStart(2, '0')}</span>
            {act.title}
          </button>
        )}
        <div className="ibadan-header-actions">
          {started && (
            <>
              <button
                aria-label={reader ? 'Return to spatial edition' : 'Open text edition'}
                onClick={() => {
                  setReader(!reader)
                  setInspecting(false)
                }}
                aria-pressed={reader}
              >
                <span>Read</span>
                <b aria-hidden="true">Aa</b>
              </button>
              <button
                onClick={toggleSound}
                aria-label={sound ? 'Mute Ibadan atmosphere' : 'Enable Ibadan atmosphere'}
                aria-pressed={sound}
              >
                <Icon name="sound" />
              </button>
              <button
                className="ibadan-header-settings"
                onClick={() => setPanel('audio')}
                aria-label="Sound and narration settings"
              >
                <Icon name="voice" />
              </button>
            </>
          )}
          {fullscreen.supported && (
            <button
              onClick={() => void fullscreen.toggle()}
              aria-label={fullscreen.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-pressed={fullscreen.fullscreen}
            >
              <Icon name="screen" />
            </button>
          )}
          {started && (
            <button
              onClick={openJourney}
              aria-label="Open journey menu"
              className="ibadan-menu-button"
            >
              <span>Journey</span>
              <Icon name="menu" />
            </button>
          )}
          <Link href="/" className="ibadan-exit" aria-label="Exit Ibadan experience">
            Exit ↗
          </Link>
        </div>
      </header>

      {started && !reader && (
        <div className="ibadan-era" key={current.id} aria-hidden="true">
          <span>{exhibit.year}</span>
        </div>
      )}
      {phase !== 'story' && (
        <section
          className={`ibadan-cover${phase === 'opening' ? ' is-leaving' : ''}`}
          aria-labelledby="ibadan-title"
        >
          <span className="ibadan-eyebrow">An interactive history / By a son of the city</span>
          <h1 id="ibadan-title">
            <span>Ìbàdàn</span>
            <span className="ibadan-cover-subtitle">
              A city. A people. <em>A living history.</em>
            </span>
          </h1>
          <p>
            Step into the lives, objects and ideas
            <br />
            that made the city I call home.
          </p>
          <div className="ibadan-cover-actions">
            <button className="ibadan-enter" onClick={() => begin()} disabled={phase === 'opening'}>
              Enter the story <span aria-hidden="true">↗</span>
            </button>
            <div>
              <button
                onClick={toggleSound}
                aria-label="Entry atmosphere"
                aria-pressed={soundPreference}
              >
                <Icon name="sound" />
                Atmosphere {soundPreference ? 'on' : 'off'}
              </button>
              <button onClick={() => begin(true)}>Read without 3D ↗</button>
            </div>
          </div>
          <span className="ibadan-cover-note">
            Six acts. Eighteen moments. Centuries of becoming.
          </span>
        </section>
      )}

      {started && (
        <>
          {reader ? (
            <article
              className="ibadan-reader"
              ref={readerHost}
              data-native-scroll
              data-lenis-prevent
              aria-label="Text edition"
            >
              <div className="ibadan-reader-inner">
                <span className="ibadan-eyebrow">
                  {current.dateLabel} / {current.locations[0].name}
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  {current.title}
                </h1>
                <p className="ibadan-reader-question">{current.question}</p>
                <p>{current.text}</p>
                <h2>People & relationships</h2>
                <ul className="ibadan-people-list">
                  {current.people.map((person) => (
                    <li key={person.name}>
                      <span>{person.historicalOrComposite}</span>
                      <h3>{person.name}</h3>
                      <p>{person.role}</p>
                    </li>
                  ))}
                </ul>
                <h2>Follow a viewpoint</h2>
                {current.viewpoints.map((point) => (
                  <section key={point.id}>
                    <h3>{point.label}</h3>
                    <p>{point.text}</p>
                  </section>
                ))}
                <h2>Narration transcript</h2>
                <p>{current.narration}</p>
                <button className="ibadan-inline-action" onClick={evidence}>
                  Evidence, sources & interpretation ↗
                </button>
                <p className="ibadan-reader-interpretation">
                  {current.assets[0].verificationStatus}
                </p>
              </div>
            </article>
          ) : (
            <>
              <div className="ibadan-spatial-label">
                <span>{current.locations[0].name}</span>
                <span>Particle models / Historical narrative</span>
              </div>
              <div className="ibadan-exhibit-label">
                <span className="ibadan-eyebrow">
                  On display / {String(chapter + 1).padStart(2, '0')}
                </span>
                <strong>{exhibit.subject}</strong>
                <span>{exhibit.medium}</span>
                <button onClick={() => setInspecting(true)}>
                  Inspect the model <span aria-hidden="true">↗</span>
                </button>
              </div>
              {inspecting && (
                <section className="ibadan-inspection" aria-label="Model inspection">
                  <span className="ibadan-eyebrow">A closer look</span>
                  <h2>{exhibit.subject}</h2>
                  <p>{exhibit.note}</p>
                  <div className="ibadan-inspect-controls">
                    <button
                      onClick={() => scene.current?.rotate(-Math.PI / 6)}
                      aria-label="Rotate model left"
                    >
                      ↶
                    </button>
                    <span>Drag to turn</span>
                    <button
                      onClick={() => scene.current?.rotate(Math.PI / 6)}
                      aria-label="Rotate model right"
                    >
                      ↷
                    </button>
                    <button onClick={() => scene.current?.reset()}>Reset view</button>
                  </div>
                  <button className="ibadan-inspect-close" onClick={() => setInspecting(false)}>
                    Back to the story <span aria-hidden="true">↗</span>
                  </button>
                </section>
              )}
              <section
                className="ibadan-caption"
                ref={captionHost}
                data-view={view}
                aria-labelledby="ibadan-chapter-title"
                data-native-scroll
                data-lenis-prevent
              >
                <div className="ibadan-caption-meta">
                  <span>
                    {current.dateLabel} <i /> Chapter {String(chapter + 1).padStart(2, '0')}
                  </span>
                  <button onClick={evidence}>
                    {current.historicalClaims[0].evidenceStatus} <span aria-hidden="true">↗</span>
                  </button>
                </div>
                <h2 ref={heading} tabIndex={-1} id="ibadan-chapter-title">
                  {current.title}
                </h2>
                <p className="ibadan-question">
                  {perspective ? perspective.title : current.question}
                </p>
                <p className="ibadan-caption-text" key={`${chapter}-${view}`}>
                  {perspective ? perspective.text : current.text}
                </p>
                <div className="ibadan-viewpoints" aria-label="Story viewpoints">
                  <button aria-pressed={view === -1} onClick={() => selectView(-1)}>
                    The story
                  </button>
                  {current.viewpoints.map((point, index) => (
                    <button
                      key={point.id}
                      onClick={() => selectView(index)}
                      aria-pressed={view === index}
                    >
                      {point.label}
                    </button>
                  ))}
                </div>
                <div className="ibadan-caption-links">
                  <button onClick={() => setPanel('people')}>People & relationships ↗</button>
                  <button onClick={evidence}>
                    Read the evidence <span aria-hidden="true">↗</span>
                  </button>
                  {narration.supported && (
                    <button
                      onClick={narration.speaking ? narration.stop : narration.play}
                      aria-pressed={narration.enabled}
                    >
                      <Icon name="voice" />
                      {narration.speaking ? 'Stop narration' : 'Listen to the story'}
                    </button>
                  )}
                </div>
              </section>
              <span className="ibadan-read-cue" aria-hidden="true">
                Scroll the story ↓
              </span>
            </>
          )}
          <nav className="ibadan-timeline" aria-label="Historical timeline">
            <div className="ibadan-timeline-heading">
              <span>Travel through time</span>
              <span>
                {act.title} <i> / Act 0{current.act}</i>
              </span>
              <button onClick={openJourney}>All chapters ↗</button>
            </div>
            <div className="ibadan-timeline-track">
              <div
                className="ibadan-timeline-progress"
                style={{ width: `${(chapter / (ibadanChapters.length - 1)) * 100}%` }}
              />
              {ibadanChapters.map((episode, index) => (
                <button
                  key={episode.id}
                  onClick={() => go(index)}
                  aria-label={`${episode.dateLabel}: ${episode.title}`}
                  aria-current={chapter === index ? 'step' : undefined}
                  className={index < chapter ? 'is-past' : ''}
                >
                  <i />
                  <span>{ibadanGallery[episode.id].year}</span>
                  <strong>{episode.title}</strong>
                </button>
              ))}
            </div>
            <input
              className="ibadan-time-slider"
              type="range"
              min="0"
              max={ibadanChapters.length - 1}
              value={chapter}
              onChange={(event) => go(Number(event.target.value))}
              aria-label="Travel through the Ibadan timeline"
              aria-valuetext={`${current.dateLabel}: ${current.title}`}
            />
          </nav>
          <footer className="ibadan-bottom">
            <button
              onClick={() => go(chapter - 1)}
              disabled={chapter === 0}
              aria-label="Previous chapter"
            >
              ←
            </button>
            <button
              className="ibadan-chapter-counter"
              onClick={openJourney}
              aria-label="Open chapter index"
            >
              <span>
                {String(chapter + 1).padStart(2, '0')} / {ibadanChapters.length}
              </span>
              <span>{current.title}</span>
            </button>
            <button
              onClick={() => go(chapter === ibadanChapters.length - 1 ? 0 : chapter + 1)}
              aria-label={
                chapter === ibadanChapters.length - 1 ? 'Restart the journey' : 'Next chapter'
              }
            >
              {chapter === ibadanChapters.length - 1 ? '↺' : '→'}
            </button>
            <button
              className="ibadan-motion"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
              aria-pressed={paused}
            >
              {paused ? 'Motion paused' : 'Motion on'}
            </button>
            <button className="ibadan-audio-settings" onClick={() => setPanel('audio')}>
              Sound & voice
            </button>
          </footer>
        </>
      )}

      {!ready && !failed && (
        <span className="ibadan-loading" role="status">
          Forming the particles…
        </span>
      )}
      {failed && !reader && (
        <button
          className="ibadan-fallback"
          onClick={() => (started ? setReader(true) : begin(true))}
        >
          The text edition is ready for this device ↗
        </button>
      )}
      {(notice || fullscreen.notice || narration.notice) && (
        <p className="ibadan-notice" role="status">
          {fullscreen.notice || narration.notice || notice}
          <button
            aria-label="Dismiss notice"
            onClick={() => {
              setNotice('')
              fullscreen.dismiss()
              narration.dismiss()
            }}
          >
            ×
          </button>
        </p>
      )}
      {reader && failed && (
        <button
          className="ibadan-retry"
          onClick={() => {
            setRetry(retry + 1)
            setReader(false)
          }}
        >
          Retry spatial edition ↗
        </button>
      )}

      <dialog
        ref={dialog}
        className={`ibadan-dialog${panel === 'journey' ? ' is-index' : ''}`}
        aria-labelledby="ibadan-panel-title"
        data-lenis-prevent
        onClose={() => {
          if (!dialog.current?.open) setPanel(null)
        }}
        onCancel={() => setPanel(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPanel(null)
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const buttons = dialog.current?.querySelectorAll<HTMLElement>('button,a[href],select')
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
        <div className="ibadan-panel" data-native-scroll data-lenis-prevent>
          <div className="ibadan-panel-top">
            <span className="ibadan-eyebrow">Ibadan / A city made and remade</span>
            <button onClick={() => setPanel(null)} aria-label="Close panel">
              <Icon name="close" />
              Close
            </button>
          </div>
          {panel === 'journey' ? (
            <>
              <div className="ibadan-menu-heading">
                <h2 id="ibadan-panel-title">
                  Find your
                  <br />
                  <em>own way.</em>
                </h2>
                <p>
                  Six acts. Eighteen episodes.
                  <br />
                  One city, made through many lives.
                </p>
              </div>
              <div className="ibadan-journey-layout">
                <nav className="ibadan-journey-list" aria-label="Journey chapters">
                  {ibadanActs.map((item) => (
                    <section key={item.id}>
                      <button
                        className="ibadan-act-toggle"
                        onClick={() => setExpandedAct(expandedAct === item.id ? 0 : item.id)}
                        aria-expanded={expandedAct === item.id}
                      >
                        <span>0{item.id}</span>
                        <span>
                          {item.title}
                          <small>{item.years}</small>
                        </span>
                        <b>{expandedAct === item.id ? '−' : '+'}</b>
                      </button>
                      {expandedAct === item.id && (
                        <ol>
                          {ibadanChapters.map((episode, index) =>
                            episode.act === item.id ? (
                              <li key={episode.id}>
                                <button
                                  onClick={() => {
                                    go(index)
                                    setPanel(null)
                                  }}
                                  onPointerEnter={() => setPreview(index)}
                                  onFocus={() => setPreview(index)}
                                  aria-current={chapter === index ? 'step' : undefined}
                                >
                                  <small>{episode.dateLabel}</small>
                                  <span>{episode.title}</span>
                                  <span aria-hidden="true">↗</span>
                                </button>
                              </li>
                            ) : null,
                          )}
                        </ol>
                      )}
                    </section>
                  ))}
                </nav>
                <aside className="ibadan-menu-preview" aria-live="polite">
                  <span className="ibadan-eyebrow">
                    {previewChapter.dateLabel} / Act {previewChapter.act}
                  </span>
                  <Preview id={previewChapter.id} />
                  <h3>{previewChapter.title}</h3>
                  <p>{previewChapter.question}</p>
                  <span>{previewChapter.locations[0].name}</span>
                  <button
                    onClick={() => {
                      go(preview)
                      setPanel(null)
                    }}
                  >
                    Enter this episode ↗
                  </button>
                </aside>
              </div>
              <div className="ibadan-menu-end">
                <span>Begin anywhere. Follow the consequences.</span>
                <button onClick={() => setPanel('evidence')}>Sources & interpretation ↗</button>
              </div>
            </>
          ) : (
            <>
              <span className="ibadan-eyebrow">
                {current.dateLabel} / {current.locations[0].name}
              </span>
              <h2 id="ibadan-panel-title">
                {panel === 'people'
                  ? 'People make the city.'
                  : panel === 'audio'
                    ? 'A story to hear.'
                    : 'What we know.'}
              </h2>
              {panel === 'people' ? (
                <>
                  <p>{current.question}</p>
                  <ul className="ibadan-people-list">
                    {current.people.map((person) => (
                      <li key={person.name}>
                        <span>{person.historicalOrComposite}</span>
                        <h3>{person.name}</h3>
                        <p>{person.role}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="ibadan-small-note">
                    The particle portraits are artistic character studies. Their facial features and
                    clothing are not authenticated likenesses or costume evidence. Anonymous figures
                    are composites.
                  </p>
                  <button className="ibadan-inline-action" onClick={evidence}>
                    See the historical evidence ↗
                  </button>
                </>
              ) : panel === 'audio' ? (
                <>
                  <p>
                    The atmosphere is original sound design. Narration is a modern reading, not an
                    archival voice or a historical quotation.
                  </p>
                  <button className="ibadan-settings-action" onClick={toggleSound}>
                    <Icon name="sound" />
                    Atmosphere {sound ? 'on' : 'off'}
                  </button>
                  {narration.supported ? (
                    <>
                      <button
                        className="ibadan-settings-action"
                        onClick={narration.speaking ? narration.stop : narration.play}
                      >
                        <Icon name="voice" />
                        {narration.speaking ? 'Stop narration' : 'Read this episode aloud'}
                      </button>
                      <label className="ibadan-voice-label">
                        Narration voice
                        <select
                          value={narration.voiceName}
                          onChange={(event) => narration.selectVoice(event.target.value)}
                        >
                          <option value="">Preferred available English voice</option>
                          {narration.voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} · {voice.lang}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="ibadan-small-note">
                        Uses voices available on your device. Nigerian English is preferred when
                        installed, followed by other available African English voices. No voice or
                        accent is claimed when your device does not provide it.
                      </p>
                    </>
                  ) : (
                    <p>This device has no speech reader. The transcript below remains available.</p>
                  )}
                  <h3>Transcript</h3>
                  <p>{current.narration}</p>
                </>
              ) : (
                <>
                  <p className="ibadan-evidence-question">{current.question}</p>
                  {current.historicalClaims.map((claim, index) => (
                    <section className="ibadan-claim" key={index}>
                      <span className="ibadan-evidence-label">{claim.evidenceStatus}</span>
                      <p>{claim.text}</p>
                      <span className="ibadan-source-ids">{claim.sourceIds.join(' · ')}</span>
                    </section>
                  ))}
                  {current.id === 'efunsetan' && (
                    <section className="ibadan-representation">
                      <h3>History is not the same as drama.</h3>
                      <p>
                        Adeboye’s scholarship examines how stage and screen have shaped Efunsetan’s
                        public image. This scene preserves her commercial and political agency while
                        acknowledging enslavement. It does not borrow a film’s plot, private
                        thoughts or dialogue as biography.
                      </p>
                      <span>S06</span>
                    </section>
                  )}
                  <h3>The model & its interpretation</h3>
                  <p>{exhibit.note}</p>
                  <p className="ibadan-small-note">
                    Portrait base geometry is adapted from CC0 MakeHuman graphical data. Clothing,
                    objects and architectural models are original work. No historical person was
                    scanned.
                  </p>
                  <h3>What is reconstructed?</h3>
                  <p>{current.assets[0].verificationStatus}</p>
                  <ul className="ibadan-uncertainties">
                    {current.uncertainties.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                  <h3>Sources for this episode</h3>
                  <ol className="ibadan-sources">
                    {sources.map((source) => (
                      <li key={source.id}>
                        <span>{source.id}</span>
                        <h4>{source.title}</h4>
                        <p>{source.consultation}</p>
                        {source.urls.map((url, index) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            Read source{source.urls.length > 1 ? ` ${index + 1}` : ''} ↗
                          </a>
                        ))}
                      </li>
                    ))}
                  </ol>
                  <details className="ibadan-method">
                    <summary>About the research & interpretation</summary>
                    <p>{ibadanEdition.notice}</p>
                  </details>
                </>
              )}
            </>
          )}
        </div>
      </dialog>
    </main>
  )
}
