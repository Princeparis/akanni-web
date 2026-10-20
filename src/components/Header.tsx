'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import { Arrow } from './Icons'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const menu = useRef<HTMLDialogElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const lenis = useLenis()

  useGSAP(
    () => {
      if (!open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        menu.current,
        { clipPath: 'inset(0 0 100% 0 round 20px)' },
        { clipPath: 'inset(0 0 0% 0 round 20px)', duration: 0.65, ease: 'power4.inOut' },
      )
      gsap.from('.mobile-nav-link', {
        y: 40,
        opacity: 0,
        stagger: 0.07,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      })
    },
    { scope: menu, dependencies: [open], revertOnUpdate: true },
  )

  useEffect(() => {
    if (open) {
      menu.current?.showModal()
      lenis?.stop()
    } else {
      menu.current?.close()
      lenis?.start()
    }
    return () => {
      lenis?.start()
    }
  }, [open, lenis])

  useEffect(
    () => () => {
      audio.current?.pause()
    },
    [],
  )

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
    { href: '/playground', label: 'Playground', active: pathname === '/playground' },
  ]

  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Akanni home">
          <svg viewBox="0 0 35 38" aria-hidden="true">
            <path
              d="M17.5 0 35 38l-17.5-7L0 38 17.5 0Zm0 13-6 13 6-3 6 3-6-13Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <span>
            akanni<span className="wordmark-dot">®</span>
          </span>
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
          <Link href="/#contact" className="header-contact">
            Let’s talk <Arrow />
          </Link>
          <button
            ref={toggle}
            className="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <audio ref={audio} src="/akanni.mp3" preload="none" loop />
      <dialog
        ref={menu}
        id="mobile-navigation"
        aria-label="Site navigation"
        className="mobile-navigation"
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false)
          toggle.current?.focus()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false)
        }}
      >
        <div className="mobile-menu-top">
          <span className="eyebrow">A little navigation</span>
          <button
            aria-label="Close navigation menu"
            className="round-button"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[...links, { href: '/#contact', label: 'Let’s talk' }].map((link, i) => (
            <Link
              key={link.href}
              className="mobile-nav-link"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              <small>0{i + 1}</small>
              {link.label}
              <Arrow />
            </Link>
          ))}
        </nav>
        <a className="mobile-menu-email" href="mailto:akanni@metnov.org">
          akanni@metnov.org ↗
        </a>
      </dialog>
    </>
  )
}
