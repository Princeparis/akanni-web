/**
 * Data formatting utilities
 * Based on requirements 4.2 and 7.1
 */

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return dateObj.toLocaleDateString('en-US', options || defaultOptions)
}

/**
 * Formats a date to ISO string for API usage
 */
export function formatDateForAPI(date: Date | string): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return dateObj.toISOString()
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }

  return num.toLocaleString()
}

/**
 * Extracts plain text from rich text content (basic implementation)
 */
export function extractPlainText(richTextContent: any): string {
  if (!richTextContent || typeof richTextContent !== 'object') {
    return ''
  }

  // Basic extraction for Lexical content
  // This is a simplified version - in practice, you'd want a more robust parser
  try {
    if (richTextContent.root && richTextContent.root.children) {
      return richTextContent.root.children
        .map((child: any) => {
          if (child.type === 'paragraph' && child.children) {
            return child.children.map((textNode: any) => textNode.text || '').join('')
          }
          return ''
        })
        .join(' ')
        .trim()
    }
  } catch (error) {
    console.warn('Error extracting plain text from rich content:', error)
  }

  return ''
}

/**
 * Generates an excerpt from content
 */
export function generateExcerpt(content: any, maxLength: number = 160): string {
  const plainText = extractPlainText(content)
  return truncateText(plainText, maxLength)
}
