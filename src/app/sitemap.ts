import { MetadataRoute } from 'next'

interface JournalEntry {
  slug: string
  updatedAt: string
  status: string
}

async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/journals?limit=1000&status=published`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch journal entries for sitemap')
      return []
    }

    const result = await response.json()
    return result.success ? result.data.docs : []
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
