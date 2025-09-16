'use client'

import React from 'react'
import { JournalErrorBoundary } from '../JournalErrorBoundary'

interface JournalListErrorBoundaryProps {
  children: React.ReactNode
  onRetry?: () => void
}

function JournalListErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="error-boundary journal-list-error">
      <div className="error-content">
        <div className="error-icon">📝</div>
        <h2>Unable to Load Journal Entries</h2>
        <p>We're having trouble loading the journal entries. This might be a temporary issue.</p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button primary">
              Reload Entries
            </button>
          )}
          <button onClick={() => window.location.reload()} className="retry-button secondary">
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export function JournalListErrorBoundary({ children, onRetry }: JournalListErrorBoundaryProps) {
  return (
    <JournalErrorBoundary
      fallback={<JournalListErrorFallback onRetry={onRetry} />}
      maxRetries={5}
      resetOnPropsChange={true}
    >
      {children}
    </JournalErrorBoundary>
  )
}
