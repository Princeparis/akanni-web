'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIntroReady } from './Intro'
import MagneticLink from './MagneticLink'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const ready = useIntroReady()
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      if (media.matches) {
        video.current?.pause()
        setPlaying(false)
      }
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (!ready) {
          gsap.set('.hero-line-inner', { yPercent: 115 })
          gsap.set('.hero-reveal', { opacity: 0 })
          return
        }
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(
            '.hero-line-inner',
            { yPercent: 115, rotate: 4 },
            { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.15 },
          )
          .fromTo(
            '.hero-reveal',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.08 },
            0.35,
          )
          .fromTo('.hero-video', { scale: 1.18 }, { scale: 1, duration: 2.1 }, 0)
        gsap.to('.hero-title', {
          yPercent: 32,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.7 },
        })
        gsap.to('.hero-video', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
      return () => media.revert()
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  )
  async function toggleVideo() {
    if (!video.current) return
    if (playing) {
      video.current.pause()
      setPlaying(false)
    } else {
      try {
        await video.current.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    }
  }
  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <video
        ref={video}
        className="hero-video"
        src="/bg.mp4"
        poster="/images/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <div className="hero-shade" />
      <div className="hero-identity hero-reveal">
        <span className="eyebrow">Yusuff Ridwan Akanni</span>
        <span className="eyebrow">Independent / Nigeria ↗ Worldwide</span>
      </div>
      <div className="hero-coordinate hero-reveal" aria-hidden="true">
        DESIGN. DEVELOP. EXPERIMENT.
      </div>
      <h1 className="hero-title" id="hero-title" aria-label="Creative Engineer">
        <span className="hero-line">
          <span className="hero-line-inner">
            Creative
            <span className="hero-title-star" aria-hidden="true">
              *
            </span>
          </span>
        </span>
        <span className="hero-line">
          <span className="hero-line-inner hero-title-outline">Engineer</span>
        </span>
      </h1>
      <div className="hero-lower hero-reveal">
        <div className="hero-intro-copy">
          <span className="hero-cross" aria-hidden="true">
            +
          </span>
          <p>
            I build brands that feel inevitable.
            <br />
            And the products that carry them.
          </p>
        </div>
        <div className="hero-disciplines">
          <span>Designer</span>
          <span>Developer</span>
          <span>AI explorer</span>
          <span>Writer</span>
        </div>
        <MagneticLink href="#work" className="pill-light">
          Explore selected work
        </MagneticLink>
      </div>
      <div className="hero-foot hero-reveal">
        <span className="eyebrow">Scroll to explore ↓</span>
        <span className="eyebrow hero-foot-note">
          Strategy, craft & software.
          <br />
          One pair of hands.
        </span>
        <button
          onClick={toggleVideo}
          className="video-toggle"
          aria-label={playing ? 'Pause background video' : 'Play background video'}
          aria-pressed={playing}
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span> Film {playing ? 'on' : 'off'}
        </button>
      </div>
    </section>
  )
}
