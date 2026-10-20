'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticLink from './MagneticLink'
import { Asterisk } from './Icons'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

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
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.from('.hero-line-inner', {
          yPercent: 110,
          rotate: 3,
          duration: 1.3,
          stagger: 0.13,
          delay: 0.1,
        }).from('.hero-reveal', { opacity: 0, y: 20, stagger: 0.08, duration: 0.8 }, '-=0.5')
        gsap.to('.hero-asterisk', {
          rotation: 180,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 },
        })
        gsap.to('.hero-video', {
          yPercent: 15,
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
    { scope: root },
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
      <div className="hero-top hero-reveal">
        <span className="eyebrow">Independent creative engineer</span>
        <span className="eyebrow">Based in Nigeria. Creating everywhere. ↗</span>
      </div>
      <div className="hero-main">
        <div className="hero-name hero-reveal">
          <span className="tiny-cross">+</span> Yusuff Ridwan Akanni
        </div>
        <h1 id="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner">Creative by nature.</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner">
              Engineer <em>by craft.</em>
            </span>
          </span>
        </h1>
      </div>
      <div className="hero-bottom hero-reveal">
        <div>
          <p>
            I build brands that feel inevitable.
            <br />
            And the products that carry them.
          </p>
          <MagneticLink href="#work" className="pill-light">
            Explore selected work
          </MagneticLink>
        </div>
        <div className="hero-side">
          <Asterisk className="hero-asterisk" />
          <span className="eyebrow">
            Strategy. Craft. Code.
            <br />
            One pair of hands.
          </span>
        </div>
      </div>
      <div className="hero-foot hero-reveal">
        <span className="eyebrow">Scroll to discover ↓</span>
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
