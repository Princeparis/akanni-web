'use client'

import Link from 'next/link'
import { useRef, type ReactNode, type MouseEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Arrow } from './Icons'

export default function MagneticLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { contextSafe } = useGSAP({ scope: ref })
  const move = contextSafe((event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches)
      return
    const rect = event.currentTarget.getBoundingClientRect()
    gsap.to(ref.current, {
      x: (event.clientX - rect.left - rect.width / 2) * 0.16,
      y: (event.clientY - rect.top - rect.height / 2) * 0.22,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  })
  const reset = contextSafe(() =>
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    }),
  )
  return (
    <Link
      ref={ref}
      href={href}
      className={`pill-link ${className}`}
      onMouseMove={move}
      onMouseLeave={reset}
    >
      <span>{children}</span>
      <span className="pill-arrow">
        <Arrow />
      </span>
    </Link>
  )
}
