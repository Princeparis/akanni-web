// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Journals } from './collections/Journals'
import { Portfolios } from './collections/Portfolios'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// Determine DB URL: prefer DATABASE_URI env var, otherwise fall back to a local sqlite file
// Passing an empty string to the sqlite adapter can cause runtime SQL errors (LibsqlError).
const envDbUrl = process.env.DATABASE_URI ? process.env.DATABASE_URI.trim() : ''
const defaultSqlitePath = path.resolve(dirname, 'payload.db')
const dbUrl = envDbUrl && envDbUrl.length > 0 ? envDbUrl : `file:${defaultSqlitePath}`

if (!envDbUrl) {
  // Log a visible warning to help local devs notice missing DB config
  // eslint-disable-next-line no-console
  console.warn(
    `[payload.config] DATABASE_URI not set; falling back to local sqlite file at ${defaultSqlitePath}`,
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Tags, Journals, Portfolios],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
