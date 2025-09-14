'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p>We encountered an error while loading the journal content.</p>
        {error && (
          <details className="error-details">
            <summary>Error details</summary>
            <pre>{error.message}</pre>
          </details>
        )}
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export class JournalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Journal error boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

export default JournalErrorBoundary
