'use client'
import React, { useEffect, useRef, useState } from 'react'
import Slider from '@/components/Slider/Slider'
import Copy from '@/components/Copy'
import Menu from '@/components/menu/Menu'
import Video from '@/components/Video/Video'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import CustomEase from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import AnimatedLink from '@/components/AnimatedLink'
import fetchRecentJournals, { RecentJournal } from '../../utils/fetchRecentJournals'
import { JournalEntry as FullJournalEntry } from '@/types/journal'
import { AboutDataItems } from '@/utils/aboutData'
import { ExperienceData } from '@/utils/aboutData'
// @ts-ignore: allow side-effect CSS import without type declarations
import './Home.css'
// @ts-ignore: allow side-effect CSS import without type declarations
import './preloader.css'

// @ts-ignore: allow side-effect CSS import without type declarations
import './about.css'
import JournalCard from '@/components/JournalCard'
import Footer from '@/components/footer/Footer'
import InteractiveBtn from '@/components/InteractiveBtn/InteractiveBtn'
import ExperienceCard from '@/components/ExperienceCard/ExperienceCard'

let isInitialLoad = true
gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)
CustomEase.create('hop', '0.9, 0, 0.1, 1')

export default function Home() {
  const tagsRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const aboutHeadTextRef = useRef<HTMLHeadingElement | null>(null)
  const charRef = useRef<any[]>([])
  const wordsRef = useRef<any[]>([])
  const aboutRef = useRef<HTMLDivElement | null>(null)
  const aboutTlRef = useRef<gsap.core.Timeline | null>(null)
  const [showPreloader, setShowPreloader] = useState<boolean>(isInitialLoad)
  const [loaderAnimating, setLoaderAnimating] = useState<boolean>(false)
  const [entries, setEntries] = useState<RecentJournal[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState<boolean>(false)
  const lenis = useLenis() as any

  useEffect(() => {
    return () => {
      isInitialLoad = false
    }
  }, [])

  useEffect(() => {
    if (lenis) {
      if (loaderAnimating) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }
  }, [lenis, loaderAnimating])

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetchRecentJournals(3)
      .then((data: RecentJournal[]) => {
        if (!mounted) return
        setEntries(data)
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // preloader animation
  useGSAP(() => {
    wordsRef.current = []
    let split = new SplitText(titleRef.current, {
      type: 'words lines',
      mask: 'lines',
      linesClass: 'line++',
    })
    wordsRef.current.push(...split.words)
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: 'hop',
      },
    })

    if (showPreloader) {
      setLoaderAnimating(true)
      const counts = document.querySelectorAll<HTMLElement>('.pre-count')

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll<HTMLElement>('.pre-digit h1')

        tl.to(
          digits as any,
          {
            y: '0%',
            duration: 1,
            stagger: 0.075,
          },
          index * 1,
        )

        if (index < counts.length) {
          tl.to(
            digits as any,
            {
              y: '-100%',
              duration: 1,
              stagger: 0.075,
            },
            index * 1 + 1,
          )
        }
      })

      tl.to('.pre-spinner', {
        opacity: 0,
        duration: 0.3,
      })

      tl.to(
        '.pre-word h1',
        {
          y: '0%',
          duration: 1,
        },
        '<',
      )

      tl.to('.pre-divider', {
        scaleY: '100%',
        duration: 1,
        onComplete: () => {
          gsap.to('.pre-divider', { opacity: 0, duration: 0.3, delay: 0.3 })
        },
      })

      tl.to('#pre-word-1 h1', {
        y: '100%',
        duration: 1,
        delay: 0.3,
      })

      tl.to(
        '#pre-word-2 h1',
        {
          y: '-100%',
          duration: 1,
        },
        '<',
      )

      tl.to(
        '.pre-block',
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          duration: 1,
          stagger: 0.1,
          delay: 0.75,
          onStart: () => {
            gsap.to('.hero-img', { scale: 1, duration: 2, ease: 'hop' })
          },
          onComplete: () => {
            gsap.set('.loader', { pointerEvents: 'none' })
          },
        },
        '<',
      )

      tl.from(
        wordsRef.current,
        {
          y: '100%',
          duration: 0.5,
          delay: 0.2,
          stagger: 0.1,
          onComplete: () => {
            setLoaderAnimating(false)
          },
        },
        '<',
      )
    }
  }, [showPreloader])

  const { contextSafe } = useGSAP(
    () => {
      charRef.current = []
      let split = new SplitText(aboutHeadTextRef.current, {
        type: 'words lines chars',
        mask: 'lines',
        linesClass: 'line++',
      })
      charRef.current.push(...split.chars)
      if (aboutRef.current) {
        aboutTlRef.current = gsap
          .timeline({ paused: true })
          .to(
            aboutRef.current,
            {
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              duration: 0.6,
              ease: 'power4.inOut',
            },
            0,
          )
          .from(
            charRef.current,
            {
              y: '120%',
              opacity: 0,
              duration: 0.1,
              ease: 'power4.out',
              stagger: 0.1,
            },
            '-=.4',
          )
          .from(
            aboutRef.current.querySelectorAll('.about-item'),
            {
              y: '120%',
              opacity: 0,
              duration: 0.5,
              ease: 'power4.out',
              stagger: 0.1,
            },
            '-=.2',
          )
          .from(
            aboutRef.current.querySelectorAll('.experience .about-sub-title'),
            {
              opacity: 0,
              duration: 0.3,
              ease: 'power4.out',
              stagger: 0.1,
            },
            '-=.2',
          )
          .from(
            aboutRef.current.querySelectorAll('.experience .experience-card'),
            {
              x: '120%',
              opacity: 0,
              duration: 0.5,
              ease: 'power4.out',
              stagger: 0.1,
            },
            '-=.2',
          )
      } else {
        aboutTlRef.current = gsap.timeline({ paused: true })
      }
    },
    { scope: tagsRef, revertOnUpdate: true },
  )

  const handleAboutPlay = contextSafe(() => {
    if (aboutTlRef.current) {
      aboutTlRef.current.play()
    }
  })

  const handleAboutReverse = contextSafe(() => {
    if (aboutTlRef.current) {
      aboutTlRef.current.reverse()
    }
  })

  const handleOpenAbout = () => {
    if (aboutOpen) return
    // set the intended state first, then play the timeline
    setAboutOpen(true)
    handleAboutPlay()
  }

  const handleCloseAbout = () => {
    if (!aboutOpen) return
    // set the intended state first, then reverse the timeline
    setAboutOpen(false)
    handleAboutReverse()
  }

  return (
    <>
      {showPreloader && (
        <div className="pre-loader">
          <div className="pre-overlay">
            <div className="pre-block"></div>
            <div className="pre-block"></div>
          </div>
          <div className="pre-intro-logo">
            <div className="pre-word" id="pre-word-1">
              <h1>
                <span>Yusuff</span>
              </h1>
            </div>
            <div className="pre-word" id="pre-word-2">
              <h1>Ridwan</h1>
            </div>
          </div>
          <div className="pre-divider"></div>
          <div className="pre-spinner-container">
            <div className="pre-spinner"></div>
          </div>
          <div className="pre-counter">
            <div className="pre-count">
              <div className="pre-digit">
                <h1 className="pre-counter-text">0</h1>
              </div>
              <div className="pre-digit">
                <h1 className="pre-counter-text">0</h1>
              </div>
            </div>
            <div className="pre-count">
              <div className="pre-digit">
                <h1 className="pre-counter-text">2</h1>
              </div>
              <div className="pre-digit">
                <h1 className="pre-counter-text">7</h1>
              </div>
            </div>
            <div className="pre-count">
              <div className="pre-digit">
                <h1 className="pre-counter-text">6</h1>
              </div>
              <div className="pre-digit">
                <h1 className="pre-counter-text">5</h1>
              </div>
            </div>
            <div className="pre-count">
              <div className="pre-digit">
                <h1 className="pre-counter-text">9</h1>
              </div>
              <div className="pre-digit">
                <h1 className="pre-counter-text">8</h1>
              </div>
            </div>
            <div className="pre-count">
              <div className="pre-digit">
                <h1 className="pre-counter-text">9</h1>
              </div>
              <div className="pre-digit">
                <h1 className="pre-counter-text">9</h1>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="about-slide" ref={aboutRef} data-open={aboutOpen}>
        <div className="about-slide-header">
          <h2 ref={aboutHeadTextRef}>About Me</h2>
          <button className="close-btn" onClick={handleCloseAbout} aria-label="Close About Me">
            &times; Close
          </button>
        </div>
        <div className="about-slide-content">
          {AboutDataItems.map((item, index) => {
            return (
              <div key={index} className="about-item">
                {item.title && <h3>{item.title}</h3>}
                <p>{item.content}</p>
              </div>
            )
          })}
        </div>
        <div className="experience">
          <div className="subtitle-cont">
            <h3 className="about-sub-title">Experience</h3>
          </div>
          {ExperienceData.map((item, index) => {
            return <ExperienceCard className="experience-card" key={index} item={item} />
          })}
        </div>
        <a
          href="/resume.pdf"
          rel="noopener noreferrer"
          download="/resume.pdf"
          className="resume-btn"
        >
          Download Resume
        </a>
      </div>
      <Menu />
      <main className="home">
        <section className="hero">
          <Video />
          <div className="hero-img-overlay"></div>
          <div className="hero-img-gradient"></div>
          <div className="content">
            <h3 className="hero-subtitle">Yusuff Ridwan</h3>
            <h1 className="hero-title" ref={titleRef}>
              Creative Engineer
            </h1>
            <div className="chips">
              <div className="chip">Designer</div>
              <div className="chip">Developer</div>
              <div className="chip">Ai Developer</div>
              <div className="chip">Ai Designer</div>
              <div className="chip">Writer</div>
            </div>
          </div>
        </section>
        <section className="about">
          <div className="image-cont">
            <img src="/images/akanni-web.jpg" alt="headshot of me" />
            <div className="hero-img-overlay"></div>
          </div>
          <div className="text-cont">
            <Copy>
              <p className="about-text">
                I build brands that feel inevitable and the products that carry them. For 10+ years
                I’ve designed identities, UX/UI, and visuals that actually move people. Along the
                way I added an uncommon edge: AI fluency for writing, design, and photography that
                multiplies creative output. In the last six years I’ve gone deep on code—web,
                mobile, and backend—shipping with Python, TypeScript, and pure JavaScript. I’m a
                unicorn creative engineer: strategy, craft, and software in one pair of hands.
              </p>
            </Copy>
            <InteractiveBtn
              text="Explore More"
              containerStyle={{ marginTop: '1rem' }}
              strokeColor="#ffffff"
              lastColor="#ffffff"
              textColor="#ffffff"
              handleInteraction={handleOpenAbout}
            />
          </div>
        </section>
        <Slider />
        <section className="journal">
          <div className="journal-header">
            <Copy delay={0.3}>
              <h5>
                Read the latest Journal entries from me to catch up with latest ai trends, design
                industry news and development innovations.
              </h5>
            </Copy>
            <AnimatedLink
              lastColor="#ffffff"
              textColor="#ffffff"
              strokeColor="#ffffff"
              href="#"
              text="Read More"
            />
          </div>

          {/* Basic render of fetched journal entries (if any) */}
          {loading && <p>Loading journals and updates please wait...</p>}
          {error && <p className="error">{error}</p>}
          {entries && entries.length > 0 && (
            <div className="journal-home-list">
              {entries.map((entry) => (
                <JournalCard
                  key={entry.id || entry.slug || entry.title}
                  entry={entry as unknown as FullJournalEntry}
                />
              ))}
            </div>
          )}
        </section>
        <Footer />
      </main>
    </>
  )
}
