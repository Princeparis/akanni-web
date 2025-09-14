/**
 * Validation utility functions
 * Based on requirements 7.1 and 4.2
 */

import { ValidationError, ErrorCodes, FieldValidationResult } from '../types/errors'

// URL validation regex patterns
const URL_PATTERN =
  /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/
const AUDIO_URL_PATTERN =
  /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?.*\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Validates if a string is a valid URL
 */
export function validateUrl(url: string): FieldValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required and must be a string',
    }
  }

  if (!URL_PATTERN.test(url.trim())) {
    return {
      isValid: false,
      error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL',
    }
  }

  return { isValid: true }
}

/**
 * Validates if a string is a valid audio URL
 */
export function validateAudioUrl(url: string): FieldValidationResult {
  if (!url) {
    return { isValid: true } // Audio URL is optional
  }

  if (typeof url !== 'string') {
    return {
      isValid: false,
      error: 'Audio URL must be a string',
    }
  }

  const trimmedUrl = url.trim()

  // First check if it's a valid URL
  const urlValidation = validateUrl(trimmedUrl)
  if (!urlValidation.isValid) {
    return urlValidation
  }

  // Then check if it's an audio file
  if (!AUDIO_URL_PATTERN.test(trimmedUrl)) {
    return {
      isValid: false,
      error: 'URL must point to a valid audio file (mp3, wav, ogg, m4a, aac, flac)',
    }
  }

  return { isValid: true }
}

/**
 * Validates if a string is a valid slug
 */
export function validateSlug(slug: string): FieldValidationResult {
  if (!slug || typeof slug !== 'string') {
    return {
      isValid: false,
      error: 'Slug is required and must be a string',
    }
  }

  const trimmedSlug = slug.trim()

  if (trimmedSlug.length === 0) {
    return {
      isValid: false,
      error: 'Slug cannot be empty',
    }
  }

  if (trimmedSlug.length > 100) {
    return {
      isValid: false,
      error: 'Slug must be 100 characters or less',
    }
  }

  if (!SLUG_PATTERN.test(trimmedSlug)) {
    return {
      isValid: false,
      error:
        'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen',
    }
  }

  return { isValid: true }
}

/**
 * Validates required string fields
 */
export function validateRequiredString(
  value: any,
  fieldName: string,
  maxLength?: number,
): FieldValidationResult {
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} is required and must be a string`,
    }
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    }
  }

  if (maxLength && trimmedValue.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    }
  }

  return { isValid: true }
}

/**
 * Validates rich text content (basic validation)
 */
export function validateRichTextContent(content: any): FieldValidationResult {
  if (!content) {
    return {
      isValid: false,
      error: 'Content is required',
    }
  }

  // Basic validation for Lexical content structure
  if (typeof content !== 'object' || !content.root) {
    return {
      isValid: false,
      error: 'Content must be valid rich text format',
    }
  }

  return { isValid: true }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): FieldValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email is required and must be a string',
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.trim())) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  return { isValid: true }
}

/**
 * Validates hex color format
 */
export function validateHexColor(color: string): FieldValidationResult {
  if (!color) {
    return { isValid: true } // Color is optional
  }

  if (typeof color !== 'string') {
    return {
      isValid: false,
      error: 'Color must be a string',
    }
  }

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  if (!hexPattern.test(color.trim())) {
    return {
      isValid: false,
      error: 'Color must be a valid hex color (e.g., #FF0000 or #F00)',
    }
  }

  return { isValid: true }
}
