'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { BrandMark } from './Brand'
import './intro.css'

const IntroContext = createContext(true)
export const useIntroReady = () => useContext(IntroContext)

function BrandLoader({ finish }: { finish: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const sculpture = useRef<SVGSVGElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const sequence = useRef<gsap.core.Timeline | null>(null)
  const holding = useRef(false)
  const exiting = useRef(false)
  const move = useRef<(x: number, y: number) => void>(() => {})
  const [held, setHeld] = useState(false)

  const release = useCallback(() => {
    if (!holding.current) return
    holding.current = false
    setHeld(false)
    sequence.current?.resume()
  }, [])
  const hold = () => {
    if (exiting.current || holding.current) return
    holding.current = true
    setHeld(true)
    sequence.current?.pause()
  }
  const skip = () => {
    sequence.current?.kill()
    finish()
  }

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const preference = () => {
      if (media.matches) finish()
    }
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('blur', release)
    media.addEventListener('change', preference)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('blur', release)
      media.removeEventListener('change', preference)
    }
  }, [finish, release])

  useGSAP(
    () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish()
        return
      }
      const paths = Array.from(
        sculpture.current?.querySelectorAll<SVGPathElement>('.portal-contour') ?? [],
      )
      const model = { assemble: 0, turn: 0, x: 0, y: 0, unravel: 0, progress: 0 }
      const xTo = gsap.quickTo(model, 'x', { duration: 0.9, ease: 'power3.out' })
      const yTo = gsap.quickTo(model, 'y', { duration: 0.9, ease: 'power3.out' })
      move.current = (x, y) => {
        xTo(x)
        yTo(y)
      }

      // A projected toroidal sculpture: 24 continuous curves, no images, WebGL, or extra packages.
      const draw = (_time: number, delta: number) => {
        model.turn += Math.min(delta, 40) * (holding.current ? 0.000055 : 0.00024)
        const tilt = 0.8 + model.y * 0.48,
          yaw = model.turn + model.x * 0.65
        const ct = Math.cos(tilt),
          st = Math.sin(tilt),
          cy = Math.cos(yaw),
          sy = Math.sin(yaw)
        paths.forEach((path, index) => {
          const v = (index / paths.length) * Math.PI * 2
          let d = '',
            depth = 0
          for (let step = 0; step <= 80; step++) {
            const u = (step / 80) * Math.PI * 2
            const twist = v + u * 2 + model.turn * 0.6
            const tube = 0.24 * model.assemble * (1 - model.unravel * 0.7)
            const radius = 0.68 + tube * Math.cos(twist)
            const x = radius * Math.cos(u),
              y = radius * Math.sin(u)
            const z = tube * Math.sin(twist) + Math.sin(u * 3 + model.turn) * 0.065 * model.assemble
            const rx = x * cy + z * sy,
              rz = -x * sy + z * cy
            const ry = y * ct - rz * st,
              dz = y * st + rz * ct
            const perspective = 3 / (3 - dz)
            const px = 500 + rx * 360 * perspective,
              py = 500 + ry * 360 * perspective
            d += `${step ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`
            depth += dz
          }
          path.setAttribute('d', d)
          path.setAttribute(
            'opacity',
            String(0.22 + (Math.cos(v + yaw) + 1) * 0.28 + (depth / 81) * 0.08),
          )
        })
      }
      gsap.ticker.add(draw)
      draw(0, 0)
      sequence.current = gsap
        .timeline({ onComplete: finish, defaults: { ease: 'power3.inOut' } })
        .from('.portal-chrome', { opacity: 0, y: 12, duration: 0.65, stagger: 0.04 }, 0.05)
        .fromTo(
          '.portal-art',
          { opacity: 0, scale: 0.7, rotate: -18 },
          { opacity: 1, scale: 1, rotate: 0, duration: 1.3, ease: 'expo.out' },
          0.1,
        )
        .to(model, { assemble: 1, duration: 1.45, ease: 'power3.out' }, 0.1)
        .from(
          '.portal-headline-line',
          { yPercent: 115, rotate: 3, stagger: 0.1, duration: 1, ease: 'expo.out' },
          0.3,
        )
        .to(
          model,
          {
            progress: 100,
            duration: 3.35,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (count.current)
                count.current.textContent = String(Math.round(model.progress)).padStart(3, '0')
            },
          },
          0.15,
        )
        .to('.portal-progress-fill', { scaleX: 1, duration: 3.35, ease: 'power1.inOut' }, 0.15)
        .to('.portal-word-track', { yPercent: -100 / 3, duration: 0.7, ease: 'expo.inOut' }, 1.3)
        .to('.portal-phase-track', { yPercent: -100 / 3, duration: 0.7, ease: 'expo.inOut' }, 1.3)
        .to('.portal-word-track', { yPercent: -200 / 3, duration: 0.7, ease: 'expo.inOut' }, 2.4)
        .to('.portal-phase-track', { yPercent: -200 / 3, duration: 0.7, ease: 'expo.inOut' }, 2.4)
        .call(
          () => {
            exiting.current = true
          },
          [],
          3.5,
        )
        .to(
          '.portal-headline-line, .portal-chrome',
          { opacity: 0, y: -15, duration: 0.35, stagger: 0.015 },
          3.55,
        )
        .to(model, { unravel: 1, duration: 0.65 }, 3.5)
        .to('.portal-art', { scale: 1.2, opacity: 0, duration: 0.65, ease: 'power2.in' }, 3.65)
        .to(
          root.current,
          {
            '--portal-open': () => `${Math.hypot(innerWidth, innerHeight)}px`,
            duration: 1.05,
            ease: 'expo.inOut',
          },
          3.8,
        )
      return () => {
        gsap.ticker.remove(draw)
        sequence.current?.kill()
        move.current = () => {}
      }
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className={`brand-intro portal-loader${held ? ' is-held' : ''}`}
      data-testid="brand-intro"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        move.current(
          ((event.clientX - box.left) / box.width) * 2 - 1,
          ((event.clientY - box.top) / box.height) * 2 - 1,
        )
      }}
      onPointerLeave={() => {
        move.current(0, 0)
        release()
      }}
    >
      <div className="portal-top portal-chrome">
        <BrandMark className="intro-mark" />
        <span className="portal-label portal-top-note">Independent by design.</span>
        <button onClick={skip} className="portal-skip">
          Skip intro <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div
        className="portal-art"
        aria-hidden="true"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          hold()
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <svg ref={sculpture} viewBox="0 0 1000 1000" className="portal-sculpture" fill="none">
          {Array.from({ length: 24 }, (_, index) => (
            <path key={index} className="portal-contour" stroke="currentColor" strokeWidth="0.85" />
          ))}
        </svg>
        <span className="portal-axis portal-axis-x" />
        <span className="portal-axis portal-axis-y" />
        <span className="portal-orbit-dot" />
      </div>
      <div className="portal-phase portal-chrome" aria-hidden="true">
        <div className="portal-phase-track">
          <span>01 / A thought</span>
          <span>02 / Taking shape</span>
          <span>03 / Made real</span>
        </div>
      </div>
      <div className="portal-headline" aria-hidden="true">
        <div className="portal-type-mask">
          <span className="portal-headline-line">Ideas,</span>
        </div>
        <div className="portal-type-mask">
          <div className="portal-headline-line portal-word-window">
            <div className="portal-word-track">
              <span>in motion.</span>
              <span>into form.</span>
              <span>made real.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="portal-bottom portal-chrome">
        <div className="portal-signature">
          <span>Yusuff Ridwan Akanni</span>
          <span>Strategy. Craft. Software.</span>
        </div>
        <button
          className="portal-hold"
          aria-label="Hold to explore the sculpture"
          aria-pressed={held}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            hold()
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onBlur={release}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault()
              hold()
            }
          }}
          onKeyUp={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault()
              release()
            }
          }}
        >
          <span className="portal-hold-glyph" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>{held ? 'Release to continue' : 'Hold to explore'}</span>
        </button>
        <div className="portal-counter" aria-hidden="true">
          <span ref={count}>000</span>
          <small>/ 100</small>
        </div>
      </div>
      <div className="portal-progress portal-chrome" aria-hidden="true">
        <span className="portal-progress-fill" />
      </div>
      <span className="sr-only" role="status">
        Introducing Akanni. Move to turn the sculpture, hold to explore, or skip the introduction.
      </span>
    </div>
  )
}

export default function Intro({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()
  const finish = useCallback(() => {
    try {
      sessionStorage.setItem('akanni-intro-seen', 'true')
    } catch {
      /* Storage is optional. */
    }
    setReady(true)
  }, [])
  useEffect(() => {
    if (pathname !== '/') {
      setReady(true)
      return
    }
    try {
      if (sessionStorage.getItem('akanni-intro-seen')) setReady(true)
    } catch {
      /* Show intro without storage. */
    }
  }, [pathname])
  useEffect(() => {
    if (ready || pathname !== '/') {
      lenis?.start()
      return
    }
    lenis?.stop()
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previousOverflow
      lenis?.start()
    }
  }, [ready, lenis, pathname])
  return (
    <IntroContext.Provider value={ready}>
      {!ready && pathname === '/' && <BrandLoader finish={finish} />}
      <div className="site-content" inert={!ready} aria-hidden={!ready ? true : undefined}>
        {children}
      </div>
    </IntroContext.Provider>
  )
}
