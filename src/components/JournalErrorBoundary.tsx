'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorCodes } from '../types/errors'

// @ts-ignore: allow side-effect CSS import without type declarations
import './JournalErrorBoundary.css'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: ErrorInfo
  onRetry?: () => void
  retryCount?: number
  maxRetries?: number
}

// Error type detection utility
function getErrorType(error: Error): ErrorCodes {
  if (error.message.includes('fetch')) {
    return ErrorCodes.INTERNAL_ERROR
  }
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return ErrorCodes.NOT_FOUND
  }
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return ErrorCodes.UNAUTHORIZED
  }
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return ErrorCodes.FORBIDDEN
  }
  if (error.message.includes('validation')) {
    return ErrorCodes.VALIDATION_ERROR
  }
  return ErrorCodes.INTERNAL_ERROR
}

// Network Error Fallback
function NetworkErrorFallback({ onRetry, retryCount, maxRetries }: ErrorFallbackProps) {
  return (
    <div className="error-boundary network-error">
      <div className="error-content">
        <div className="error-icon">🌐</div>
        <h2>Connection Problem</h2>
        <p>Unable to connect to the server. Please check your internet connection.</p>
        {onRetry && retryCount! < maxRetries! && (
          <button onClick={onRetry} className="retry-button primary">
            Try Again {retryCount! > 0 && `(${retryCount}/${maxRetries})`}
          </button>
        )}
        {retryCount! >= maxRetries! && (
          <p className="max-retries-message">
            Maximum retry attempts reached. Please refresh the page.
          </p>
        )}
      </div>
    </div>
  )
}

// Not Found Error Fallback
function NotFoundErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div className="error-boundary not-found-error">
      <div className="error-content">
        <div className="error-icon">📄</div>
        <h2>Content Not Found</h2>
        <p>The journal entry you're looking for doesn't exist or has been removed.</p>
        <div className="error-actions">
          <button onClick={() => window.history.back()} className="retry-button secondary">
            Go Back
          </button>
          <a href="/journal" className="retry-button primary">
            Browse Journal
          </a>
        </div>
      </div>
    </div>
  )
}

// Unauthorized Error Fallback
function UnauthorizedErrorFallback(): React.ReactElement {
  return (
    <div className="error-boundary unauthorized-error">
      <div className="error-content">
        <div className="error-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this content.</p>
        <div className="error-actions">
          <a href="/admin" className="retry-button primary">
            Sign In
          </a>
          <a href="/journal" className="retry-button secondary">
            Browse Public Content
          </a>
        </div>
      </div>
    </div>
  )
}

// Generic Error Fallback
function GenericErrorFallback({
  error,
  errorInfo,
  onRetry,
  retryCount,
  maxRetries,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className="error-boundary generic-error">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>We encountered an unexpected error while loading the journal content.</p>

        {error && (
          <div className="error-details-container">
            <button onClick={() => setShowDetails(!showDetails)} className="toggle-details-button">
              {showDetails ? 'Hide' : 'Show'} Error Details
            </button>
            {showDetails && (
              <details className="error-details" open>
                <summary>Technical Details</summary>
                <div className="error-stack">
                  <strong>Error:</strong> {error.message}
                  {errorInfo?.componentStack && (
                    <>
                      <br />
                      <strong>Component Stack:</strong>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="error-actions">
          {onRetry && retryCount! < maxRetries! && (
            <button onClick={onRetry} className="retry-button primary">
              Try Again {retryCount! > 0 && `(${retryCount}/${maxRetries})`}
            </button>
          )}
          <button onClick={() => window.location.reload()} className="retry-button secondary">
            Refresh Page
          </button>
        </div>

        {retryCount! >= maxRetries! && (
          <p className="max-retries-message">
            Multiple attempts failed. Please refresh the page or try again later.
          </p>
        )}
      </div>
    </div>
  )
}

// Main Error Fallback Component
function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
}: ErrorFallbackProps) {
  if (!error) {
    return (
      <GenericErrorFallback onRetry={onRetry} retryCount={retryCount} maxRetries={maxRetries} />
    )
  }

  const errorType = getErrorType(error)

  switch (errorType) {
    case ErrorCodes.NOT_FOUND:
      return <NotFoundErrorFallback error={error} onRetry={onRetry} />
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.FORBIDDEN:
      return <UnauthorizedErrorFallback />
    case ErrorCodes.INTERNAL_ERROR:
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return (
          <NetworkErrorFallback
            error={error}
            onRetry={onRetry}
            retryCount={retryCount}
            maxRetries={maxRetries}
          />
        )
      }
      return (
        <GenericErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={onRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )
    default:
      return (
        <GenericErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={onRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )
  }
}

export class JournalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('Journal error boundary caught an error:', error, errorInfo)

    // Store error info in state
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to external service (if configured)
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys![index])

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
      console.warn('Error reporting not configured. Error:', error.message)
    }
  }

  resetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    })
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    // Increment retry count
    this.setState({ retryCount: retryCount + 1 })

    // Add delay before retry to prevent rapid successive failures
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff, max 5s

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      })
    }, retryDelay)
  }

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state
    const { fallback, maxRetries = 3 } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )
    }

    return this.props.children
  }
}

export default JournalErrorBoundary
