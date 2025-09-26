'use client'
// @ts-ignore: allow side-effect CSS import without type declarations
import './Menu.css'

import { useEffect, useState, useCallback, useRef, useLayoutEffect, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'

import gsap from 'gsap'
import CustomEase from 'gsap/CustomEase'
import SplitText from 'gsap/SplitText'
import { useLenis } from 'lenis/react'

import MenuBtn from '../MenuBtn/MenuBtn'
import { useViewTransition } from '@/hooks/useViewTransition'
import AnimatedLink from '../AnimatedLink'

gsap.registerPlugin(SplitText)

const Menu = (): React.JSX.Element => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef<boolean>(false)
  const splitTextRefs = useRef<any[]>([])
  const router = useRouter()
  const lenis = useLenis()

  const { navigateWithTransition } = useViewTransition()

  useEffect(() => {
    if (lenis) {
      if (isOpen) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }
  }, [lenis, isOpen])

  useLayoutEffect(() => {
    gsap.registerPlugin(CustomEase)
    CustomEase.create('hop', 'M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1')
  }, [])

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current

      splitTextRefs.current.forEach((split) => {
        if (split.revert) split.revert()
      })
      splitTextRefs.current = []

      gsap.set(menu, {
        clipPath: 'circle(0% at 50% 50%)',
      })

      const h2Elements = menu.querySelectorAll('h2')
      const pElements = menu.querySelectorAll('p')

      h2Elements.forEach((h2, index) => {
        const split = SplitText.create(h2, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
        })

        gsap.set(split.lines, { y: '120%' })

        split.lines.forEach((line: any) => {
          line.style.pointerEvents = 'auto'
        })

        splitTextRefs.current.push(split)
      })

      pElements.forEach((p, index) => {
        const split = SplitText.create(p, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
        })

        gsap.set(split.lines, { y: '120%' })

        split.lines.forEach((line: any) => {
          line.style.pointerEvents = 'auto'
        })

        splitTextRefs.current.push(split)
      })

      isInitializedRef.current = true
    }
  }, [])

  const animateMenu = useCallback((open: boolean): void => {
    if (!menuRef.current) {
      return
    }

    const menu = menuRef.current

    setIsAnimating(true)

    if (open) {
      document.body.classList.add('menu-open')

      gsap.to(menu, {
        clipPath: 'circle(100% at 50% 50%)',
        ease: 'power3.out',
        duration: 2,
        onStart: () => {
          menu.style.pointerEvents = 'all'
          splitTextRefs.current.forEach((split, index) => {
            gsap.to(split.lines, {
              y: '0%',
              stagger: 0.05,
              delay: 0.35 + index * 0.1,
              duration: 1,
              ease: 'power4.out',
            })
          })
        },
        onComplete: () => {
          setIsAnimating(false)
        },
      })
    } else {
      const textTimeline = gsap.timeline({
        onStart: () => {
          gsap.to(menu, {
            clipPath: 'circle(0% at 50% 50%)',
            ease: 'power3.out',
            duration: 1,
            delay: 0.75,
            onComplete: () => {
              menu.style.pointerEvents = 'none'

              splitTextRefs.current.forEach((split) => {
                gsap.set(split.lines, { y: '120%' })
              })

              document.body.classList.remove('menu-open')

              setIsAnimating(false)
              setIsNavigating(false)
            },
          })
        },
      })

      splitTextRefs.current.forEach((split, index) => {
        textTimeline.to(
          split.lines,
          {
            y: '-120%',
            stagger: 0.03,
            delay: index * 0.05,
            duration: 1,
            ease: 'power3.out',
          },
          0,
        )
      })
    }
  }, [])

  useEffect(() => {
    if (isInitializedRef.current) {
      animateMenu(isOpen)
    }
  }, [isOpen, animateMenu])

  const toggleMenu = useCallback(() => {
    if (!isAnimating && isInitializedRef.current && !isNavigating) {
      setIsOpen((prevIsOpen) => {
        return !prevIsOpen
      })
    } else {
    }
  }, [isAnimating, isNavigating])

  const handleLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string): void => {
      e.preventDefault()

      const currentPath = window.location.pathname
      if (currentPath === href) {
        if (isOpen) {
          setIsOpen(false)
        }
        return
      }

      if (isNavigating) return

      setIsNavigating(true)
      navigateWithTransition(href)
    },
    [isNavigating, router, isOpen, setIsOpen],
  )

  const splitTextIntoSpans = (text: string): React.JSX.Element[] => {
    return text
      .split('')
      .map((char, index) =>
        char === ' ' ? <span key={index}>&nbsp;&nbsp;</span> : <span key={index}>{char}</span>,
      )
  }

  return (
    <div>
      <MenuBtn isOpen={isOpen} toggleMenu={toggleMenu} />
      <div className="menu" ref={menuRef}>
        <div className="menu-wrapper">
          <div className="hero-img-overlay"></div>
          <div className="col col-1">
            <div className="links">
              <div className="link">
                <a href="/" onClick={(e) => handleLinkClick(e, '/')}>
                  <h2>Home</h2>
                </a>
              </div>
              <div className="link">
                <a href="/journal" onClick={(e) => handleLinkClick(e, '/journal')}>
                  <h2>Journal</h2>
                </a>
              </div>
              <div className="link">
                <a href="/portfolio" onClick={(e) => handleLinkClick(e, '/portfolio')}>
                  <h2>Work</h2>
                </a>
              </div>
              <div className="link">
                <a href="/playground" onClick={(e) => handleLinkClick(e, '/playground')}>
                  <h2>Playground</h2>
                </a>
              </div>
              <div className="link">
                <a href="/gallery" onClick={(e) => handleLinkClick(e, '/gallery')}>
                  <h2>Gallery</h2>
                </a>
              </div>
              <div className="link">
                <a href="/ai-innovations" onClick={(e) => handleLinkClick(e, '/ai-innovations')}>
                  <h2>AI</h2>
                </a>
              </div>
            </div>
          </div>
          <div className="col col-2">
            <div className="socials">
              <div className="sub-col">
                <div className="menu-meta menu-commissions">
                  <p>Contact</p>
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="mailto:akanni@metnov.org"
                    text="akanni@metnov.org"
                  />
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="tel:+18726276989"
                    text="+1 (872) 627‑6989"
                  />
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="https://wa.link/utm5le"
                    text="Whatsapp"
                  />
                </div>
              </div>
              <div className="sub-col">
                <div className="menu-meta">
                  <p>Social</p>
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="#"
                    text="Instagram"
                  />
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="https://www.linkedin.com/in/kingakanni"
                    text="LinkedIn"
                  />
                  <AnimatedLink
                    lastColor="#ffffff"
                    textColor="#ffffff"
                    strokeColor="#ffffff"
                    href="#"
                    text="X"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu
