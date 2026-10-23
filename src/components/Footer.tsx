'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Arrow } from './Icons'
import { BrandWordmark } from './Brand'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Reveal from './Reveal'

export default function Footer() {
  const logo = useRef<HTMLAnchorElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const shapes = logo.current?.querySelectorAll('path, rect')
        if (shapes)
          gsap.from(shapes, {
            y: 100,
            opacity: 0,
            stagger: 0.09,
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: { trigger: logo.current, start: 'top 95%', once: true },
          })
      })
      return () => media.revert()
    },
    { scope: logo },
  )
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('akanni@metnov.org')
      setCopied(true)
      setCopyError(false)
    } catch {
      setCopyError(true)
    }
  }
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-top">
        <span className="eyebrow">
          <span className="status-dot" /> Good things start with a conversation
        </span>
        <a className="back-top" href="#main">
          Back to top ↑
        </a>
      </div>
      <Reveal>
        <a className="footer-title" href="mailto:akanni@metnov.org">
          Let’s
          <br />
          <span>connect.</span>
          <Arrow />
        </a>
      </Reveal>
      <div className="footer-info">
        <p>
          Let’s build for the next billion. Co-create solutions that make digital life safer,
          simpler, and better for people today and the generations coming after us.
        </p>
        <div className="footer-email">
          <a href="mailto:akanni@metnov.org">akanni@metnov.org</a>
          <button onClick={copyEmail} aria-label="Copy email address">
            {copied ? 'Copied ✓' : 'Copy ↗'}
          </button>
          <span role="status" className="copy-status">
            {copyError
              ? 'Please use the email link to get in touch.'
              : copied
                ? 'Email address copied.'
                : ''}
          </span>
        </div>
      </div>
      <Link href="/" ref={logo} className="footer-brand" aria-label="Rayab home">
        <BrandWordmark className="footer-brand-wordmark" />
      </Link>
      <div className="footer-bottom">
        <div className="footer-socials">
          <a href="https://www.linkedin.com/in/kingakanni" target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a
            href="https://www.facebook.com/share/15mHvRNdcV/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
          >
            Facebook ↗
          </a>
          <a href="https://wa.link/utm5le" target="_blank" rel="noreferrer">
            WhatsApp ↗
          </a>
        </div>
        <div className="footer-credit">
          <span>Made with intention, from NG.</span>
          <span>© {new Date().getFullYear()} Yusuff Ridwan</span>
        </div>
      </div>
    </footer>
  )
}
