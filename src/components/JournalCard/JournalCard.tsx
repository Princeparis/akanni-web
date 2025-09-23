'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import { JournalEntry } from '../../types/journal'
import OptimizedImage from '../OptimizedImage'
import { usePerformanceMonitor } from '../../utils/performance'
import './JournalCard.css'
import ShuffleText from '../ShuffleText/ShuffleText'

interface JournalCardProps {
  entry: JournalEntry
  className?: string
  showExcerpt?: boolean
  showAudioIndicator?: boolean
}

// Format date for display
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Extract text content from rich text (Lexical format)
function extractTextFromRichText(content: any): string {
  if (!content) return ''

  try {
    // Handle Lexical format
    if (content.root && content.root.children) {
      let text = ''
      const extractFromNode = (node: any): void => {
        if (node.text) {
          text += node.text + ' '
        }
        if (node.children) {
          node.children.forEach(extractFromNode)
        }
      }
      content.root.children.forEach(extractFromNode)
      return text.trim()
    }

    // Handle plain text
    if (typeof content === 'string') {
      return content
    }

    return ''
  } catch (error) {
    console.warn('Error extracting text from rich content:', error)
    return ''
  }
}

const JournalCard = memo(function JournalCard({
  entry,
  className = '',
  showExcerpt = true,
  showAudioIndicator = true,
}: JournalCardProps) {
  const { measureRender } = usePerformanceMonitor('JournalCard')

  const publishedDate = new Date(entry.publishedAt || entry.createdAt)
  const excerpt = entry.excerpt || extractTextFromRichText(entry.content)
  const truncatedExcerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt

  return measureRender(() => (
    <article className={`journal-card ${className}`}>
      <Link href={`/journal/${entry.id}`} className="journal-card-link">
        {/* Cover Image */}
        <div className="journal-card-image">
          {entry.coverImage ? (
            <img
              src={
                typeof entry.coverImage === 'string' ? entry.coverImage : entry.coverImage.url || ''
              }
              alt={entry.coverImage?.alt || entry.title}
            />
          ) : (
            <div className="journal-card-placeholder-image">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          )}

          {/* Audio Indicator */}
          {/* {showAudioIndicator && entry.audioUrl && (
            <div className="audio-indicator" aria-label="Audio content available">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </div>
          )} */}

          {/* Status Badge for Draft */}
          {entry.status === 'draft' && <div className="status-badge draft-badge">Draft</div>}
        </div>

        {/* Content */}
        <div className="journal-card-content">
          {/* Meta Information */}
          <div className="journal-card-meta">
            {entry.category && (
              <span
                className="journal-card-category"
                style={{ backgroundColor: entry.category.color || '#b2e3ff' }}
              >
                {entry.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="title-time">
            <ShuffleText as="h3" text={entry.title} className="journal-card-title" />
            <time className="journal-card-date" dateTime={publishedDate.toISOString()}>
              {formatDate(publishedDate)}
            </time>
          </div>

          {/* Excerpt */}
          {/* {showExcerpt && truncatedExcerpt && (
            <p className="journal-card-excerpt">{truncatedExcerpt}</p>
          )} */}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="journal-card-tags">
              {entry.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="journal-card-tag">
                  {tag.name}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="journal-card-tag-more">+{entry.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  ))
})

export default JournalCard
