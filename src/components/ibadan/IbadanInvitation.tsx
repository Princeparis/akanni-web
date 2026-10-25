'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import './invitation.css'

export default function IbadanInvitation() {
  const router = useRouter(),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [leaving, setLeaving] = useState(false)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  return (
    <section className="ibadan-invitation" aria-labelledby="ibadan-invitation-title">
      <Image
        src="/ibadan/posters/iyalode.webp"
        alt="A detailed particle portrait from the Ibadan experience"
        width={900}
        height={900}
        className="ibadan-invitation-world"
        unoptimized
      />
      <div className="ibadan-invitation-copy">
        <span className="eyebrow">Places we carry / A personal project</span>
        <h2 id="ibadan-invitation-title">
          <span>Ìbàdàn.</span>
          <small>
            A city. A people. <em>A living history.</em>
          </small>
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
            sessionStorage.setItem('ibadan-enter-from-home', 'true')
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
          Six acts · Eighteen moments · An interactive 3D history
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
