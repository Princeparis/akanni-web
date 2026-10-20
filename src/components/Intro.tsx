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

const IntroContext = createContext(true)
export const useIntroReady = () => useContext(IntroContext)

function BrandLoader({ finish }: { finish: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const skip = () => {
    timeline.current?.kill()
    finish()
  }

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish()
        return
      }
      const counter = { value: 0 }
      timeline.current = gsap
        .timeline({ defaults: { ease: 'power4.inOut' }, onComplete: finish })
        .from('.intro-mark', { y: 25, opacity: 0, duration: 0.6 }, 0)
        .to(
          counter,
          {
            value: 100,
            duration: 1.65,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current)
                count.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
            },
          },
          0.15,
        )
        .to('.intro-progress-inner', { scaleX: 1, duration: 1.65, ease: 'power2.inOut' }, 0.15)
        .to('.intro-count-inner', { yPercent: -115, duration: 0.65 }, 1.85)
        .fromTo('.intro-name-left', { yPercent: 120 }, { yPercent: 0, duration: 0.75 }, 1.95)
        .fromTo('.intro-name-right', { yPercent: -120 }, { yPercent: 0, duration: 0.75 }, 1.95)
        .fromTo('.intro-divider', { scaleY: 0 }, { scaleY: 1, duration: 0.8 }, 2.15)
        .to('.intro-name-left', { yPercent: -120, duration: 0.65 }, 2.85)
        .to('.intro-name-right', { yPercent: 120, duration: 0.65 }, 2.85)
        .to('.intro-divider, .intro-chrome', { opacity: 0, duration: 0.3 }, 2.85)
        .to('.intro-curtain-left', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 3.05)
        .to('.intro-curtain-right', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, 3.1)
      return () => {
        timeline.current?.kill()
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="brand-intro" data-testid="brand-intro">
      <div className="intro-curtain intro-curtain-left" />
      <div className="intro-curtain intro-curtain-right" />
      <div className="intro-chrome intro-top">
        <BrandMark className="intro-mark" />
        <span className="eyebrow">Strategy. Craft. Software.</span>
        <button onClick={skip} className="intro-skip">
          Skip intro ↗
        </button>
      </div>
      <div className="intro-counter" aria-hidden="true">
        <div className="intro-count-inner">
          <span ref={count}>000</span>
          <small>/ 100</small>
        </div>
      </div>
      <div className="intro-name" aria-hidden="true">
        <div>
          <span className="intro-name-left">Yusuff</span>
        </div>
        <div>
          <span className="intro-name-right">Ridwan</span>
        </div>
      </div>
      <div className="intro-divider" />
      <div className="intro-chrome intro-bottom">
        <span className="eyebrow">An independent creative engineer</span>
        <div className="intro-progress">
          <div className="intro-progress-inner" />
        </div>
        <span className="eyebrow">Made with intention. From NG.</span>
      </div>
      <span className="sr-only" role="status">
        Introducing Akanni. You can skip the introduction.
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
    if (!ready && pathname === '/') lenis?.stop()
    else lenis?.start()
    return () => {
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
