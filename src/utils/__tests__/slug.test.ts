/**
 * Tests for slug utilities
 */

import { describe, it, expect } from 'vitest'
import { generateSlug, ensureUniqueSlug, formatSlug, createSlugFromTitle } from '../slug'

describe('Slug Utilities', () => {
  describe('generateSlug', () => {
    it('should generate valid slugs from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('This is a Test!')).toBe('this-is-a-test')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
      expect(generateSlug('Special@#$Characters')).toBe('specialcharacters')
    })

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('')
      expect(generateSlug('---')).toBe('')
    })
  })

  describe('ensureUniqueSlug', () => {
    it('should return original slug if unique', () => {
      expect(ensureUniqueSlug('unique-slug', ['other-slug'])).toBe('unique-slug')
    })

    it('should append number if slug exists', () => {
      expect(ensureUniqueSlug('existing-slug', ['existing-slug'])).toBe('existing-slug-1')
      expect(ensureUniqueSlug('existing-slug', ['existing-slug', 'existing-slug-1'])).toBe(
        'existing-slug-2',
      )
    })
  })

  describe('createSlugFromTitle', () => {
    it('should create slug from title', () => {
      expect(createSlugFromTitle('My Blog Post')).toBe('my-blog-post')
    })

    it('should use fallback for empty title', () => {
      expect(createSlugFromTitle('')).toBe('untitled')
      expect(createSlugFromTitle('', 'custom-fallback')).toBe('custom-fallback')
    })
  })
})
