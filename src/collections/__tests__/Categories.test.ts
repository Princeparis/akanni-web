/**
 * Unit tests for Categories collection
 * Tests validation, hooks, and field configurations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Categories } from '../Categories'
import { generateSlug } from '../../utils/slug'

// Mock the utility functions
vi.mock('../../utils/slug')

const mockGenerateSlug = vi.mocked(generateSlug)

describe('Categories Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Collection Configuration', () => {
    it('should have correct slug and admin configuration', () => {
      expect(Categories.slug).toBe('categories')
      expect(Categories.admin?.useAsTitle).toBe('name')
      expect(Categories.admin?.defaultColumns).toEqual(['name', 'slug', 'description'])
      expect(Categories.admin?.listSearchableFields).toEqual(['name', 'description'])
      expect(Categories.admin?.group).toBe('Content Management')
    })

    it('should have correct access controls', () => {
      const { access } = Categories

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
      const nameField = Categories.fields.find((field) => field.name === 'name')
      expect(nameField).toBeDefined()
      expect(nameField?.required).toBe(true)
      expect(nameField?.unique).toBe(true)
      expect(nameField?.maxLength).toBe(50)
    })

    it('should have correct slug field configuration', () => {
      const slugField = Categories.fields.find((field) => field.name === 'slug')
      expect(slugField).toBeDefined()
      expect(slugField?.required).toBe(true)
      expect(slugField?.unique).toBe(true)
    })

    it('should have correct description field configuration', () => {
      const descriptionField = Categories.fields.find((field) => field.name === 'description')
      expect(descriptionField).toBeDefined()
      expect(descriptionField?.maxLength).toBe(200)
      expect(descriptionField?.required).toBeFalsy()
    })

    it('should validate color field correctly', () => {
      const colorField = Categories.fields.find((field) => field.name === 'color')
      expect(colorField).toBeDefined()

      // Test valid hex colors
      expect(colorField?.validate?.('#FF5733')).toBe(true)
      expect(colorField?.validate?.('#F73')).toBe(true)
      expect(colorField?.validate?.('#000000')).toBe(true)

      // Test invalid hex colors
      expect(colorField?.validate?.('FF5733')).toBe(
        'Color must be a valid hex color code (e.g., #FF5733 or #F73)',
      )
      expect(colorField?.validate?.('#GG5733')).toBe(
        'Color must be a valid hex color code (e.g., #FF5733 or #F73)',
      )
      expect(colorField?.validate?.('#FF57')).toBe(
        'Color must be a valid hex color code (e.g., #FF5733 or #F73)',
      )

      // Test empty color (should be valid as it's optional)
      expect(colorField?.validate?.('')).toBe(true)
      expect(colorField?.validate?.(null)).toBe(true)

      // Test non-string color
      expect(colorField?.validate?.(123)).toBe('Color must be a string')
    })
  })

  describe('Slug Generation Hook', () => {
    it('should generate slug from name on create', () => {
      const slugField = Categories.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('test-category')

      const result = beforeValidateHook?.({
        data: { name: 'Test Category' },
        operation: 'create',
        originalDoc: null,
      } as any)

      expect(result).toBe('test-category')
      expect(mockGenerateSlug).toHaveBeenCalledWith('Test Category')
    })

    it('should regenerate slug when name changes on update', () => {
      const slugField = Categories.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      mockGenerateSlug.mockReturnValue('new-category')

      const result = beforeValidateHook?.({
        data: { name: 'New Category', slug: 'old-category' },
        operation: 'update',
        originalDoc: { name: 'Old Category' },
      } as any)

      expect(result).toBe('new-category')
      expect(mockGenerateSlug).toHaveBeenCalledWith('New Category')
    })

    it('should keep existing slug when name unchanged', () => {
      const slugField = Categories.fields.find((field) => field.name === 'slug')
      const beforeValidateHook = slugField?.hooks?.beforeValidate?.[0]

      const result = beforeValidateHook?.({
        data: { name: 'Same Category', slug: 'existing-slug' },
        operation: 'update',
        originalDoc: { name: 'Same Category' },
      } as any)

      expect(result).toBe('existing-slug')
      expect(mockGenerateSlug).not.toHaveBeenCalled()
    })
  })

  describe('Before Validate Hook', () => {
    it('should trim category name', () => {
      const beforeValidateHook = Categories.hooks?.beforeValidate?.[0]

      const data = {
        name: '  Test Category  ',
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.name).toBe('Test Category')
    })

    it('should handle empty name gracefully', () => {
      const beforeValidateHook = Categories.hooks?.beforeValidate?.[0]

      const data = {
        name: null,
      }

      const result = beforeValidateHook?.({ data } as any)

      expect(result.name).toBeNull()
    })
  })

  describe('Before Change Hook', () => {
    it('should set timestamps on create', () => {
      const beforeChangeHook = Categories.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { name: 'Test Category' }
      const result = beforeChangeHook?.({
        data,
        operation: 'create',
      } as any)

      expect(result.createdAt).toEqual(mockDate)
      expect(result.updatedAt).toEqual(mockDate)

      vi.useRealTimers()
    })

    it('should update timestamp on update', () => {
      const beforeChangeHook = Categories.hooks?.beforeChange?.[0]
      const mockDate = new Date('2023-01-01T00:00:00Z')
      vi.setSystemTime(mockDate)

      const data = { name: 'Updated Category' }
      const result = beforeChangeHook?.({
        data,
        operation: 'update',
      } as any)

      expect(result.updatedAt).toEqual(mockDate)
      expect(result.createdAt).toBeUndefined() // Should not set createdAt on update

      vi.useRealTimers()
    })
  })

  describe('Timestamps Configuration', () => {
    it('should have timestamps enabled', () => {
      expect(Categories.timestamps).toBe(true)
    })
  })
})
