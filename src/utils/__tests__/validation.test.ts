/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest'
import {
  validateUrl,
  validateAudioUrl,
  validateSlug,
  validateRequiredString,
  validateRichTextContent,
  validateEmail,
  validateHexColor,
} from '../validation'

describe('Validation Utilities', () => {
  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true })
      expect(validateUrl('http://example.com')).toEqual({ isValid: true })
      expect(validateUrl('https://example.com/path?query=1')).toEqual({ isValid: true })
    })

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toEqual({
        isValid: false,
        error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL',
      })
      expect(validateUrl('')).toEqual({
        isValid: false,
        error: 'URL is required and must be a string',
      })
    })
  })

  describe('validateAudioUrl', () => {
    it('should validate correct audio URLs', () => {
      expect(validateAudioUrl('https://example.com/audio.mp3')).toEqual({ isValid: true })
      expect(validateAudioUrl('https://example.com/audio.wav')).toEqual({ isValid: true })
      expect(validateAudioUrl('')).toEqual({ isValid: true }) // Optional field
    })

    it('should reject non-audio URLs', () => {
      expect(validateAudioUrl('https://example.com/image.jpg')).toEqual({
        isValid: false,
        error: 'URL must point to a valid audio file (mp3, wav, ogg, m4a, aac, flac)',
      })
    })
  })

  describe('validateSlug', () => {
    it('should validate correct slugs', () => {
      expect(validateSlug('valid-slug')).toEqual({ isValid: true })
      expect(validateSlug('another-valid-slug-123')).toEqual({ isValid: true })
    })

    it('should reject invalid slugs', () => {
      expect(validateSlug('Invalid Slug')).toEqual({
        isValid: false,
        error:
          'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen',
      })
      expect(validateSlug('')).toEqual({
        isValid: false,
        error: 'Slug is required and must be a string',
      })
    })
  })

  describe('validateRequiredString', () => {
    it('should validate required strings', () => {
      expect(validateRequiredString('Valid String', 'Title')).toEqual({ isValid: true })
    })

    it('should reject empty or invalid strings', () => {
      expect(validateRequiredString('', 'Title')).toEqual({
        isValid: false,
        error: 'Title is required and must be a string',
      })
      expect(validateRequiredString(null, 'Title')).toEqual({
        isValid: false,
        error: 'Title is required and must be a string',
      })
    })
  })

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true })
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toEqual({
        isValid: false,
        error: 'Invalid email format',
      })
    })
  })

  describe('validateHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(validateHexColor('#FF0000')).toEqual({ isValid: true })
      expect(validateHexColor('#F00')).toEqual({ isValid: true })
      expect(validateHexColor('')).toEqual({ isValid: true }) // Optional field
    })

    it('should reject invalid hex colors', () => {
      expect(validateHexColor('red')).toEqual({
        isValid: false,
        error: 'Color must be a valid hex color (e.g., #FF0000 or #F00)',
      })
    })
  })
})
