'use client'
import React, { useEffect, useRef, useState } from 'react'
import Slider from '@/components/Slider/Slider'
import Copy from '@/components/Copy'
import Menu from '@/components/menu/Menu'
import Video from '@/components/Video/Video'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CustomEase from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import AnimatedLink from '@/components/AnimatedLink'
import fetchRecentJournals, { RecentJournal } from '../../utils/fetchRecentJournals'
import { JournalEntry as FullJournalEntry } from '@/types/journal'
import './Home.css'
import './preloader.css'
import JournalCard from '@/components/JournalCard'

let isInitialLoad = true
gsap.registerPlugin(ScrollTrigger, CustomEase)
CustomEase.create('hop', '0.9, 0, 0.1, 1')

export default function Home() {
  const tagsRef = useRef<HTMLDivElement | null>(null)
  const [showPreloader, setShowPreloader] = useState<boolean>(isInitialLoad)
  const [loaderAnimating, setLoaderAnimating] = useState<boolean>(false)
  const [entries, setEntries] = useState<RecentJournal[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
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
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: 'hop',
      },
    })

    if (showPreloader) {
      setLoaderAnimating(true)
      const counts = document.querySelectorAll<HTMLElement>('.count')

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll<HTMLElement>('.digit h1')

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

      tl.to('.spinner', {
        opacity: 0,
        duration: 0.3,
      })

      tl.to(
        '.word h1',
        {
          y: '0%',
          duration: 1,
        },
        '<',
      )

      tl.to('.divider', {
        scaleY: '100%',
        duration: 1,
        onComplete: () => {
          gsap.to('.divider', { opacity: 0, duration: 0.3, delay: 0.3 })
        },
      })

      tl.to('#word-1 h1', {
        y: '100%',
        duration: 1,
        delay: 0.3,
      })

      tl.to(
        '#word-2 h1',
        {
          y: '-100%',
          duration: 1,
        },
        '<',
      )

      tl.to(
        '.block',
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
            setLoaderAnimating(false)
          },
        },
        '<',
      )
    }
  }, [showPreloader])

  return (
    <>
      {showPreloader && (
        <div className="loader">
          <div className="overlay">
            <div className="block"></div>
            <div className="block"></div>
          </div>
          <div className="intro-logo">
            <div className="word" id="word-1">
              <h1>
                <span>Yusuff</span>
              </h1>
            </div>
            <div className="word" id="word-2">
              <h1>Ridwan</h1>
            </div>
          </div>
          <div className="divider"></div>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <div className="counter">
            <div className="count">
              <div className="digit">
                <h1>0</h1>
              </div>
              <div className="digit">
                <h1>0</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>2</h1>
              </div>
              <div className="digit">
                <h1>7</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>6</h1>
              </div>
              <div className="digit">
                <h1>5</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>9</h1>
              </div>
              <div className="digit">
                <h1>8</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>9</h1>
              </div>
              <div className="digit">
                <h1>9</h1>
              </div>
            </div>
          </div>
        </div>
      )}
      <Menu />
      <main>
        <section className="hero">
          <Video />
          <div className="hero-img-overlay"></div>
          <div className="hero-img-gradient"></div>
          <div className="content">
            <h3>Yusuff Ridwan</h3>
            <Copy>
              <h1>Creative Engineer</h1>
            </Copy>
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
            <AnimatedLink
              lastColor="#ffffff"
              textColor="#ffffff"
              strokeColor="#ffffff"
              href="#"
              text="Meet Akanni"
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
      </main>
    </>
  )
}
