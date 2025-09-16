'use client'

import React from 'react'
import { JournalErrorBoundary } from '../JournalErrorBoundary'

interface APIErrorBoundaryProps {
  children: React.ReactNode
  operation?: string
  onRetry?: () => void
}

function APIErrorFallback({ operation, onRetry }: { operation?: string; onRetry?: () => void }) {
  return (
    <div className="error-boundary api-error">
      <div className="error-content">
        <div className="error-icon">🔌</div>
        <h2>API Connection Error</h2>
        <p>
          {operation
            ? `Failed to ${operation}. Please check your connection and try again.`
            : 'We encountered an error while communicating with the server.'}
        </p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button primary">
              Retry {operation || 'Request'}
            </button>
          )}
          <button onClick={() => window.location.reload()} className="retry-button secondary">
            Refresh Page
          </button>
        </div>
        <div className="error-help">
          <p>If the problem persists:</p>
          <ul>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Contact support if the issue continues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function APIErrorBoundary({ children, operation, onRetry }: APIErrorBoundaryProps) {
  return (
    <JournalErrorBoundary
      fallback={<APIErrorFallback operation={operation} onRetry={onRetry} />}
      maxRetries={5}
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
        // Log API errors with additional context
        console.error(`API Error during ${operation || 'unknown operation'}:`, error, errorInfo)
      }}
    >
      {children}
    </JournalErrorBoundary>
  )
}
