import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '../payload.config'

interface JournalEntry {
  slug: string
  updatedAt: string
  status: string
}

async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    // Query Payload directly to avoid external HTTP calls during build.
    // Pass disableOnInit to avoid running background initializers during static generation
    // Provide a minimal importMap to satisfy the InitOptions type. Avoid accessing
    // config.admin directly because the `config` symbol here may be a Promise.
    const payload = await getPayload({
      config,
      disableOnInit: true,
      importMap: {},
      cron: undefined,
    })

    const journalsResult = await payload.find({
      collection: 'journals',
      where: { status: { equals: 'published' } },
      limit: 1000,
      sort: '-updatedAt',
      depth: 1,
    })

    return journalsResult.docs.map((doc: any) => ({
      slug: doc.slug,
      updatedAt: doc.updatedAt || doc.createdAt,
      status: doc.status || 'published',
    }))
  } catch (error) {
    console.error('Error fetching journal entries for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Dynamic journal entries
  const journalEntries = await getJournalEntries()
  const journalPages: MetadataRoute.Sitemap = journalEntries.map((entry) => ({
    url: `${baseUrl}/journal/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...journalPages]
}
