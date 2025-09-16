'use client'

import React, {
  useRef,
  Children,
  isValidElement,
  cloneElement,
  ReactNode,
  ReactElement,
} from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/dist/SplitText'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(SplitText, ScrollTrigger)

interface NewCopyProps {
  children: ReactNode
  animateOnScroll?: boolean
  delay?: number
  markers?: boolean
  className?: string
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  markers = false,
  className,
}: NewCopyProps): ReactElement {
  const containerRef = useRef<HTMLElement | null>(null)
  const splitRefs = useRef<any[]>([])
  const lineEls = useRef<Element[]>([])

  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) return

      // reset if props change
      splitRefs.current.forEach((s) => s && s.revert && s.revert())
      splitRefs.current = []
      lineEls.current = []

      const elements = container?.hasAttribute('data-copy-wrapper')
        ? (Array.from(container.children) as HTMLElement[])
        : container
          ? [container]
          : []

      elements.forEach((el) => {
        const split = new SplitText(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line++',
        })
        splitRefs.current.push(split)

        // preserve text-indent on the first split line
        const computed = window.getComputedStyle(el)
        const textIndent = computed.textIndent
        if (textIndent && textIndent !== '0px' && split.lines.length > 0) {
          ;(split.lines[0] as HTMLElement).style.paddingLeft = textIndent
          el.style.textIndent = '0'
        }

        lineEls.current.push(...split.lines)
      })

      gsap.set(lineEls.current, { yPercent: 100 })

      const anim = {
        yPercent: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.1,
        delay,
      }

      if (animateOnScroll) {
        gsap.to(lineEls.current, {
          ...anim,
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            markers,
          },
        })
      } else {
        gsap.to(lineEls.current, anim)
      }

      return () => {
        splitRefs.current.forEach((s) => s && s.revert && s.revert())
        splitRefs.current = []
        lineEls.current = []
      }
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay, markers] },
  )

  const count = Children.count(children)

  // Single valid element: attach ref directly (no extra wrapper)
  if (count === 1 && isValidElement(children)) {
    return cloneElement(children, {
      ref: (node: HTMLElement | null) => {
        containerRef.current = node
        // preserve original ref if present
        const originalRef = (children as any).ref
        if (typeof originalRef === 'function') originalRef(node)
        else if (originalRef && typeof originalRef === 'object') {
          originalRef.current = node
        }
      },
    } as any)
  }

  // Single non-element child (e.g., string): wrap so we can target it
  if (count === 1 && !isValidElement(children)) {
    return <span ref={containerRef as any}>{children}</span>
  }

  // Multiple children: wrap so each direct child can be split
  return (
    <div ref={containerRef as any} data-copy-wrapper="true" className={className || 'copy'}>
      {children}
    </div>
  )
}
