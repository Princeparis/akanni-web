'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, type MouseEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { projects, type Project } from '@/data/projects'
import { Arrow } from './Icons'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { contextSafe } = useGSAP({ scope: ref })
  const move = contextSafe((event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches)
      return
    const rect = event.currentTarget.getBoundingClientRect()
    gsap.to('.project-image', {
      x: (event.clientX - rect.left - rect.width / 2) * 0.025,
      y: (event.clientY - rect.top - rect.height / 2) * 0.025,
      scale: 1.045,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to('.project-view', {
      x: (event.clientX - rect.left - rect.width / 2) * 0.08,
      y: (event.clientY - rect.top - rect.height / 2) * 0.08,
      duration: 0.4,
      overwrite: 'auto',
    })
  })
  const reset = contextSafe(() => {
    gsap.to('.project-image', { x: 0, y: 0, scale: 1, duration: 0.7, overwrite: 'auto' })
    gsap.to('.project-view', { x: 0, y: 0, duration: 0.5, overwrite: 'auto' })
  })
  return (
    <article className={`project-card project-card-${index % 4}`}>
      <Link
        ref={ref}
        className="project-art"
        href={`/portfolio/${project.slug}`}
        onMouseMove={move}
        onMouseLeave={reset}
        style={{ backgroundColor: project.color }}
        aria-label={`View ${project.name} project`}
      >
        <Image
          className="project-image"
          src={project.image}
          alt={`${project.name} — ${project.headline}`}
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
        />
        <span className="project-corner eyebrow">
          0{index + 1} / {project.discipline}
        </span>
        <span className="project-view">
          View project <Arrow />
        </span>
      </Link>
      <div className="project-caption">
        <div>
          <h3>
            <Link href={`/portfolio/${project.slug}`}>{project.name}</Link>
          </h3>
          <p>{project.category}</p>
        </div>
        <Link
          className="project-arrow"
          href={`/portfolio/${project.slug}`}
          aria-label={`Explore ${project.name}`}
        >
          <Arrow />
        </Link>
      </div>
    </article>
  )
}

export default function ProjectGrid({ archive = false }: { archive?: boolean }) {
  const [filter, setFilter] = useState('All')
  const root = useRef<HTMLDivElement>(null)
  const pool = archive ? projects : projects.slice(0, 4)
  const visible = filter === 'All' ? pool : pool.filter((project) => project.discipline === filter)
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '.project-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
      )
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  )

  return (
    <div ref={root}>
      {archive && (
        <div className="project-filters" role="group" aria-label="Filter projects">
          {['All', 'Product', 'Brand', 'Web'].map((item) => (
            <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>
              {item}
              <sup>
                {item === 'All' ? pool.length : pool.filter((p) => p.discipline === item).length}
              </sup>
            </button>
          ))}
        </div>
      )}
      <div className="project-grid">
        {visible.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
      {archive && (
        <p className="sr-only" role="status">
          {visible.length} projects shown
        </p>
      )}
    </div>
  )
}
