'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, type KeyboardEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { projects } from '@/data/projects'
import { Arrow } from './Icons'
import MagneticLink from './MagneticLink'
import Reveal from './Reveal'
import './selected-work.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const collection = projects.slice(0, 4)
const number = (index: number) => String(index + 1).padStart(2, '0')

export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const sequence = useRef<HTMLDivElement>(null)
  const deck = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLSpanElement>(null)
  const activeIndex = useRef(0)
  const [active, setActive] = useState(0)
  const [enhanced, setEnhanced] = useState(false)
  const lenis = useLenis()

  useGSAP(
    () => {
      const section = root.current
      if (!section || !sequence.current) return
      const media = gsap.matchMedia()
      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          room: '(min-height: 560px)',
          mobile: '(max-width: 1000px)',
          pointer: '(hover: hover) and (pointer: fine)',
        },
        (context) => {
          const { motion, room, mobile, pointer } = context.conditions!
          if (!motion || !room) return

          // CSS provides the sticky stage. Native scrolling stays in charge on touch, too.
          section.dataset.enhanced = 'true'
          setEnhanced(true)
          const sheets = gsap.utils.toArray<HTMLElement>('.work-art-plane', section)
          const images = gsap.utils.toArray<HTMLElement>('.work-art-image', section)
          const captions = gsap.utils.toArray<HTMLElement>('.work-caption', section)
          const titles = collection.map((_, i) =>
            section.querySelectorAll(`#work-project-${collection[i].slug} .work-title-letter`),
          )

          sheets.forEach((sheet, index) => {
            gsap.set(sheet, {
              transformOrigin: '50% 70%',
              xPercent: index ? (mobile ? 5 : 12) : 0,
              yPercent: index ? 26 : 0,
              rotation: index ? (mobile ? 5 : 8) : 0,
              rotationX: index ? -12 : 0,
              scale: index ? 0.88 : 1,
              autoAlpha: index ? 0 : 1,
            })
            gsap.set(images[index], { scale: index ? 1.18 : 1.02 })
            if (index) {
              gsap.set(captions[index], { autoAlpha: 0 })
              gsap.set(titles[index], { yPercent: 115, rotation: 4 })
            }
          })

          const clock = { value: 0 }
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            onUpdate: () => {
              const index = Math.min(collection.length - 1, Math.floor(clock.value + 0.4))
              if (index !== activeIndex.current) {
                activeIndex.current = index
                setActive(index)
              }
            },
            scrollTrigger: {
              id: 'selected-work',
              trigger: sequence.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          })
          timeline.to(clock, { value: collection.length - 1, duration: collection.length - 1 }, 0)

          for (let i = 0; i < collection.length - 1; i++) {
            const at = i + 0.18
            // The outgoing sheet clears the frame while the next resolves behind it.
            timeline
              .to(
                sheets[i],
                {
                  xPercent: mobile ? -38 : -65,
                  yPercent: mobile ? -70 : -46,
                  rotation: mobile ? -14 : -18,
                  rotationX: 24,
                  scale: 0.76,
                  duration: 0.68,
                  ease: 'power2.inOut',
                },
                at,
              )
              .to(sheets[i], { autoAlpha: 0, duration: 0.22 }, at + 0.46)
              .to(images[i], { scale: 1.15, duration: 0.68 }, at)
              .to(
                sheets[i + 1],
                {
                  xPercent: 0,
                  yPercent: 0,
                  rotation: 0,
                  rotationX: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.72,
                  ease: 'power2.out',
                },
                at + 0.05,
              )
              .to(images[i + 1], { scale: 1.02, duration: 0.72 }, at + 0.05)
              .to(
                titles[i],
                { yPercent: -115, rotation: -4, stagger: 0.018, duration: 0.35, ease: 'power2.in' },
                at,
              )
              .to(captions[i], { autoAlpha: 0, duration: 0.18 }, at + 0.23)
              .to(captions[i + 1], { autoAlpha: 1, duration: 0.2 }, at + 0.38)
              .to(
                titles[i + 1],
                { yPercent: 0, rotation: 0, stagger: 0.018, duration: 0.34, ease: 'power3.out' },
                at + 0.38,
              )
          }

          let removePointer: (() => void) | undefined
          if (pointer && deck.current && cursor.current) {
            const surface = deck.current
            const badge = cursor.current
            gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 })
            const moveX = gsap.quickTo(badge, 'x', { duration: 0.3, ease: 'power3' })
            const moveY = gsap.quickTo(badge, 'y', { duration: 0.3, ease: 'power3' })
            let visible = false
            const hide = () => {
              visible = false
              gsap.to(badge, { scale: 0, autoAlpha: 0, duration: 0.2, overwrite: true })
            }
            const move = (event: PointerEvent) => {
              if (!(event.target as HTMLElement).closest('.work-art')) {
                if (visible) hide()
                return
              }
              const rect = surface.getBoundingClientRect()
              moveX(event.clientX - rect.left)
              moveY(event.clientY - rect.top)
              if (!visible) {
                visible = true
                gsap.to(badge, { scale: 1, autoAlpha: 1, duration: 0.25, overwrite: 'auto' })
              }
            }
            surface.addEventListener('pointermove', move)
            surface.addEventListener('pointerleave', hide)
            removePointer = () => {
              surface.removeEventListener('pointermove', move)
              surface.removeEventListener('pointerleave', hide)
              gsap.killTweensOf(badge)
            }
          }
          return () => {
            removePointer?.()
            section.removeAttribute('data-enhanced')
            setEnhanced(false)
            activeIndex.current = 0
            setActive(0)
          }
        },
      )
      return () => media.revert()
    },
    { scope: root },
  )

  function showProject(index: number) {
    const trigger = ScrollTrigger.getById('selected-work')
    if (trigger) {
      const target =
        trigger.start + ((trigger.end - trigger.start) * index) / (collection.length - 1)
      if (lenis) lenis.scrollTo(target, { duration: 1.1, force: true })
      else window.scrollTo({ top: target, behavior: 'smooth' })
    } else {
      document
        .getElementById(`work-project-${collection[index].slug}`)
        ?.scrollIntoView({ block: 'center' })
    }
  }

  function indexKeys(event: KeyboardEvent<HTMLElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-project-index]')
    if (!button) return
    const index = Number(button.dataset.projectIndex)
    const next = {
      ArrowRight: Math.min(index + 1, collection.length - 1),
      ArrowDown: Math.min(index + 1, collection.length - 1),
      ArrowLeft: Math.max(index - 1, 0),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: collection.length - 1,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    root.current
      ?.querySelector<HTMLButtonElement>(`[data-project-index="${next}"]`)
      ?.focus({ preventScroll: true })
    showProject(next)
  }

  return (
    <section
      id="work"
      className="selected-work"
      ref={root}
      data-enhanced={enhanced ? 'true' : undefined}
      aria-labelledby="work-heading"
    >
      <div className="work-intro section-pad">
        <div className="section-kicker">
          <span className="eyebrow">
            <span className="blue-dot" /> Selected work
          </span>
          <span className="eyebrow">01 — 04 / Independent & collaborative</span>
        </div>
        <Reveal>
          <h2 id="work-heading">
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

      <div className="work-sequence" ref={sequence}>
        <div className="work-sticky">
          <div className="work-stage-head">
            <span className="eyebrow">A few things. A different perspective.</span>
            <span className="work-edition eyebrow">
              Selected works <span>—</span> 01—04
            </span>
          </div>

          <div className="work-theatre">
            <div className="work-deck" ref={deck}>
              {collection.map((project, index) => (
                <article
                  id={`work-project-${project.slug}`}
                  className="work-project"
                  key={project.slug}
                  style={{ zIndex: collection.length - index }}
                  inert={enhanced && active !== index}
                  aria-hidden={enhanced && active !== index ? true : undefined}
                >
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="work-project-link"
                    aria-label={`View ${project.name} project`}
                  >
                    <div className="work-art">
                      <div className="work-art-plane">
                        <Image
                          className="work-art-image"
                          src={project.image}
                          alt={`${project.name} — ${project.headline}`}
                          fill
                          sizes="(max-width: 1000px) 100vw, 76vw"
                        />
                        <span className="work-art-label" aria-hidden="true">
                          {number(index)} / {project.discipline}
                        </span>
                        <span className="work-art-corner" aria-hidden="true">
                          <Arrow />
                        </span>
                      </div>
                    </div>
                    <div className="work-caption">
                      <div className="work-caption-main">
                        <span className="eyebrow work-project-category">{project.category}</span>
                        <h3 className="work-project-title">
                          <span className="sr-only">{project.name}</span>
                          <span className="work-title-window" aria-hidden="true">
                            {[...project.name].map((letter, i) => (
                              <span className="work-title-letter" key={i}>
                                {letter}
                              </span>
                            ))}
                          </span>
                        </h3>
                      </div>
                      <span className="work-caption-note">
                        {project.headline}
                        <span className="work-open">
                          Open project <Arrow />
                        </span>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
              <span className="work-cursor" ref={cursor} aria-hidden="true">
                View
                <Arrow />
              </span>
            </div>

            <nav
              className="work-index"
              aria-label="Select a featured project"
              onKeyDown={indexKeys}
            >
              <span className="work-index-label eyebrow">The collection</span>
              <div className="work-index-list">
                {collection.map((project, index) => (
                  <button
                    type="button"
                    key={project.slug}
                    data-project-index={index}
                    aria-label={`Show ${project.name}`}
                    aria-controls={`work-project-${project.slug}`}
                    aria-current={enhanced && active === index ? 'true' : undefined}
                    onClick={() => showProject(index)}
                  >
                    <span className="work-index-preview" aria-hidden="true">
                      <Image src={project.image} alt="" fill sizes="160px" />
                    </span>
                    <span className="work-index-number">{number(index)}</span>
                    <span className="work-index-name">{project.name}</span>
                    <span className="work-index-marker" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                ))}
              </div>
              <span className="work-index-foot eyebrow">
                Considered in detail.
                <br />
                Built to be different.
              </span>
            </nav>
          </div>

          <div className="work-stage-foot">
            <span className="work-scroll-note eyebrow">
              <span aria-hidden="true">↓</span> Scroll to unfold
            </span>
            <span className="work-position" aria-hidden="true">
              <span>{number(active)}</span>
              <span className="work-position-divider" />
              <span>04</span>
            </span>
            <div className="work-step-controls">
              <button
                type="button"
                onClick={() => showProject(active - 1)}
                disabled={active === 0}
                aria-label="Previous featured project"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => showProject(active + 1)}
                disabled={active === collection.length - 1}
                aria-label="Next featured project"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {enhanced
              ? `Project ${active + 1} of ${collection.length}: ${collection[active].name}`
              : ''}
          </span>
        </div>
      </div>

      <div className="work-bottom section-pad">
        <span className="eyebrow">There’s more where that came from.</span>
        <MagneticLink href="/portfolio">All projects</MagneticLink>
      </div>
    </section>
  )
}
