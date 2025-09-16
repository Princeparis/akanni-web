/**
 * Unit tests for Journals collection
 * Tests validation, hooks, and field configurations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Journals } from '../Journals'
import { generateSlug } from '../../utils/slug'
import {
  validateAudioUrl,
  validateRequiredString,
  validateRichTextContent,
} from '../../utils/validation'

// Mock the utility functions
vi.mock('../../utils/slug')
vi.mock('../../utils/validation')

const mockGenerateSlug = vi.mocked(generateSlug)
const mockValidateAudioUrl = vi.mocked(validateAudioUrl)
const mockValidateRequiredString = vi.mocked(validateRequiredString)
const mockValidateRichTextContent = vi.mocked(validateRichTextContent)

describe('Journals Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Collection Configuration', () => {
    it('should have correct slug and admin configuration', () => {
      expect(Journals.slug).toBe('journals')
      expect(Journals.admin?.useAsTitle).toBe('title')
      expect(Journals.admin?.defaultColumns).toEqual([
        'title',
        'status',
        'category',
        'publishedAt',
        'updatedAt',
      ])
      expect(Journals.admin?.listSearchableFields).toEqual(['title', 'excerpt'])
      expect(Journals.admin?.group).toBe('Content Management')
    })

    it('should have correct access controls', () => {
      const { access } = Journals

      // Test read access for authenticated user
      const authenticatedUser = { req: { user: { id: '1' } } }
      expect(access?.read?.(authenticatedUser as any)).toBe(true)

      // Test read access for public user
      const publicUser = { req: { user: null } }
      expect(access?.read?.(publicUser as any)).toEqual({ status: { equals: 'published' } })

      // Test create/update/delete access
      expect(access?.create?.(authenticatedUser as any)).toBe(true)
      expect(access?.update?.(authenticatedUser as any)).toBe(true)
      expect(access?.delete?.(authenticatedUser as any)).toBe(true)

      expect(access?.create?.(publicUser as any)).toBe(false)
      expect(access?.update?.(publicUser as any)).toBe(false)
      expect(access?.delete?.(publicUser as any)).toBe(false)
    })
  })

  describe('Field Validation', () => {
    it('should validate title field correctly', () => {
      const titleField = Journals.fields.find((field) => field.name === 'title')
      expect(titleField).toBeDefined()
      expect(titleField?.required).toBe(true)
      expect(titleField?.maxLength).toBe(100)

      // Test title validation
      mockValidateRequiredString.mockReturnValue({ isValid: true })
      const result = titleField?.validate?.('Valid Title')
      expect(result).toBe(true)
      expect(mockValidateRequiredString).toHaveBeenCalledWith('Valid Title', 'Title', 100)

      // Test invalid title
      mockValidateRequiredString.mockReturnValue({ isValid: false, error: 'Title is required' })
      const invalidResult = titleField?.validate?.('')
      expect(invalidResult).toBe('Title is required')
    })

    it('should validate content field correctly', () => {
      const contentField = Journals.fields.find((field) => field.name === 'content')
      expect(contentField).toBeDefined()
      expect(contentField?.required).toBe(true)

      // Test content validation
      mockValidateRichTextContent.mockReturnValue({ isValid: true })
      const result = contentField?.validate?.({ root: { children: [] } })
      expect(result).toBe(true)
      expect(mockValidateRichTextContent).toHaveBeenCalled()

      // Test invalid content
      mockValidateRichTextContent.mockReturnValue({ isValid: false, error: 'Content is required' })
      const invalidResult = contentField?.validate?.('')
      expect(invalidResult).toBe('Content is required')
    })

    it('should validate audioUrl field correctly', () => {
      const audioUrlField = Journals.fields.find((field) => field.name === 'audioUrl')
      expect(audioUrlField).toBeDefined()

      // Test valid audio URL
      mockValidateAudioUrl.mockReturnValue({ isValid: true })
      const result = audioUrlField?.validate?.('https://example.com/audio.mp3')
      expect(result).toBe(true)
      expect(mockValidateAudioUrl).toHaveBeenCalledWith('https://example.com/audio.mp3')

      // Test invalid audio URL
      mockValidateAudioUrl.mockReturnValue({ isValid: false, error: 'Invalid audio URL' })
      const invalidResult = audioUrlField?.validate?.('invalid-url')
      expect(invalidResult).toBe('Invalid audio URL')

      // Test empty audio URL (should be valid as it's optional)
      const emptyResult = audioUrlField?.validate?.('')
      expect(emptyResult).toBe(true)
    })

    it('should have correct status field options', () => {
      const statusField = Journals.fields.find((field) => field.name === 'status')
      expect(statusField).toBeDefined()
      expect(statusField?.type).toBe('select')
      expect(statusField?.defaultValue).toBe('draft')
      expect(statusField?.required).toBe(true)

      const options = (statusField as any)?.options
      expect(options).toEqual([
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ])
    })
  })

  describe('Slug Generation Hook', () => {
    it('should generate slug from title on create', () => {
      const slugField = Journals.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('test-slug')

      const result = beforeValidateHook?.({
        data: { title: 'Test Title' },
        operation: 'create',
        originalDoc: null,
      } as any)

      expect(result).toBe('test-slug')
      expect(mockGenerateSlug).toHaveBeenCalledWith('Test Title')
    })

    it('should regenerate slug when title changes on update', () => {
      const slugField = Journals.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('new-slug')

      const result = beforeValidateHook?.({
        data: { title: 'New Title', slug: 'old-slug' },
        operation: 'update',
        originalDoc: { title: 'Old Title' },
      } as any)

      expect(result).toBe('new-slug')
      expect(mockGenerateSlug).toHaveBeenCalledWith('New Title')
    })

    it('should keep existing slug when title unchanged', () => {
      const slugField = Journals.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      const result = beforeValidateHook?.({
        data: { title: 'Same Title', slug: 'existing-slug' },
        operation: 'update',
        originalDoc: { title: 'Same Title' },
      } as any)

      expect(result).toBe('existing-slug')
      expect(mockGenerateSlug).not.toHaveBeenCalled()
    })
  })

  describe('Before Validate Hook', () => {
    it('should trim title and excerpt', () => {
      const beforeValidateHook = Journals.hooks?.beforeValidate?.[0]

      const data = {
        title: '  Test Title  ',
        excerpt: '  Test excerpt  ',
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.title).toBe('Test Title')
      expect(result.excerpt).toBe('Test excerpt')
    })

    it('should generate excerpt from content when not provided', () => {
      const beforeValidateHook = Journals.hooks?.beforeValidate?.[0]

      const data = {
        title: 'Test Title',
        content: {
          root: {
            children: [
              {
                children: [{ text: 'This is a test content for excerpt generation.' }],
              },
            ],
          },
        },
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.excerpt).toBe('This is a test content for excerpt generation.')
    })

    it('should truncate long excerpts generated from content', () => {
      const beforeValidateHook = Journals.hooks?.beforeValidate?.[0]

      const longText = 'a'.repeat(300)
      const data = {
        title: 'Test Title',
        content: {
          root: {
            children: [
              {
                children: [{ text: longText }],
              },
            ],
          },
        },
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.excerpt).toBe(longText.substring(0, 297) + '...')
    })
  })

  describe('Before Change Hook', () => {
    it('should set timestamps on create', () => {
      const beforeChangeHook = Journals.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { title: 'Test' }
      const result = beforeChangeHook?.({
        data,
        operation: 'create',
        originalDoc: null,
      } as any)

      expect(result.createdAt).toEqual(mockDate)
      expect(result.updatedAt).toEqual(mockDate)

      vi.useRealTimers()
    })

    it('should set publishedAt when status changes to published', () => {
      const beforeChangeHook = Journals.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { status: 'published' }
      const result = beforeChangeHook?.({
        data,
        operation: 'update',
        originalDoc: { status: 'draft' },
      } as any)

      expect(result.publishedAt).toEqual(mockDate)

      vi.useRealTimers()
    })

    it('should clear publishedAt when status changes to draft', () => {
      const beforeChangeHook = Journals.hooks?.beforeChange?.[0]

      const data = { status: 'draft' }
      const result = beforeChangeHook?.({
        data,
        operation: 'update',
        originalDoc: { status: 'published', publishedAt: new Date() },
      } as any)

      expect(result.publishedAt).toBeNull()
    })

    it('should auto-populate SEO fields', () => {
      const beforeChangeHook = Journals.hooks?.beforeChange?.[0]

      const data = {
        title: 'Test Title',
        excerpt: 'Test excerpt for SEO description',
      }

      const result = beforeChangeHook?.({
        data,
        operation: 'create',
        originalDoc: null,
      } as any)

      expect(result.seo.title).toBe('Test Title')
      expect(result.seo.description).toBe('Test excerpt for SEO description')
    })
  })
})
