'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import { Arrow } from './Icons'
import { BrandMark } from './Brand'
import HeaderGlass from './HeaderGlass'
import { CONTACT_EMAIL } from '@/lib/contact'

gsap.registerPlugin(ScrollTrigger)

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [sound, setSound] = useState(false)
  const header = useRef<HTMLElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const menu = useRef<HTMLDialogElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const entrance = useRef<gsap.core.Timeline | null>(null)
  const closing = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const lenis = useLenis()

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          header.current,
          {
            width: '100%',
            top: 0,
            height: () => (innerWidth <= 760 ? 88 : 110),
            paddingLeft: () => (innerWidth <= 760 ? 22 : innerWidth * 0.04),
            paddingRight: () => (innerWidth <= 760 ? 22 : innerWidth * 0.04),
            borderRadius: 0,
            '--glass-progress': 0,
          },
          {
            width: () => Math.min(innerWidth - 32, 560),
            top: 16,
            height: 68,
            paddingLeft: 18,
            paddingRight: 18,
            borderRadius: 24,
            '--glass-progress': 1,
            ease: 'none',
            scrollTrigger: { start: 40, end: 280, scrub: 0.5, invalidateOnRefresh: true },
          },
        )
      })
      return () => media.revert()
    },
    { scope: header },
  )

  const { contextSafe } = useGSAP(
    () => {
      if (!open || !menu.current) return
      closing.current = false
      menu.current.showModal()
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      entrance.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .fromTo(
          '.menu-underlay',
          { yPercent: 100 },
          { yPercent: 0, duration: 0.65, ease: 'expo.inOut' },
          0,
        )
        .fromTo(
          '.menu-sheet',
          { yPercent: 105, rotation: 2 },
          { yPercent: 0, rotation: 0, duration: 0.95, ease: 'expo.inOut' },
          0.08,
        )
        .fromTo(
          '.menu-link-inner',
          { yPercent: 125, rotation: 5 },
          { yPercent: 0, rotation: 0, stagger: 0.065, duration: 0.85 },
          0.48,
        )
        .fromTo('.menu-link-rule', { scaleX: 0 }, { scaleX: 1, stagger: 0.065, duration: 0.8 }, 0.6)
        .fromTo('.menu-chrome', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.65)
    },
    { scope: menu, dependencies: [open], revertOnUpdate: true },
  )

  const closeMenu = contextSafe((destination?: string) => {
    if (closing.current) return
    closing.current = true
    entrance.current?.kill()
    const finish = () => {
      menu.current?.close()
      setOpen(false)
      if (destination) router.push(destination)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    gsap
      .timeline({ onComplete: finish })
      .to(
        '.menu-link-inner',
        { yPercent: -125, rotation: -3, stagger: 0.035, duration: 0.4, ease: 'power3.in' },
        0,
      )
      .to('.menu-chrome', { opacity: 0, duration: 0.2 }, 0)
      .to('.menu-sheet', { yPercent: -105, rotation: -1, duration: 0.7, ease: 'expo.inOut' }, 0.15)
      .to('.menu-underlay', { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, 0.25)
  })

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previousOverflow
      lenis?.start()
    }
  }, [open, lenis])

  useEffect(() => {
    const element = audio.current
    return () => element?.pause()
  }, [])

  async function toggleSound() {
    if (!audio.current) return
    if (sound) {
      audio.current.pause()
      setSound(false)
    } else {
      try {
        await audio.current.play()
        setSound(true)
      } catch {
        setSound(false)
      }
    }
  }

  const links = [
    { href: '/#work', label: 'Selected work', active: pathname.startsWith('/portfolio') },
    { href: '/#about', label: 'About me', active: false },
    { href: '/gallery', label: 'Visual diary', active: pathname === '/gallery' },
    { href: '/playground', label: 'Playground', active: pathname.startsWith('/playground') },
    { href: '/ibadan', label: 'Ibadan', active: pathname === '/ibadan' },
  ]

  return (
    <>
      <header ref={header} className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <HeaderGlass target={header} route={pathname} paused={open} />
        <Link href="/" className="wordmark" aria-label="Rayab home">
          <BrandMark className="header-brand-mark" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.active ? 'active' : ''}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="sound-button"
            onClick={toggleSound}
            aria-label={sound ? 'Pause background music' : 'Play background music'}
            aria-pressed={sound}
          >
            <span className={`sound-wave ${sound ? 'playing' : ''}`} aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <i key={i} />
              ))}
            </span>
            <span>Sound {sound ? 'on' : 'off'}</span>
          </button>
          <button
            ref={toggle}
            className="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
          >
            <span className="menu-toggle-label">Menu</span>
            <span className="menu-toggle-lines">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <audio ref={audio} src="/akanni.mp3" preload="none" loop />
      <dialog
        ref={menu}
        id="mobile-navigation"
        aria-label="Site navigation"
        className="mobile-navigation"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const focusable = menu.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])',
          )
          if (!focusable?.length) return
          const first = focusable[0],
            last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }}
        onCancel={(event) => {
          event.preventDefault()
          closeMenu()
        }}
        onClose={() => {
          setOpen(false)
          toggle.current?.focus()
        }}
      >
        <div className="menu-underlay" aria-hidden="true" />
        <div className="menu-sheet">
          <div className="mobile-menu-top menu-chrome">
            <Link
              href="/"
              aria-label="Rayab home"
              onClick={(event) => {
                event.preventDefault()
                closeMenu('/')
              }}
            >
              <BrandMark className="menu-brand-mark" />
            </Link>
            <span className="eyebrow">Index / Explore</span>
            <button
              aria-label="Close navigation menu"
              className="menu-close"
              onClick={() => closeMenu()}
            >
              <span>Close</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="menu-body">
            <div className="menu-aside menu-chrome">
              <span className="eyebrow">A little navigation</span>
              <p>
                Good things
                <br />
                are a click away.
              </p>
              <span className="menu-aside-note">
                Independent creative engineer
                <br />
                Based in Nigeria. Working everywhere.
              </span>
            </div>
            <nav aria-label="Mobile navigation">
              {[...links, { href: '/#contact', label: 'Let’s talk' }].map((link, i) => (
                <Link
                  key={link.href}
                  className="mobile-nav-link"
                  href={link.href}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                    event.preventDefault()
                    closeMenu(link.href)
                  }}
                >
                  <span className="menu-link-mask">
                    <span className="menu-link-inner">
                      <small>0{i + 1}</small>
                      <span className="menu-link-label">{link.label}</span>
                      <Arrow />
                    </span>
                  </span>
                  <span className="menu-link-rule" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="menu-bottom menu-chrome">
            <a className="mobile-menu-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL} ↗
            </a>
            <span className="eyebrow">Strategy. Craft. Software.</span>
          </div>
        </div>
      </dialog>
    </>
  )
}
