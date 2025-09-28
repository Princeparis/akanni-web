import type { CollectionConfig } from 'payload'
import { validateUrl, validateRequiredString } from '../utils/validation'

export const Playgrounds: CollectionConfig = {
  slug: 'playgrounds',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
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
      admin: {
        description: 'Playground title (required)',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'Title must be a string'
        const v = validateRequiredString(value, 'Title', 140)
        return v.isValid ? true : v.error!
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Representative image for the playground (optional)',
      },
    },
    {
      name: 'previewUrl',
      type: 'text',
      admin: {
        description: 'URL to preview the playground (e.g. live demo)',
      },
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Preview URL must be a string'
        const v = validateUrl(value)
        return v.isValid ? true : v.error!
      },
    },
    {
      name: 'downloadUrl',
      type: 'text',
      admin: {
        description: 'URL to download the playground or its assets',
      },
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Download URL must be a string'
        const v = validateUrl(value)
        return v.isValid ? true : v.error!
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
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && typeof data.title === 'string') data.title = data.title.trim()
        return data
      },
    ],
  },
  timestamps: true,
}

export default Playgrounds
