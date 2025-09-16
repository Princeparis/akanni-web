'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useJournalEntry } from '../../hooks/useJournalEntry'
import { formatDate, extractPlainText } from '../../utils/formatters'
import { JournalEntry as JournalEntryType } from '../../types/journal'
import './JournalEntry.css'

interface JournalEntryProps {
  slug: string
}

interface RichTextRendererProps {
  content: any
}

function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content || !content.root || !content.root.children) {
    return <div className="journal-content-empty">No content available</div>
  }

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="journal-paragraph">
            {node.children?.map((child: any, childIndex: number) =>
              renderTextNode(child, childIndex),
            )}
          </p>
        )

      case 'heading':
        const headingLevel = Math.min(Math.max(node.tag || 2, 1), 6)
        const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
        return (
          <HeadingTag key={index} className={`journal-heading journal-heading-${headingLevel}`}>
            {node.children?.map((child: any, childIndex: number) =>
              renderTextNode(child, childIndex),
            )}
          </HeadingTag>
        )

      case 'list':
        const ListTag = node.listType === 'number' ? 'ol' : 'ul'
        return (
          <ListTag key={index} className={`journal-list journal-list-${node.listType || 'bullet'}`}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </ListTag>
        )

      case 'listitem':
        return (
          <li key={index} className="journal-list-item">
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </li>
        )

      case 'quote':
        return (
          <blockquote key={index} className="journal-quote">
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </blockquote>
        )

      default:
        // Handle unknown node types gracefully
        if (node.children) {
          return (
            <div key={index} className="journal-unknown-node">
              {node.children.map((child: any, childIndex: number) => renderNode(child, childIndex))}
            </div>
          )
        }
        return null
    }
  }

  const renderTextNode = (node: any, index: number): React.ReactNode => {
    if (!node || typeof node.text !== 'string') return null

    let text = node.text
    let element = <span key={index}>{text}</span>

    // Apply formatting
    if (node.format) {
      if (node.format & 1) {
        // Bold
        element = <strong key={index}>{element}</strong>
      }
      if (node.format & 2) {
        // Italic
        element = <em key={index}>{element}</em>
      }
      if (node.format & 8) {
        // Underline
        element = <u key={index}>{element}</u>
      }
      if (node.format & 16) {
        // Strikethrough
        element = <s key={index}>{element}</s>
      }
    }

    return element
  }

  return (
    <div className="journal-rich-content">
      {content.root.children.map((node: any, index: number) => renderNode(node, index))}
    </div>
  )
}

interface AudioPlayerProps {
  audioUrl: string
  title: string
}

function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  return (
    <div className="journal-audio-player">
      <div className="audio-player-header">
        <h3>Listen to this entry</h3>
      </div>
      <audio
        ref={audioRef}
        controls
        className="audio-player-controls"
        preload="metadata"
        aria-label={`Audio for ${title}`}
      >
        <source src={audioUrl} type="audio/mpeg" />
        <source src={audioUrl} type="audio/wav" />
        <source src={audioUrl} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

interface CoverImageProps {
  coverImage: JournalEntryType['coverImage']
  title: string
}

function CoverImage({ coverImage, title }: CoverImageProps) {
  if (!coverImage || !coverImage.url) return null

  return (
    <div className="journal-cover-image">
      <img
        src={coverImage.url}
        alt={coverImage.alt || `Cover image for ${title}`}
        className="cover-image"
        loading="eager"
        width={coverImage.width || undefined}
        height={coverImage.height || undefined}
      />
    </div>
  )
}

interface StructuredDataProps {
  entry: JournalEntryType
}

function StructuredData({ entry }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const articleUrl = `${baseUrl}/journal/${entry.slug}`
  const authorUrl = `${baseUrl}/#about`
  const plainTextContent = extractPlainText(entry.content)

  // Article structured data
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.title,
    description: entry.excerpt || plainTextContent.substring(0, 160),
    image: entry.coverImage?.url ? [entry.coverImage.url] : [`${baseUrl}/images/avatar.jpg`],
    datePublished: entry.publishedAt?.toISOString() || entry.createdAt.toISOString(),
    dateModified: entry.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Yusuff Ridwan Akanni',
      url: authorUrl,
      sameAs: [
        // Add social media profiles here
        'https://linkedin.com/in/akanniakanni',
        'https://github.com/akanniakanni',
      ],
    },
    publisher: {
      '@type': 'Person',
      name: 'Yusuff Ridwan Akanni',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/avatar.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    wordCount: plainTextContent.split(' ').length,
    keywords: [entry.category?.name, ...(entry.tags?.map((tag) => tag.name) || [])]
      .filter(Boolean)
      .join(', '),
    articleSection: entry.category?.name,
    about: entry.tags?.map((tag) => ({
      '@type': 'Thing',
      name: tag.name,
    })),
    // Add audio object if audio URL exists
    ...(entry.audioUrl && {
      associatedMedia: {
        '@type': 'AudioObject',
        contentUrl: entry.audioUrl,
        description: `Audio version of ${entry.title}`,
      },
    }),
  }

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal',
        item: `${baseUrl}/journal`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: entry.title,
        item: articleUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  )
}

interface MetadataProps {
  entry: JournalEntryType
}

function Metadata({ entry }: MetadataProps) {
  return (
    <div className="journal-metadata">
      <div className="journal-meta-row">
        <time className="journal-date" dateTime={entry.publishedAt?.toISOString()}>
          {formatDate(entry.publishedAt || entry.createdAt)}
        </time>
        {entry.author && (
          <span className="journal-author">by {entry.author.email || 'Anonymous'}</span>
        )}
      </div>

      {(entry.category || (entry.tags && entry.tags.length > 0)) && (
        <div className="journal-taxonomy">
          {entry.category && (
            <div className="journal-category-wrapper">
              <span className="taxonomy-label">Category:</span>
              <Link
                href={`/journal?category=${entry.category.slug}`}
                className="journal-category-link"
                style={{ backgroundColor: entry.category.color || '#007acc' }}
              >
                {entry.category.name}
              </Link>
            </div>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="journal-tags-wrapper">
              <span className="taxonomy-label">Tags:</span>
              <div className="journal-tags">
                {entry.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/journal?tags=${tag.slug}`}
                    className="journal-tag-link"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function JournalEntry({ slug }: JournalEntryProps) {
  const { entry, loading, error, fetchEntry } = useJournalEntry()

  useEffect(() => {
    if (slug) {
      fetchEntry(slug)
    }
  }, [slug, fetchEntry])

  if (loading) {
    return (
      <div className="journal-entry-loading">
        <div className="loading-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="journal-entry-error">
        <h1>Error Loading Entry</h1>
        <p>{error}</p>
        <button onClick={() => fetchEntry(slug)} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="journal-entry-not-found">
        <h1>Journal Entry Not Found</h1>
        <p>The requested journal entry could not be found.</p>
        <Link href="/journal" className="back-to-journal">
          ← Back to Journal
        </Link>
      </div>
    )
  }

  return (
    <>
      <StructuredData entry={entry} />
      <article className="journal-entry">
        <header className="journal-entry-header">
          <div className="journal-navigation">
            <Link href="/journal" className="back-link">
              ← Back to Journal
            </Link>
          </div>

          <h1 className="journal-entry-title">{entry.title}</h1>

          <Metadata entry={entry} />
        </header>

        <div className="journal-entry-body">
          <CoverImage coverImage={entry.coverImage} title={entry.title} />

          {entry.audioUrl && <AudioPlayer audioUrl={entry.audioUrl} title={entry.title} />}

          <div className="journal-entry-content">
            <RichTextRenderer content={entry.content} />
          </div>
        </div>
      </article>
    </>
  )
}

export default JournalEntry
