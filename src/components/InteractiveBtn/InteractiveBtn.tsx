import React, { CSSProperties, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// @ts-ignore: allow side-effect CSS import without type declarations
import './InteractBtn.css'

gsap.registerPlugin(SplitText, ScrollTrigger)

interface InteractiveBtnProps {
  text: string
  containerStyle?: CSSProperties
  strokeColor?: string
  lastColor?: string
  textColor?: string
  animateOnScroll?: boolean
  delay?: number
  handleInteraction: () => void
}

function InteractiveBtn({
  text,
  containerStyle,
  strokeColor = '#000000',
  lastColor,
  textColor,
  animateOnScroll = false,
  delay = 0,
  handleInteraction,
}: InteractiveBtnProps): React.JSX.Element {
  const interactBtnRef = useRef<HTMLButtonElement>(null)
  const { contextSafe } = useGSAP({
    scope: interactBtnRef,
    revertOnUpdate: true,
  })

  const handleMouseOver = contextSafe(() => {
    const tl = gsap.timeline()
    tl.to('.strip', {
      y: '-64px',
      duration: 0.5,
      ease: 'power4.in',
    }).to('.icon-con', {
      y: 0,
      duration: 0.5,
      ease: 'power4.in',
    })
  })

  const handleMouseLeave = contextSafe(() => {
    const outTl = gsap.timeline()
    outTl
      .to('.strip', {
        y: '0%',
        duration: 0.5,
        ease: 'power4.out',
      })
      .to('.icon-con', {
        y: '20px',
        duration: 0.5,
        ease: 'power4.out',
      })
  })
  return (
    <button
      className="interact-btn"
      style={containerStyle}
      onClick={handleInteraction}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      aria-label={text}
      ref={interactBtnRef}
    >
      <div className="">
        <div className="text-strip strip">
          <p className={`paragraph btn-text`} style={{ color: `${textColor}` }}>
            {text}
          </p>
          <p className={`paragraph btn-text`} style={{ color: `${textColor}` }}>
            {text}
          </p>
          <p className={`paragraph link-text`} style={{ color: `${textColor}` }}>
            {text}
          </p>
          <p className={`paragraph link-text`} style={{ color: `${lastColor}` }}>
            {text}
          </p>
          <p className={`paragraph link-text`} style={{ color: `${lastColor}` }}>
            {text}
          </p>
        </div>
      </div>
      <div className={`icon-con icon-con`}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1H13M13 1C13 1 13 14.5983 13 12.8437M13 1L1 12.8437"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeWidth={2}
          />
        </svg>
      </div>
    </button>
  )
}

export default InteractiveBtn
