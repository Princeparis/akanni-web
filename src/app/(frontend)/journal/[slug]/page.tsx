import React from 'react'
import { Metadata } from 'next'
import { JournalProvider } from '../../../../contexts/JournalContext'
import JournalErrorBoundary from '../../../../components/JournalErrorBoundary'
import JournalEntryClient from './JournalEntryClient.js'
import { JournalEntry as JournalEntryType } from '../../../../types/journal'
import { extractPlainText } from '../../../../utils/formatters'

interface JournalEntryPageProps {
  params: Promise<{ slug: string }>
}

// Fetch journal entry data for metadata generation
async function getJournalEntry(slug: string): Promise<JournalEntryType | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/journals/${encodeURIComponent(slug)}`, {
      cache: 'no-store', // Ensure fresh data for metadata
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching journal entry for metadata:', error)
    return null
  }
}

// Generate metadata for the journal entry page
export async function generateMetadata({ params }: JournalEntryPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = await getJournalEntry(slug)

  if (!entry) {
    return {
      title: 'Journal Entry Not Found - Akanni',
      description: 'The requested journal entry could not be found.',
      robots: 'noindex, nofollow',
    }
  }

  // Extract plain text for description
  const plainTextContent = extractPlainText(entry.content)
  const description =
    entry.seo?.description ||
    entry.excerpt ||
    (plainTextContent.length > 160
      ? plainTextContent.substring(0, 157) + '...'
      : plainTextContent) ||
    'Read this journal entry by Akanni'

  const title = entry.seo?.title || `${entry.title} - Akanni`

  // Build canonical URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const canonicalUrl = `${baseUrl}/journal/${entry.slug}`

  // Prepare Open Graph image
  const ogImage = entry.coverImage?.url || `${baseUrl}/images/avatar.jpg`

  // Prepare keywords from tags and category
  const keywords = [
    'Akanni',
    'journal',
    'blog',
    entry.category?.name,
    ...(entry.tags?.map((tag) => tag.name) || []),
  ]
    .filter(Boolean)
    .join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Yusuff Ridwan Akanni' }],
    creator: 'Yusuff Ridwan Akanni',
    publisher: 'Akanni',

    // Open Graph metadata
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Akanni - Creative Engineer',
      type: 'article',
      publishedTime: entry.publishedAt?.toISOString(),
      modifiedTime: entry.updatedAt.toISOString(),
      authors: ['Yusuff Ridwan Akanni'],
      section: entry.category?.name,
      tags: entry.tags?.map((tag) => tag.name),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@akanniakanni', // Replace with actual Twitter handle
      images: [ogImage],
    },

    // Additional metadata
    alternates: {
      canonical: canonicalUrl,
    },

    // Structured data will be handled in the component
    other: {
      ...(entry.publishedAt && { 'article:published_time': entry.publishedAt.toISOString() }),
      'article:modified_time': entry.updatedAt.toISOString(),
      'article:author': 'Yusuff Ridwan Akanni',
      ...(entry.category?.name && { 'article:section': entry.category.name }),
      ...(entry.tags &&
        entry.tags.length > 0 && { 'article:tag': entry.tags.map((tag) => tag.name).join(',') }),
    },
  }
}

async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { slug } = await params

  return (
    <JournalErrorBoundary>
      <JournalProvider>
        <JournalEntryClient slug={slug} />
      </JournalProvider>
    </JournalErrorBoundary>
  )
}

export default JournalEntryPage
