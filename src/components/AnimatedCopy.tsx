'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)
export default function AnimatedCopy({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const split = SplitText.create(ref.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              opacity: 0,
              duration: 1.1,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
            })
          },
        })
        return () => split.revert()
      })
      return () => media.revert()
    },
    { scope: ref },
  )
  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  )
}
