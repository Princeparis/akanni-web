import type { MetadataRoute } from 'next'
import { tools } from '@/data/tools'
import { experiments } from '@/data/experiments'
import { immersive } from '@/data/immersive'
import { projects } from '@/data/projects'
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) return []
  return [
    '',
    '/portfolio',
    '/gallery',
    '/playground',
    ...[...tools, ...immersive, ...experiments].map(
      (experiment) => `/playground/${experiment.slug}`,
    ),
    ...projects.map((p) => `/portfolio/${p.slug}`),
  ].map((path) => ({
    url: `${origin.replace(/\/$/, '')}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
