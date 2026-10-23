'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from './shared'
export default function FocusTimer() {
  const root = useRef<HTMLDivElement>(null),
    ring = useRef<SVGCircleElement>(null),
    target = useRef(0),
    audio = useRef<AudioContext | null>(null)
  const [minutes, setMinutes] = useState(25),
    [custom, setCustom] = useState('25'),
    [remaining, setRemaining] = useState(25 * 60000)
  const [running, setRunning] = useState(false),
    [completed, setCompleted] = useState(0),
    [chime, setChime] = useState(false),
    [status, setStatus] = useState('')
  const total = minutes * 60000,
    seconds = Math.ceil(remaining / 1000),
    display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const progress = 1 - remaining / total
  useEffect(() => {
    if (!running) return
    const update = () => {
      const next = Math.max(0, target.current - Date.now())
      setRemaining(next)
      if (next === 0) {
        setRunning(false)
        setCompleted((value) => value + 1)
        setStatus('Session complete. Take a breath. Your next session starts when you choose.')
        if (chime && audio.current?.state === 'running') {
          const context = audio.current,
            oscillator = context.createOscillator(),
            gain = context.createGain()
          oscillator.connect(gain)
          gain.connect(context.destination)
          oscillator.frequency.value = 528
          gain.gain.setValueAtTime(0.12, context.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1)
          oscillator.start()
          oscillator.stop(context.currentTime + 1)
        }
      }
    }
    update()
    const interval = window.setInterval(update, 250)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', update)
    }
  }, [running, chime])
  useEffect(
    () => () => {
      void audio.current?.close()
    },
    [],
  )
  useEffect(() => {
    const tween = gsap.to(ring.current, {
      strokeDashoffset: 754 * progress,
      duration: reducedMotion() ? 0 : 0.2,
      overwrite: true,
      ease: 'none',
    })
    return () => {
      tween.kill()
    }
  }, [progress])
  function choose(value: number) {
    setRunning(false)
    setMinutes(value)
    setCustom(String(value))
    setRemaining(value * 60000)
    setStatus('')
  }
  return (
    <div className={`focus-layout${running ? ' is-running' : ''}`} ref={root}>
      <section className="focus-instrument" aria-label="Focus timer">
        <div className="focus-presets">
          {[
            [25, 'Focus'],
            [5, 'Short break'],
            [15, 'Long break'],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={minutes === value}
              onClick={() => choose(Number(value))}
            >
              {label} <small>{value}m</small>
            </button>
          ))}
        </div>
        <div className="focus-clock">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <circle cx="150" cy="150" r="120" className="focus-ring-track" />
            <circle
              ref={ring}
              cx="150"
              cy="150"
              r="120"
              className="focus-ring"
              strokeDasharray="754"
              strokeDashoffset="0"
            />
          </svg>
          <div className="focus-time">
            <span className="tool-eyebrow">
              {running
                ? 'One thing at a time'
                : remaining === 0
                  ? 'Well done.'
                  : 'A little room to focus'}
            </span>
            <span role="timer" aria-label="Time remaining" aria-live="off">
              {display}
            </span>
            <small>
              {running
                ? 'In the flow'
                : remaining === total
                  ? 'Ready when you are'
                  : remaining === 0
                    ? 'Session complete'
                    : 'Paused. Take your time.'}
            </small>
          </div>
        </div>
        <div className="focus-actions">
          <button
            className="tool-button tool-button-dark"
            onClick={() => {
              if (running) {
                setRemaining(Math.max(0, target.current - Date.now()))
                setRunning(false)
              } else {
                const duration = remaining || total
                setRemaining(duration)
                target.current = Date.now() + duration
                setRunning(true)
                setStatus('')
              }
            }}
          >
            {running
              ? 'Pause session'
              : remaining > 0 && remaining < total
                ? 'Resume session'
                : 'Start session'}{' '}
            {running ? 'Ⅱ' : '↗'}
          </button>
          <button className="tool-button" onClick={() => choose(minutes)}>
            Reset timer
          </button>
        </div>
      </section>
      <aside className="focus-sidebar">
        <span className="tool-eyebrow">Create a little space</span>
        <h2>
          Less noise.
          <br />
          More focus.
        </h2>
        <p>One task. One stretch of attention. A small ritual for work that matters to you.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const value = Number(custom)
            if (Number.isInteger(value) && value >= 1 && value <= 120) choose(value)
            else setStatus('Choose a whole number from 1 to 120 minutes.')
          }}
        >
          <label>
            Session length, minutes
            <input
              aria-label="Session length, minutes"
              type="number"
              min={1}
              max={120}
              step={1}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
          </label>
          <button className="tool-text-button" type="submit">
            Set duration ↗
          </button>
        </form>
        <label className="tool-check">
          <input
            type="checkbox"
            checked={chime}
            onChange={async (event) => {
              const enabled = event.target.checked
              if (enabled) {
                try {
                  audio.current ??= new AudioContext()
                  await audio.current.resume()
                } catch {
                  setStatus('Audio is unavailable in this browser.')
                  return
                }
              }
              setChime(enabled)
            }}
          />
          Play a gentle completion chime
        </label>
        <div className="focus-completed">
          <strong>{String(completed).padStart(2, '0')}</strong>
          <span>sessions completed here</span>
        </div>
        <p className="tool-status" role="status">
          {status}
        </p>
        <p className="tool-small">
          Keep this page open. Time stays accurate in a background tab; no notifications or
          automatic restarts.
        </p>
      </aside>
    </div>
  )
}
