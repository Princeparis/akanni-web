/**
 * Slug generation and manipulation utilities
 * Based on requirements 7.1 and 4.2
 */

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove special characters except hyphens
      .replace(/[^\w\-]+/g, '')
      // Replace multiple consecutive hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Limit length to 100 characters
      .substring(0, 100)
      // Remove trailing hyphen if truncation created one
      .replace(/-+$/, '')
  )
}

/**
 * Ensures slug uniqueness by appending a number if needed
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}

/**
 * Validates and formats a slug
 */
export function formatSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return ''
  }

  return generateSlug(slug)
}

/**
 * Creates a slug from title with fallback
 */
export function createSlugFromTitle(title: string, fallback: string = 'untitled'): string {
  const slug = generateSlug(title)
  return slug || generateSlug(fallback)
}
