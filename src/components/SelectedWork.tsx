'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { projects } from '@/data/projects'
import { Arrow } from './Icons'
import MagneticLink from './MagneticLink'
import Reveal from './Reveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)
export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const lenis = useLenis()
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
        const section = root.current
        if (!section || !rail.current) return
        section.dataset.pinned = 'true'
        const distance = () => Math.max(0, rail.current!.scrollWidth - window.innerWidth + 48)
        const tween = gsap.to(rail.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            id: 'selected-work',
            trigger: section.querySelector('.work-pin'),
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (count.current)
                count.current.textContent = String(
                  Math.min(4, Math.floor(self.progress * 4) + 1),
                ).padStart(2, '0')
              gsap.set('.work-film-progress span', { scaleX: self.progress })
            },
          },
        })
        const cards = gsap.utils.toArray<HTMLElement>('.film-card')
        cards.forEach((card) => {
          gsap.fromTo(
            card.querySelector('img'),
            { xPercent: -5, scale: 1.12 },
            {
              xPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })
        return () => {
          section.removeAttribute('data-pinned')
          if (count.current) count.current.textContent = '01'
        }
      })
      return () => media.revert()
    },
    { scope: root },
  )
  function focusProject(index: number) {
    const trigger = ScrollTrigger.getById('selected-work')
    if (!trigger) return
    const target = trigger.start + ((trigger.end - trigger.start) * index) / 3
    if (lenis) lenis.scrollTo(target, { immediate: true })
    else window.scrollTo(0, target)
  }
  return (
    <section id="work" className="selected-work" ref={root}>
      <div className="work-intro section-pad">
        <div className="section-kicker">
          <span className="eyebrow">
            <span className="blue-dot" /> Selected work
          </span>
          <span className="eyebrow">01 — 04 / Independent & collaborative</span>
        </div>
        <Reveal>
          <h2>
            Ideas made real.
            <br />
            <span className="outline-text">Nothing ordinary.</span>
          </h2>
        </Reveal>
        <div className="work-intro-note">
          <span className="eyebrow">Design / Development / Direction</span>
          <p>
            Digital products. Distinctive identities.
            <br />A few things I’ve put into the world.
          </p>
        </div>
      </div>
      <div className="work-pin">
        <div className="work-stage-top">
          <span className="eyebrow">The selected works collection</span>
          <span className="eyebrow">
            <span ref={count}>01</span> / 04
          </span>
        </div>
        <div className="film-rail" ref={rail}>
          {projects.slice(0, 4).map((project, index) => (
            <article className="film-card" key={project.slug}>
              <Link
                href={`/portfolio/${project.slug}`}
                className="film-image"
                onFocus={() => focusProject(index)}
                aria-label={`View ${project.name} project`}
              >
                <Image
                  src={project.image}
                  alt={`${project.name} — ${project.headline}`}
                  fill
                  sizes="(max-width: 760px) 100vw, 75vw"
                />
                <span className="film-image-index">0{index + 1}</span>
                <span className="film-image-cta">
                  Explore project <Arrow />
                </span>
              </Link>
              <div className="film-caption">
                <div>
                  <span className="eyebrow">{project.category}</span>
                  <h3>
                    <Link href={`/portfolio/${project.slug}`}>{project.name}</Link>
                  </h3>
                </div>
                <Link
                  className="film-arrow"
                  href={`/portfolio/${project.slug}`}
                  aria-label={`Explore ${project.name}`}
                >
                  <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="work-film-progress" aria-hidden="true">
          <span />
        </div>
        <div className="work-stage-bottom">
          <span className="eyebrow">Keep scrolling to explore →</span>
          <span className="eyebrow">Strategy. Craft. Software.</span>
        </div>
      </div>
      <div className="work-bottom section-pad">
        <span className="eyebrow">There’s more where that came from.</span>
        <MagneticLink href="/portfolio">All projects</MagneticLink>
      </div>
    </section>
  )
}
