/**
 * Unit tests for Tags collection
 * Tests validation, hooks, and field configurations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Tags } from '../Tags'
import { generateSlug } from '../../utils/slug'

// Mock the utility functions
vi.mock('../../utils/slug')

const mockGenerateSlug = vi.mocked(generateSlug)

describe('Tags Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Collection Configuration', () => {
    it('should have correct slug and admin configuration', () => {
      expect(Tags.slug).toBe('tags')
      expect(Tags.admin?.useAsTitle).toBe('name')
      expect(Tags.admin?.defaultColumns).toEqual(['name', 'slug', 'journalCount'])
      expect(Tags.admin?.listSearchableFields).toEqual(['name'])
      expect(Tags.admin?.group).toBe('Content Management')
    })

    it('should have correct access controls', () => {
      const { access } = Tags

      // Test read access (should be public)
      expect(access?.read?.()).toBe(true)

      // Test create/update/delete access for authenticated user
      const authenticatedUser = { req: { user: { id: '1' } } }
      expect(access?.create?.(authenticatedUser as any)).toBe(true)
      expect(access?.update?.(authenticatedUser as any)).toBe(true)
      expect(access?.delete?.(authenticatedUser as any)).toBe(true)

      // Test create/update/delete access for public user
      const publicUser = { req: { user: null } }
      expect(access?.create?.(publicUser as any)).toBe(false)
      expect(access?.update?.(publicUser as any)).toBe(false)
      expect(access?.delete?.(publicUser as any)).toBe(false)
    })
  })

  describe('Field Configuration', () => {
    it('should have correct name field configuration', () => {
      const nameField = Tags.fields.find((field) => field.name === 'name')
      expect(nameField).toBeDefined()
      expect(nameField?.required).toBe(true)
      expect(nameField?.unique).toBe(true)
      expect(nameField?.maxLength).toBe(30)
    })

    it('should validate name field correctly', () => {
      const nameField = Tags.fields.find((field) => field.name === 'name')

      // Test valid names
      expect(nameField?.validate?.('Valid Tag')).toBe(true)
      expect(nameField?.validate?.('tag-with-hyphens')).toBe(true)
      expect(nameField?.validate?.('tag_with_underscores')).toBe(true)
      expect(nameField?.validate?.('tag123')).toBe(true)

      // Test invalid names
      expect(nameField?.validate?.('')).toBe('Tag name is required')
      expect(nameField?.validate?.(null)).toBe('Tag name is required')
      expect(nameField?.validate?.(123)).toBe('Tag name must be a string')
      expect(nameField?.validate?.('   ')).toBe('Tag name cannot be empty')
      expect(nameField?.validate?.('a'.repeat(31))).toBe('Tag name must be 30 characters or less')
      expect(nameField?.validate?.('tag@invalid')).toBe(
        'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
      )
      expect(nameField?.validate?.('tag#invalid')).toBe(
        'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
      )
    })

    it('should have correct slug field configuration', () => {
      const slugField = Tags.fields.find((field) => field.name === 'slug')
      expect(slugField).toBeDefined()
      expect(slugField?.required).toBe(true)
      expect(slugField?.unique).toBe(true)
      expect(slugField?.admin?.readOnly).toBe(true)
    })

    it('should have correct journalCount field configuration', () => {
      const journalCountField = Tags.fields.find((field) => field.name === 'journalCount')
      expect(journalCountField).toBeDefined()
      expect(journalCountField?.type).toBe('number')
      expect(journalCountField?.defaultValue).toBe(0)
      expect(journalCountField?.admin?.readOnly).toBe(true)
    })
  })

  describe('Slug Generation Hook', () => {
    it('should generate slug from name on create', () => {
      const slugField = Tags.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('test-tag')

      const result = beforeValidateHook?.({
        data: { name: 'Test Tag' },
        operation: 'create',
        originalDoc: null,
      } as any)

      expect(result).toBe('test-tag')
      expect(mockGenerateSlug).toHaveBeenCalledWith('Test Tag')
    })

    it('should regenerate slug when name changes on update', () => {
      const slugField = Tags.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('new-tag')

      const result = beforeValidateHook?.({
        data: { name: 'New Tag', slug: 'old-tag' },
        operation: 'update',
        originalDoc: { name: 'Old Tag' },
      } as any)

      expect(result).toBe('new-tag')
      expect(mockGenerateSlug).toHaveBeenCalledWith('New Tag')
    })

    it('should keep existing slug when name unchanged', () => {
      const slugField = Tags.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      const result = beforeValidateHook?.({
        data: { name: 'Same Tag', slug: 'existing-slug' },
        operation: 'update',
        originalDoc: { name: 'Same Tag' },
      } as any)

      expect(result).toBe('existing-slug')
      expect(mockGenerateSlug).not.toHaveBeenCalled()
    })
  })

  describe('Before Validate Hook', () => {
    it('should trim tag name', () => {
      const beforeValidateHook = Tags.hooks?.beforeValidate?.[0]

      const data = {
        name: '  Test Tag  ',
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.name).toBe('Test Tag')
    })

    it('should handle empty name gracefully', () => {
      const beforeValidateHook = Tags.hooks?.beforeValidate?.[0]

      const data = {
        name: null,
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.name).toBeNull()
    })
  })

  describe('Before Change Hook', () => {
    it('should set timestamps and initialize journalCount on create', () => {
      const beforeChangeHook = Tags.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { name: 'Test Tag' }
      const result = beforeChangeHook?.({
        data,
        operation: 'create',
      } as any)

      expect(result.createdAt).toEqual(mockDate)
      expect(result.updatedAt).toEqual(mockDate)
      expect(result.journalCount).toBe(0)

      vi.useRealTimers()
    })

    it('should update timestamp on update', () => {
      const beforeChangeHook = Tags.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { name: 'Updated Tag' }
      const result = beforeChangeHook?.({
        data,
        operation: 'update',
      } as any)

      expect(result.updatedAt).toEqual(mockDate)
      expect(result.createdAt).toBeUndefined() // Should not set createdAt on update
      expect(result.journalCount).toBeUndefined() // Should not reset journalCount on update

      vi.useRealTimers()
    })
  })

  describe('After Change Hook', () => {
    it('should update journal count after create', async () => {
      const afterChangeHook = Tags.hooks?.afterChange?.[0]

      const mockPayload = {
        count: vi.fn().mockResolvedValue({ totalDocs: 5 }),
        update: vi.fn().mockResolvedValue({}),
      }

      const mockReq = { payload: mockPayload }
      const doc = { id: 'tag-1', journalCount: 0 }

      await afterChangeHook?.({
        doc,
        req: mockReq,
        operation: 'create',
      } as any)

      expect(mockPayload.count).toHaveBeenCalledWith({
        collection: 'journals',
        where: {
          tags: {
            contains: 'tag-1',
          },
        },
      })

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'tags',
        id: 'tag-1',
        data: {
          journalCount: 5,
        },
      })
    })

    it('should not update journal count if it matches current count', async () => {
      const afterChangeHook = Tags.hooks?.afterChange?.[0]

      const mockPayload = {
        count: vi.fn().mockResolvedValue({ totalDocs: 3 }),
        update: vi.fn().mockResolvedValue({}),
      }

      const mockReq = { payload: mockPayload }
      const doc = { id: 'tag-1', journalCount: 3 }

      await afterChangeHook?.({
        doc,
        req: mockReq,
        operation: 'update',
      } as any)

      expect(mockPayload.count).toHaveBeenCalled()
      expect(mockPayload.update).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const afterChangeHook = Tags.hooks?.afterChange?.[0]
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockPayload = {
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      const mockReq = { payload: mockPayload }
      const doc = { id: 'tag-1', journalCount: 0 }

      // Should not throw
      await expect(
        afterChangeHook?.({
          doc,
          req: mockReq,
          operation: 'create',
        } as any),
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating tag journal count:',
        expect.any(Error),
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Before Delete Hook', () => {
    it('should remove tag from journals before deletion', async () => {
      const beforeDeleteHook = Tags.hooks?.beforeDelete?.[0]

      const mockJournals = [
        { id: 'journal-1', tags: ['tag-1', 'tag-2'] },
        { id: 'journal-2', tags: [{ id: 'tag-1' }, { id: 'tag-3' }] },
      ]

      const mockPayload = {
        find: vi.fn().mockResolvedValue({ docs: mockJournals }),
        update: vi.fn().mockResolvedValue({}),
      }

      const mockReq = { payload: mockPayload }

      await beforeDeleteHook?.({
        req: mockReq,
        id: 'tag-1',
      } as any)

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'journals',
        where: {
          tags: {
            contains: 'tag-1',
          },
        },
        limit: 1000,
      })

      expect(mockPayload.update).toHaveBeenCalledTimes(2)
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'journals',
        id: 'journal-1',
        data: {
          tags: ['tag-2'],
        },
      })
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'journals',
        id: 'journal-2',
        data: {
          tags: [{ id: 'tag-3' }],
        },
      })
    })

    it('should handle errors gracefully during deletion', async () => {
      const beforeDeleteHook = Tags.hooks?.beforeDelete?.[0]
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockPayload = {
        find: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      const mockReq = { payload: mockPayload }

      // Should not throw
      await expect(
        beforeDeleteHook?.({
          req: mockReq,
          id: 'tag-1',
        } as any),
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error removing tag from journals before deletion:',
        expect.any(Error),
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Timestamps Configuration', () => {
    it('should have timestamps enabled', () => {
      expect(Tags.timestamps).toBe(true)
    })
  })
})
