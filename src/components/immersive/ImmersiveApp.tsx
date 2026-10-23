'use client'

import dynamic from 'next/dynamic'
import type { ImmersiveSlug } from '@/data/immersive'
import './immersive.css'

const Matter = dynamic(() => import('./Matter'), {
  loading: () => <div className="immersive-loading">Preparing the studio…</div>,
})
const Pulse = dynamic(() => import('./Pulse'), {
  loading: () => <div className="immersive-loading is-dark">Tuning the instrument…</div>,
})

export default function ImmersiveApp({ slug }: { slug: ImmersiveSlug }) {
  return slug === 'matter' ? <Matter /> : <Pulse />
}
