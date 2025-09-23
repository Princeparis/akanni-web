#!/usr/bin/env node
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function migrate() {
  const payload = await getPayload({ config })
  console.log('Starting portfolios migration...')

  const batchSize = 50
  let page = 1
  while (true) {
    const { docs, totalDocs } = await payload.find({
      collection: 'portfolios',
      limit: batchSize,
      page,
    })

    if (!docs || docs.length === 0) break

    for (const doc of docs) {
      const update = {}
      // ensure fields exist; do not overwrite existing values
      if (doc.intro === undefined) update.intro = ''
      if (doc.implementation === undefined) update.implementation = ''
      for (let i = 1; i <= 8; i++) {
        const k = `image${i}`
        if (doc[k] === undefined) update[k] = null
      }

      if (Object.keys(update).length === 0) continue

      try {
        await payload.update({ collection: 'portfolios', id: doc.id, data: update })
        console.log(`Updated portfolio ${doc.id}`)
      } catch (err) {
        console.error(`Failed to update ${doc.id}:`, err)
      }
    }

    if (page * batchSize >= totalDocs) break
    page += 1
  }

  console.log('Migration complete')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
