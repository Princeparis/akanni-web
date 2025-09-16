import type { CollectionConfig } from 'payload'
import { generateSlug } from '../utils/slug'
import { invalidateCategoryCache, invalidateCategoryCacheOnDelete } from '../utils/cache-hooks'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'description'],
    listSearchableFields: ['name', 'description'],
    group: 'Content Management',
  },
  access: {
    read: () => true, // Public read access for frontend
    create: ({ req: { user } }) => Boolean(user), // Only authenticated users can create
    update: ({ req: { user } }) => Boolean(user), // Only authenticated users can update
    delete: ({ req: { user } }) => Boolean(user), // Only authenticated users can delete
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 50,
      admin: {
        description: 'Category name (must be unique)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the name',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, originalDoc }) => {
            // Auto-generate slug from name if not provided or if name changed
            if (operation === 'create' || (data?.name && data.name !== originalDoc?.name)) {
              return generateSlug(data?.name || '')
            }
            return data?.slug
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief description of the category (optional)',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for category styling (e.g., #FF5733)',
        position: 'sidebar',
      },
      validate: (value: unknown) => {
        if (!value) return true // Optional field

        if (typeof value !== 'string') {
          return 'Color must be a string'
        }

        // Validate hex color format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexColorRegex.test(value)) {
          return 'Color must be a valid hex color code (e.g., #FF5733 or #F73)'
        }
        return true
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure name is trimmed and properly formatted
        if (data?.name) {
          data.name = data.name.trim()
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, operation }) => {
        // Set timestamps
        const now = new Date()
        if (operation === 'create') {
          data.createdAt = now
        }
        data.updatedAt = now
        return data
      },
    ],
    afterChange: [
      // Cache invalidation hook
      invalidateCategoryCache,
    ],
    afterDelete: [
      // Cache invalidation hook
      invalidateCategoryCacheOnDelete,
    ],
  },
  timestamps: true,
}
