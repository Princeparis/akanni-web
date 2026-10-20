'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Asterisk } from './Icons'
export default function Playground() {
  const root = useRef<HTMLDivElement>(null)
  const rotations = useRef(0)
  const [alternate, setAlternate] = useState(false)
  const { contextSafe } = useGSAP({ scope: root })
  const rotate = contextSafe(() => {
    rotations.current += 180
    gsap.to('.lab-flower', {
      rotation: rotations.current,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1.4,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
    })
  })
  const change = contextSafe(() => {
    setAlternate((value) => !value)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      gsap.fromTo(
        '.lab-type',
        { scale: 0.85, rotate: -5 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
      )
  })
  return (
    <div className="lab-grid" ref={root}>
      <section className="lab-card">
        <span className="eyebrow">01 / A little momentum</span>
        <div className="lab-play">
          <button className="lab-flower" onClick={rotate} aria-label="Spin the asterisk">
            <Asterisk />
          </button>
        </div>
        <h2>Give curiosity a spin.</h2>
        <p>
          Click the asterisk. A small experiment in motion, momentum, and a little elastic energy.
        </p>
      </section>
      <section className="lab-card">
        <span className="eyebrow">02 / Two sides of the same mind</span>
        <div className="lab-play">
          <button className="lab-type" onClick={change} aria-label="Switch between craft and code">
            {alternate ? 'Code.' : 'Craft.'}
          </button>
        </div>
        <h2>Craft meets code.</h2>
        <p>
          Click the word. Two disciplines, one connected process. The best work lives somewhere in
          between.
        </p>
      </section>
    </div>
  )
}
