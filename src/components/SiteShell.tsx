'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Intro from './Intro'

gsap.registerPlugin(ScrollTrigger)

function ScrollSync() {
  useLenis(() => ScrollTrigger.update())
  return null
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: !reduced, anchors: { offset: -100 } }}>
      <ScrollSync />
      <Intro>{children}</Intro>
    </ReactLenis>
  )
}
