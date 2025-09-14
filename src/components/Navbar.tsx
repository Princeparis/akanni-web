'use client'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import React, { useRef, useEffect } from 'react'
import MusicToggle from './MusicToggle/MusicToggle'
import { useViewTransition } from '@/hooks/useViewTransition'

function Navbar(): React.JSX.Element {
  const navBarRef = useRef<HTMLElement>(null)
  const { navigateWithTransition } = useViewTransition()
  let lastScrollY = 0
  let isScrolling = false

  useEffect(() => {
    const topBar = navBarRef.current
    if (!topBar) return

    const topBarHeight = topBar.offsetHeight + 40

    gsap.set(topBar, { y: 0 })

    const handleScroll = () => {
      if (isScrolling) return

      isScrolling = true
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 1 : -1

      // Check if we're at the top first
      if (currentScrollY === 0) {
        // Reset to full width navbar at top
        gsap.to(topBar, {
          width: '100vw',
          left: '0',
          top: '0',
          backgroundColor: 'transparent',
          borderRadius: '0',
          backdropFilter: 'none',
          '-webkit-backdrop-filter': 'none',
          transform: 'translateX(0)',
          padding: '20px',
          y: 0,
          duration: 0.4,
          ease: 'power4.out',
        })
      } else if (direction === 1 && currentScrollY > 100) {
        // Scrolling down - compact navbar and hide
        gsap.to(topBar, {
          width: '30vw',
          left: '50%',
          top: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          transform: 'translateX(-50%)',
          padding: '12px',
          duration: 0.6,
          ease: 'power4.out',
        })
        gsap.to(topBar, {
          y: -topBarHeight,
          duration: 0.8,
          ease: 'power4.out',
        })
      } else if (direction === -1 && currentScrollY > 0) {
        gsap.to(topBar, {
          top: '20px',
          duration: 0.4,
          ease: 'expo.inOut',
        })
        gsap.to(topBar, {
          y: 0,
          duration: 0.8,
          ease: 'power4.out',
        })
      }

      lastScrollY = currentScrollY

      setTimeout(() => {
        isScrolling = false
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
    <header className="nav" ref={navBarRef}>
      <div className="logo">
        <svg
          id="Layer_2"
          data-name="Layer 2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 387.19 386.84"
        >
          <g id="Layer_1-2" data-name="Layer 1">
            <path
              fill="#f7f6ed"
              d="M383.13,332.59L227.35,20.42c-6.15-12.32-17.4-19.12-29.2-20.42v154.09c7.98,1.28,15.45,6.09,19.63,14.47l17.61,35.3c15.05,30.16-7.04,65.4-40.75,65.31-.27,0-.54,0-.81,0-.31,0-.62,0-.92,0-33.73.1-55.82-35.21-40.71-65.37l17.67-35.27c4.11-8.2,11.37-12.97,19.17-14.35V.07c-11.53,1.49-22.46,8.25-28.5,20.31L4.09,332.64c-13.08,26.11,7.17,54.2,33.14,54.2,4.57,0,9.33-.87,14.1-2.78l61.83-24.68c25.9-10.34,53.28-15.51,80.67-15.51s54.97,5.21,80.95,15.62l61.02,24.46c4.79,1.92,9.56,2.8,14.15,2.8,25.94,0,46.2-28.04,33.17-54.15Z"
            />
          </g>
        </svg>
      </div>
      <MusicToggle />
    </header>
  )
}

export default Navbar
