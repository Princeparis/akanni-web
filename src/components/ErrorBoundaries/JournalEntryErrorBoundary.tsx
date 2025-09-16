'use client'

import React from 'react'
import { JournalErrorBoundary } from '../JournalErrorBoundary'

interface JournalEntryErrorBoundaryProps {
  children: React.ReactNode
  slug?: string
  onRetry?: () => void
}

function JournalEntryErrorFallback({ slug, onRetry }: { slug?: string; onRetry?: () => void }) {
  return (
    <div className="error-boundary journal-entry-error">
      <div className="error-content">
        <div className="error-icon">📄</div>
        <h2>Unable to Load Journal Entry</h2>
        <p>
          {slug
            ? `We couldn't load the journal entry "${slug}". It might have been moved or deleted.`
            : 'We encountered an error while loading this journal entry.'}
        </p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button primary">
              Try Again
            </button>
          )}
          <button onClick={() => window.history.back()} className="retry-button secondary">
            Go Back
          </button>
          <a href="/journal" className="retry-button secondary">
            Browse All Entries
          </a>
        </div>
      </div>
    </div>
  )
}

export function JournalEntryErrorBoundary({
  children,
  slug,
  onRetry,
}: JournalEntryErrorBoundaryProps) {
  return (
    <JournalErrorBoundary
      fallback={<JournalEntryErrorFallback slug={slug} onRetry={onRetry} />}
      maxRetries={3}
      resetKeys={slug ? [slug] : []}
      resetOnPropsChange={true}
    >
      {children}
    </JournalErrorBoundary>
  )
}
