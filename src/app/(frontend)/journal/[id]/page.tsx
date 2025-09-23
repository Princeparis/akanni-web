import React from 'react'
import { Metadata } from 'next'
import { JournalProvider } from '../../../../contexts/JournalContext'
import JournalErrorBoundary from '../../../../components/JournalErrorBoundary'
import { JournalEntry as JournalEntryType } from '../../../../types/journal'
import { extractPlainText } from '../../../../utils/formatters'
import Menu from '@/components/menu/Menu'
import Footer from '@/components/footer/Footer'
import JournalDetailClient from './JournalDetailClient'
import { getJournalEntry } from '../../../../lib/getJournalEntry'

interface JournalEntryPageProps {
  params: Promise<{ id: string }>
}

// Generate metadata for the journal entry page
export async function generateMetadata({ params }: JournalEntryPageProps): Promise<Metadata> {
  const { id } = await params
  // Fetch entry for metadata. If it fails, return fallback metadata.
  let entry: any = null
  try {
    entry = await getJournalEntry(id)
  } catch (err) {
    // swallow - metadata should not crash the build
    // eslint-disable-next-line no-console
    console.warn('generateMetadata: getJournalEntry failed', err)
    entry = null
  }

  if (!entry) {
    return {
      title: 'Journal Entry Not Found - Akanni',
      description: 'The requested journal entry could not be found.',
      robots: 'noindex, nofollow',
    }
  }

  // Extract plain text for description
  const plainTextContent = extractPlainText(entry?.content)
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
  const canonicalUrl = `${baseUrl}/journal/${entry?.slug || id}`

  // Prepare Open Graph image
  const ogImage = entry?.coverImage?.url || `${baseUrl}/images/avatar.jpg`

  // Prepare keywords from tags and category
  const keywords = [
    'Akanni',
    'journal',
    'blog',
    entry?.category?.name,
    ...(entry?.tags?.map((tag: any) => tag.name) || []),
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
      publishedTime: entry?.publishedAt ? new Date(entry.publishedAt).toISOString() : undefined,
      modifiedTime: entry?.updatedAt ? new Date(entry.updatedAt).toISOString() : undefined,
      authors: ['Yusuff Ridwan Akanni'],
      section: entry.category?.name,
      tags: entry?.tags?.map((tag: any) => tag.name),
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
      ...(entry?.publishedAt && {
        'article:published_time': new Date(entry.publishedAt).toISOString(),
      }),
      ...(entry?.updatedAt && { 'article:modified_time': new Date(entry.updatedAt).toISOString() }),
      'article:author': 'Yusuff Ridwan Akanni',
      ...(entry.category?.name && { 'article:section': entry.category.name }),
      ...(entry.tags &&
        entry?.tags &&
        entry.tags.length > 0 && {
          'article:tag': entry.tags.map((tag: any) => tag.name).join(','),
        }),
    },
  }
}

async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { id } = await params

  // Pass the id down to the client component. The client will fetch the data by id
  return (
    <>
      <Menu />
      <JournalProvider>
        <JournalErrorBoundary>
          <JournalDetailClient entryId={id} />
        </JournalErrorBoundary>
      </JournalProvider>
      <Footer />
    </>
  )
}

export default JournalEntryPage
