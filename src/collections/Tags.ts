import type { CollectionConfig } from 'payload'
import { generateSlug } from '../utils/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'journalCount'],
    listSearchableFields: ['name'],
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
      maxLength: 30,
      admin: {
        description: 'Tag name (must be unique)',
      },
      validate: (value: unknown) => {
        if (!value) return 'Tag name is required'

        if (typeof value !== 'string') {
          return 'Tag name must be a string'
        }

        // Ensure proper formatting
        const trimmed = value.trim()
        if (trimmed.length === 0) return 'Tag name cannot be empty'
        if (trimmed.length > 30) return 'Tag name must be 30 characters or less'

        // Check for invalid characters
        const validTagRegex = /^[a-zA-Z0-9\s\-_]+$/
        if (!validTagRegex.test(trimmed)) {
          return 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'
        }

        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the name (auto-generated)',
        readOnly: true,
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
      name: 'journalCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Number of journals using this tag (auto-calculated)',
        readOnly: true,
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
          data.journalCount = 0 // Initialize count for new tags
        }
        data.updatedAt = now
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update journal count when tag is created or updated
        if (operation === 'create' || operation === 'update') {
          try {
            // Count journals that use this tag
            const journalCount = await req.payload.count({
              collection: 'journals',
              where: {
                tags: {
                  contains: doc.id,
                },
              },
            })

            // Update the tag's journal count if it's different
            if (doc.journalCount !== journalCount.totalDocs) {
              await req.payload.update({
                collection: 'tags',
                id: doc.id,
                data: {
                  journalCount: journalCount.totalDocs,
                },
              })
            }
          } catch (error) {
            // Log error but don't fail the operation
            console.error('Error updating tag journal count:', error)
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        try {
          // Before deleting a tag, remove it from all journals that use it
          const journalsWithTag = await req.payload.find({
            collection: 'journals',
            where: {
              tags: {
                contains: id,
              },
            },
            limit: 1000, // Handle large numbers of journals
          })

          // Update each journal to remove this tag
          for (const journal of journalsWithTag.docs) {
            const updatedTags =
              journal.tags?.filter((tag: any) => {
                const tagId = typeof tag === 'string' ? tag : tag.id
                return tagId !== id
              }) || []
            await req.payload.update({
              collection: 'journals',
              id: journal.id,
              data: {
                tags: updatedTags,
              },
            })
          }
        } catch (error) {
          // Log error but don't fail the deletion
          console.error('Error removing tag from journals before deletion:', error)
        }
      },
    ],
  },
  timestamps: true,
}
