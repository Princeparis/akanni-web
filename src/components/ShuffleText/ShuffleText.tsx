// components/ShuffleText/ShuffleText.tsx
'use client'

import { useEffect, useRef, useState, ElementType } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import './ShuffleText.css'

interface ShuffleTextProps {
  text: string
  as?: ElementType
  className?: string
  triggerOnScroll?: boolean
  [key: string]: any
}

const ShuffleText = ({
  text,
  as: Component = 'div',
  className = '',
  triggerOnScroll = false,
  ...props
}: ShuffleTextProps): React.JSX.Element => {
  const containerRef = useRef<HTMLElement>(null)
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const splitInstance = useRef<any>(null)

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth > 900)
    }

    checkSize()

    window.addEventListener('resize', checkSize)

    return () => window.removeEventListener('resize', checkSize)
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      // show the text without animation on mobile
      if (splitInstance.current) {
        splitInstance.current.revert()
        splitInstance.current = null
      }
      gsap.set(containerRef.current, { opacity: 1 })
      return
    }

    if (containerRef.current) {
      splitInstance.current = new SplitType(containerRef.current, {
        types: 'lines,words,chars',
        tagName: 'span',
      })

      const chars = splitInstance.current.chars
      const signs = ['+', '-']

      gsap.set(chars, { opacity: 0 })

      const animateChars = () => {
        chars.forEach((char: any) => {
          const originalLetter = char.textContent
          let shuffleCount = 0
          const maxShuffles = 5

          gsap.to(char, {
            opacity: 1,
            duration: 0.1,
            delay: gsap.utils.random(0, 0.75),
            onStart: () => {
              const shuffle = () => {
                if (shuffleCount < maxShuffles) {
                  char.textContent = signs[Math.floor(Math.random() * signs.length)]
                  shuffleCount++
                  requestAnimationFrame(() => setTimeout(shuffle, 75))
                } else {
                  char.textContent = originalLetter
                }
              }
              shuffle()
            },
          })
        })
      }

      if (triggerOnScroll) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top bottom-=100',
          onEnter: () => {
            animateChars()
          },
          once: false,
        })
      } else {
        animateChars()
      }
    }

    return () => {
      if (splitInstance.current) {
        splitInstance.current.revert()
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [text, triggerOnScroll, isDesktop])

  return (
    <Component ref={containerRef} className={`shuffle-text ${className}`.trim()} {...props}>
      {text}
    </Component>
  )
}

export default ShuffleText
