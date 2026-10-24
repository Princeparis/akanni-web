'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildIbadanWorld } from './world-geometry'
import './invitation.css'

export default function IbadanInvitation() {
  const router = useRouter(),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [leaving, setLeaving] = useState(false)
  const world = useMemo(() => buildIbadanWorld('arrival', 2400), [])
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  return (
    <section className="ibadan-invitation" aria-labelledby="ibadan-invitation-title">
      <svg viewBox="0 0 1200 600" className="ibadan-invitation-world" aria-hidden="true">
        {Array.from(world.kinds, (kind, i) => (
          <circle
            key={i}
            cx={600 + (world.positions[i * 3] - world.positions[i * 3 + 2]) * 28}
            cy={
              350 +
              (world.positions[i * 3] + world.positions[i * 3 + 2]) * 8 -
              world.positions[i * 3 + 1] * 49
            }
            r={kind === 2 ? 1.5 : 0.85}
            fill={kind === 2 ? '#f0dfc0' : '#bb9c6d'}
            opacity={kind === 0 ? 0.25 : 0.8}
          />
        ))}
      </svg>
      <div className="ibadan-invitation-copy">
        <span className="eyebrow">Places we carry / A personal project</span>
        <h2 id="ibadan-invitation-title">
          Ìbàdàn.
          <br />A city made <em>and remade.</em>
        </h2>
        <p>
          The people, the choices, the histories.
          <br />A place I come from. A story worth entering.
        </p>
        <Link
          className="ibadan-invitation-enter"
          href="/ibadan"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
            event.preventDefault()
            if (leaving) return
            setLeaving(true)
            timer.current = setTimeout(() => router.push('/ibadan'), 650)
          }}
        >
          Enter the Ibadan story <span aria-hidden="true">↗</span>
        </Link>
        <span className="ibadan-invitation-meta">
          Six acts · Eighteen episodes · A spatial history
        </span>
      </div>
      {leaving && (
        <div className="ibadan-invitation-veil" aria-hidden="true">
          <span>Ìbàdàn</span>
        </div>
      )}
    </section>
  )
}
