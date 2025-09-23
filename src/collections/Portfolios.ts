import type { CollectionConfig } from 'payload'
import { generateSlug } from '../utils/slug'
import { validateRequiredString, validateRichTextContent } from '../utils/validation'
// Note: No specific portfolio cache invalidation helper exists yet.
// Reuse or add cache-hooks if you want automatic cache invalidation for portfolios.

const PROJECT_CATEGORIES = [
  'branding',
  'ui-ux',
  'web-design',
  'web-development',
  'app-development',
  'backend-development',
]

export const Portfolios: CollectionConfig = {
  slug: 'portfolios',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'status', 'publishedAt', 'updatedAt'],
    listSearchableFields: ['title', 'excerpt'],
    group: 'Content Management',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 140,
      admin: {
        description: 'Project title (required)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'Title must be a string'
        const validation = validateRequiredString(value, 'Title', 140)
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
        description: 'URL slug (auto-generated from title)',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, originalDoc }) => {
            if (operation === 'create' || (data?.title && data.title !== originalDoc?.title)) {
              return generateSlug(data?.title || '')
            }
            return data?.slug
          },
        ],
      },
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        description: 'Year the project was completed or launched',
        placeholder: new Date().getFullYear().toString(),
      },
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: PROJECT_CATEGORIES.map((c) => ({ label: c.replace(/-/g, ' '), value: c })),
      required: true,
      admin: {
        description: 'Project categories (choose one or more)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Main cover image for the project',
      },
    },
    {
      name: 'intro',
      type: 'text',
      required: false,
      maxLength: 1000,
      admin: {
        description: 'Introductory text for the project (optional, max 1000 chars)',
      },
      validate: (value: unknown) => {
        if (value === null || value === undefined) return true
        if (typeof value !== 'string') return 'Intro must be a string'
        if ((value as string).length > 1000) return 'Intro must be 1000 characters or fewer'
        return true
      },
    },
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image3',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image4',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'implementation',
      type: 'text',
      required: false,
      maxLength: 1000,
      admin: {
        description: 'Implementation details for the project (optional, max 1000 chars)',
      },
      validate: (value: unknown) => {
        if (value === null || value === undefined) return true
        if (typeof value !== 'string') return 'Implementation must be a string'
        if ((value as string).length > 1000)
          return 'Implementation must be 1000 characters or fewer'
        return true
      },
    },
    {
      name: 'image5',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image6',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image7',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'image8',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Short summary for lists and previews',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 4000,
      admin: {
        description: 'Short description of the project for cards and meta',
      },
      validate: (value: unknown) => {
        if (value === null || value === undefined) return true
        if (typeof value !== 'string') return 'Description must be a string'
        if ((value as string).length > 4000) return 'Description must be 4000 characters or fewer'
        return true
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
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'published',
      },
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      fields: [
        { name: 'title', type: 'text', maxLength: 60 },
        { name: 'description', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title) data.title = data.title.trim()
        if (data?.excerpt) data.excerpt = data.excerpt.trim()

        // Auto-generate excerpt from intro/implementation if not provided
        if (data && !data.excerpt) {
          try {
            const parts: string[] = []
            if (data.intro && typeof data.intro === 'string') parts.push(data.intro)
            if (data.implementation && typeof data.implementation === 'string')
              parts.push(data.implementation)
            const plainText = parts.join(' ').trim()
            if (plainText)
              data.excerpt = plainText.substring(0, 297) + (plainText.length > 297 ? '...' : '')
          } catch (err) {
            console.error('Error generating excerpt for portfolio:', err)
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        const now = new Date()
        if (operation === 'create') data.createdAt = now
        data.updatedAt = now

        if (data.status === 'published') {
          if (
            !data.publishedAt ||
            (originalDoc?.status === 'draft' && data.status === 'published')
          ) {
            data.publishedAt = now
          }
        } else if (data.status === 'draft') {
          if (originalDoc?.status === 'published') data.publishedAt = null
        }

        // Populate SEO defaults
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
      async ({ doc, req, operation }) => {
        // Example: Invalidate caches or perform side-effects
        try {
          // If categories changed you could update counts on a categories collection here
        } catch (err) {
          console.error('Portfolio afterChange hook error:', err)
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Placeholder: perform related cleanup if needed
      },
    ],
    afterDelete: [],
  },
  timestamps: true,
}

export default Portfolios
