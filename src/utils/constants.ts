/**
 * Shared constants and enums
 * Based on requirements 4.2 and 4.4
 */

// Journal status constants
export const JOURNAL_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

// API response constants
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const

// Pagination constants
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const

// Validation constants
export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  EXCERPT_MAX_LENGTH: 300,
  SLUG_MAX_LENGTH: 100,
  CATEGORY_NAME_MAX_LENGTH: 50,
  TAG_NAME_MAX_LENGTH: 30,
  SEO_TITLE_MAX_LENGTH: 60,
  SEO_DESCRIPTION_MAX_LENGTH: 160,
} as const

// Supported audio file extensions
export const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'] as const

// Supported image file extensions
export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'] as const

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Cache durations (in seconds)
export const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// Sort options for journal entries
export const SORT_OPTIONS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  PUBLISHED_AT: 'publishedAt',
  TITLE: 'title',
} as const

// Sort order options
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

// Default values
export const DEFAULTS = {
  JOURNAL_STATUS: JOURNAL_STATUS.DRAFT,
  PAGINATION_LIMIT: PAGINATION.DEFAULT_LIMIT,
  SORT_BY: SORT_OPTIONS.CREATED_AT,
  SORT_ORDER: SORT_ORDER.DESC,
} as const
