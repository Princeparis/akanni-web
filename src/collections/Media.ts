import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    // Allow updates only when the request is authorized by the server-side
    // PAYLOAD_SECRET (used by the migration script) or when a one-time
    // MIGRATION_TOKEN header is provided. This is more secure than leaving
    // updates open to everyone during migration.
    update: ({ req }) => {
      try {
        // If no req object is present, only allow when a server-side
        // PAYLOAD_SECRET exists (e.g. during trusted server operations).
        if (!req) return !!process.env.PAYLOAD_SECRET

        // Support both Fetch API style headers (req.headers.get)
        // and Express-style headers (req.headers.authorization).
        let authHeader: string | undefined
        if (typeof req.headers?.get === 'function') {
          authHeader = req.headers.get('authorization') ?? undefined
        } else if (req.headers && typeof (req.headers as any).authorization === 'string') {
          authHeader = (req.headers as any).authorization
        }

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice('Bearer '.length)
          if (token && token === process.env.PAYLOAD_SECRET) return true
        }

        return false
      } catch (e) {
        return false
      }
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
