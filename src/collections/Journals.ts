import type { CollectionConfig } from 'payload'
import { generateSlug } from '../utils/slug'
import {
  validateAudioUrl,
  validateRequiredString,
  validateRichTextContent,
} from '../utils/validation'
import { invalidateJournalCache, invalidateJournalCacheOnDelete } from '../utils/cache-hooks'

export const Journals: CollectionConfig = {
  slug: 'journals',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'publishedAt', 'updatedAt'],
    listSearchableFields: ['title', 'excerpt'],
    group: 'Content Management',
  },
  access: {
    read: ({ req: { user } }) => {
      // Authenticated users can see all entries
      if (user) return true
      // Public users can only see published entries
      return { status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user), // Only authenticated users can create
    update: ({ req: { user } }) => Boolean(user), // Only authenticated users can update
    delete: ({ req: { user } }) => Boolean(user), // Only authenticated users can delete
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description: 'Journal entry title (required, max 100 characters)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string') {
          return 'Title must be a string'
        }
        const validation = validateRequiredString(value, 'Title', 100)
        return validation.isValid ? true : validation.error!
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the title (auto-generated)',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, originalDoc }) => {
            // Auto-generate slug from title if not provided or if title changed
            if (operation === 'create' || (data?.title && data.title !== originalDoc?.title)) {
              return generateSlug(data?.title || '')
            }
            return data?.slug
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the journal entry (rich text)',
      },
      validate: (value: any) => {
        const validation = validateRichTextContent(value)
        return validation.isValid ? true : validation.error!
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief description for previews and SEO (max 300 characters)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Cover image for the journal entry',
      },
    },
    {
      name: 'audioUrl',
      type: 'text',
      admin: {
        description: 'URL to audio file (mp3, wav, ogg, m4a, aac, flac)',
      },
      validate: (value: unknown) => {
        if (!value) return true // Optional field
        if (typeof value !== 'string') {
          return 'Audio URL must be a string'
        }
        const validation = validateAudioUrl(value)
        return validation.isValid ? true : validation.error!
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Publication status of the journal entry',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date when the entry was published (auto-set when publishing)',
        condition: (data) => data.status === 'published',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Primary category for this journal entry',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Tags associated with this journal entry',
      },
    },
    // SEO Fields Group
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'SEO title (max 60 characters, defaults to journal title)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'SEO meta description (max 160 characters, defaults to excerpt)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure title is trimmed and properly formatted
        if (data?.title) {
          data.title = data.title.trim()
        }

        // Ensure excerpt is trimmed
        if (data?.excerpt) {
          data.excerpt = data.excerpt.trim()
        }

        // Auto-generate excerpt from content if not provided
        if (!data?.excerpt && data?.content) {
          try {
            // Extract plain text from Lexical content for excerpt
            const extractTextFromLexical = (content: any): string => {
              if (!content || !content.root || !content.root.children) return ''

              let text = ''
              const traverse = (node: any) => {
                if (node.text) {
                  text += node.text + ' '
                } else if (node.children) {
                  node.children.forEach(traverse)
                }
              }

              content.root.children.forEach(traverse)
              return text.trim()
            }

            const plainText = extractTextFromLexical(data.content)
            if (plainText) {
              data.excerpt = plainText.substring(0, 297) + (plainText.length > 297 ? '...' : '')
            }
          } catch (error) {
            console.error('Error generating excerpt from content:', error)
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        const now = new Date()

        // Set timestamps
        if (operation === 'create') {
          data.createdAt = now
        }
        data.updatedAt = now

        // Handle publication date
        if (data.status === 'published') {
          // Set publishedAt if not already set or if changing from draft to published
          if (
            !data.publishedAt ||
            (originalDoc?.status === 'draft' && data.status === 'published')
          ) {
            data.publishedAt = now
          }
        } else if (data.status === 'draft') {
          // Clear publishedAt if changing from published to draft
          if (originalDoc?.status === 'published') {
            data.publishedAt = null
          }
        }

        // Auto-populate SEO fields if not provided
        if (!data.seo?.title && data.title) {
          if (!data.seo) data.seo = {}
          data.seo.title = data.title.substring(0, 60)
        }

        if (!data.seo?.description && data.excerpt) {
          if (!data.seo) data.seo = {}
          data.seo.description = data.excerpt.substring(0, 160)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        // Update tag journal counts when tags are modified
        if (operation === 'create' || operation === 'update') {
          try {
            const currentTags = doc.tags || []
            const previousTags = previousDoc?.tags || []

            // Extract tag IDs from potentially mixed array of strings and objects
            const getCurrentTagIds = (tags: any[]): string[] => {
              return tags.map((tag) => (typeof tag === 'string' ? tag : tag.id)).filter(Boolean)
            }

            const currentTagIds = getCurrentTagIds(currentTags)
            const previousTagIds = getCurrentTagIds(previousTags)

            // Find tags that were added or removed
            const addedTags = currentTagIds.filter((tagId) => !previousTagIds.includes(tagId))
            const removedTags = previousTagIds.filter((tagId) => !currentTagIds.includes(tagId))

            // Update counts for affected tags
            const tagsToUpdate = [...new Set([...addedTags, ...removedTags])]

            for (const tagId of tagsToUpdate) {
              const journalCount = await req.payload.count({
                collection: 'journals',
                where: {
                  tags: {
                    contains: tagId,
                  },
                },
              })

              await req.payload.update({
                collection: 'tags',
                id: tagId,
                data: {
                  journalCount: journalCount.totalDocs,
                },
              })
            }
          } catch (error) {
            console.error('Error updating tag journal counts:', error)
          }
        }
      },
      // Cache invalidation hook
      invalidateJournalCache,
    ],
    beforeDelete: [
      async ({ req, id }) => {
        try {
          // Get the journal being deleted to update tag counts
          const journal = await req.payload.findByID({
            collection: 'journals',
            id,
          })

          // Update tag counts for all tags used by this journal
          if (journal.tags && journal.tags.length > 0) {
            const tagIds = journal.tags
              .map((tag: any) => (typeof tag === 'string' ? tag : tag.id))
              .filter(Boolean)
            for (const tagId of tagIds) {
              const journalCount = await req.payload.count({
                collection: 'journals',
                where: {
                  and: [
                    {
                      tags: {
                        contains: tagId,
                      },
                    },
                    {
                      id: {
                        not_equals: id, // Exclude the journal being deleted
                      },
                    },
                  ],
                },
              })

              await req.payload.update({
                collection: 'tags',
                id: tagId,
                data: {
                  journalCount: journalCount.totalDocs,
                },
              })
            }
          }
        } catch (error) {
          console.error('Error updating tag counts before journal deletion:', error)
        }
      },
    ],
    afterDelete: [
      // Cache invalidation hook
      invalidateJournalCacheOnDelete,
    ],
  },
  timestamps: true,
}
