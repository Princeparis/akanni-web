/*
Idempotent migration skeleton (dry-run first).

Usage (dry-run):
  node scripts/migrate-media-to-vercel-blob.js --server=http://localhost:3000 --payload-secret=XXXXX --dry-run

Flags:
  --server            Base server URL where Payload is running (required)
  --payload-secret    PAYLOAD_SECRET to use for server-side API operations (required for non-public endpoints)
  --uploads-dir       Local uploads directory to scan (optional; defaults: ./public/uploads, ./uploads)
  --dry-run           If present, do not perform uploads or DB updates. Just report candidates.

This script is a safe preview. It does NOT perform any uploads yet.
*/
import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import url from 'url'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  args.forEach((a) => {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      out[k] = v === undefined ? true : v
    }
  })
  return out
}

const args = parseArgs()
const server = args.server || process.env.PAYLOAD_SERVER || 'http://localhost:3000'
const payloadSecret = args['payload-secret'] || process.env.PAYLOAD_SECRET || ''
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || ''
const confirm = args.confirm || false
// Default to the project's `media` folder plus common upload folders. Can be overridden with --uploads-dir
const uploadsDirs = (args['uploads-dir'] || './media,./public/uploads,./uploads')
  .split(',')
  .map((p) => path.resolve(p))
const dryRun = args['dry-run'] || false

if (!server) {
  console.error('Missing --server argument or PAYLOAD_SERVER env var')
  process.exit(1)
}

async function fetchPayload(pathname, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' }
  if (payloadSecret) headers['Authorization'] = `Bearer ${payloadSecret}`
  const res = await fetch(`${server.replace(/\/$/, '')}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payload API error ${res.status}: ${text}`)
  }
  return res.json()
}

function findLocalFile(filename) {
  for (const dir of uploadsDirs) {
    const candidate = path.join(dir, filename)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function listMediaDocs() {
  // Use Payload REST list endpoint (depth 0)
  const pageSize = 50
  let page = 1
  const all = []
  while (true) {
    const res = await fetchPayload(`/api/media?limit=${pageSize}&page=${page}&depth=0`)
    if (!res.docs) break
    all.push(...res.docs)
    if (res.totalDocs <= all.length) break
    page++
  }
  return all
}

async function uploadToVercelBlob(localPath, token) {
  if (!fs.existsSync(localPath)) throw new Error(`Local file not found: ${localPath}`)
  const { put } = await import('@vercel/blob')
  const buffer = fs.readFileSync(localPath)
  // derive a fileKey using the basename
  const filename = path.posix.basename(localPath)
  try {
    const result = await put(filename, buffer, {
      token,
      access: 'public',
      addRandomSuffix: false,
    })
    // result is expected to contain a url
    return result
  } catch (err) {
    const msg = String(err.message || err)
    console.error('uploadToVercelBlob error:', msg)
    // If the blob already exists, construct the public URL and return it so we can
    // update the media doc to point to the existing blob without overwriting.
    if (
      msg.toLowerCase().includes('already exists') ||
      msg.toLowerCase().includes('blob already exists')
    ) {
      const m = token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)
      const storeId = m ? m[1].toLowerCase() : null
      if (storeId) {
        const baseUrl = `https://${storeId}.public.blob.vercel-storage.com`
        const url = `${baseUrl}/${encodeURIComponent(filename)}`
        return { url }
      }
    }
    return null
  }
}

async function run() {
  console.log('Uploads dirs:', uploadsDirs)
  console.log('Server:', server)
  console.log('Dry run:', !!dryRun)

  const docs = await listMediaDocs()
  console.log(`Found ${docs.length} media docs`)

  const report = []
  for (const doc of docs) {
    // Payload media documents typically have filename and maybe sizes. If filename is missing,
    // try to extract the basename from the stored URL (e.g. "/media/xyz.jpg" -> "xyz.jpg").
    let filename = doc.filename || (doc?.sizes && Object.values(doc.sizes)[0]?.filename) || null
    if (!filename && doc.url) {
      try {
        // doc.url can be absolute or relative
        const parsed = new URL(doc.url, server)
        filename = path.basename(parsed.pathname)
      } catch (e) {
        // fallback: naive basename
        filename = path.basename(String(doc.url))
      }
    }
    // final fallback to id
    filename = filename || doc.id
    const localPath = findLocalFile(filename)
    report.push({ id: doc.id, filename, localPath, url: doc.url })
  }

  const toMigrate = report.filter((r) => r.localPath && r.url && r.url.startsWith('/'))

  console.log('\nSample report (first 20)')
  console.table(report.slice(0, 20))
  console.log(`\nCandidates with matching local file: ${toMigrate.length}`)
  // Write a candidate report for review during dry-run
  const reportPath = path.resolve(process.cwd(), 'scripts', 'migration-report.json')
  const payloadForReport = {
    generatedAt: new Date().toISOString(),
    server,
    uploadsDirs,
    candidates: report,
  }
  try {
    fs.writeFileSync(reportPath, JSON.stringify(payloadForReport, null, 2))
    console.log(`Wrote candidate report to ${reportPath}`)
  } catch (e) {
    console.warn('Could not write report file:', e.message || e)
  }

  if (dryRun) {
    console.log('Dry run complete. No changes were made.')
    process.exit(0)
  }

  if (!blobToken) {
    console.error(
      'Missing Vercel blob token: set BLOB_READ_WRITE_TOKEN in your environment to enable uploads',
    )
    process.exit(1)
  }

  if (!confirm) {
    console.log(
      'No --confirm flag passed. This run will perform no writes. Rerun with --confirm to execute uploads and DB updates.',
    )
    process.exit(0)
  }

  console.log(`Beginning migration of ${toMigrate.length} candidates`)

  let migrated = []
  for (const item of toMigrate) {
    try {
      // Idempotency: if doc.url already looks like an absolute blob URL, skip
      if (item.url && String(item.url).startsWith('http')) {
        console.log(`Skipping ${item.filename} (already has absolute URL): ${item.url}`)
        continue
      }

      // Upload to Vercel Blob
      const uploaded = await uploadToVercelBlob(item.localPath, blobToken)
      if (!uploaded || !uploaded.url) {
        console.warn(`Upload failed for ${item.filename}; skipping update`)
        continue
      }

      // Update the Payload media doc to point to the new URL
      const patchBody = {
        url: uploaded.url,
        filename: item.filename,
      }
      // Optional: you can set sizes or metadata from uploaded response if available
      await fetchPayload(`/api/media/${item.id}`, 'PATCH', patchBody)
      migrated.push({ id: item.id, filename: item.filename, url: uploaded.url })
      console.log(`Migrated ${item.filename} -> ${uploaded.url}`)
    } catch (err) {
      console.error(`Error migrating ${item.filename}:`, err.message || err)
    }
  }

  console.log(`Migration complete. Migrated ${migrated.length} items.`)
  // Append migration results to the report file for auditing
  try {
    const existing = fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      : {}
    existing.migratedAt = new Date().toISOString()
    existing.migrated = migrated
    fs.writeFileSync(reportPath, JSON.stringify(existing, null, 2))
    console.log(`Wrote migration results to ${reportPath}`)
  } catch (e) {
    console.warn('Could not write migration results file:', e.message || e)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
