'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { tools, type ToolDefinition } from '@/data/tools'
import { reducedMotion } from './shared'
import './tools.css'
function Loading() {
  return (
    <div className="tool-loading" role="status">
      Opening your instrument…
    </div>
  )
}
const components = {
  calculator: dynamic(() => import('./Calculator'), { loading: Loading }),
  'palette-studio': dynamic(() => import('./PaletteStudio'), { loading: Loading }),
  'type-scale': dynamic(() => import('./TypeScale'), { loading: Loading }),
  'focus-timer': dynamic(() => import('./FocusTimer'), { loading: Loading }),
  'image-lab': dynamic(() => import('./ImageLab'), { loading: Loading }),
  'motion-studio': dynamic(() => import('./MotionStudio'), { loading: Loading }),
}
export default function ToolApp({ tool }: { tool: ToolDefinition }) {
  const root = useRef<HTMLElement>(null),
    Component = components[tool.slug]
  const next = tools[(tools.findIndex((value) => value.slug === tool.slug) + 1) % tools.length]
  useGSAP(
    () => {
      if (!reducedMotion())
        gsap.from('.tool-enter', {
          y: 22,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
        })
    },
    { scope: root },
  )
  return (
    <main id="main" className={`utility-app utility-${tool.slug}`} ref={root}>
      <header className="utility-bar">
        <Link href="/playground">← All experiments</Link>
        <span>Useful curiosities / {tool.number}</span>
        <a href="#tool-notes">How it works ↙</a>
      </header>
      <section className="utility-heading tool-enter">
        <div>
          <span className="tool-eyebrow">
            {tool.number} / {tool.medium}
          </span>
          <h1>
            {tool.title}
            <span>↗</span>
          </h1>
        </div>
        <p>{tool.introduction}</p>
      </section>
      <div className="tool-enter">
        <Component />
      </div>
      <section className="utility-notes" id="tool-notes">
        <div>
          <span className="tool-eyebrow">A look under the surface</span>
          <h2>
            Useful by design.
            <br />
            Curious by nature.
          </h2>
          <p>{tool.principle}</p>
        </div>
        <pre tabIndex={0}>
          <code>{tool.code}</code>
        </pre>
      </section>
      <footer className="utility-end">
        <Link href="/playground">← Back to the collection</Link>
        <Link href={`/playground/${next.slug}`}>Next tool: {next.title} ↗</Link>
      </footer>
    </main>
  )
}
