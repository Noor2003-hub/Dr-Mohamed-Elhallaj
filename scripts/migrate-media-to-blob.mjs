import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Run once with: node --env-file=.env.vercel.local scripts/migrate-media-to-blob.mjs
// Existing records and file names are preserved; rerunning verifies existing blobs.
const require = createRequire(import.meta.url)
const { createClient } = require(require.resolve('@libsql/client', { paths: [require.resolve('@payloadcms/db-sqlite')] }))
const { list, put } = require(require.resolve('@vercel/blob', { paths: [require.resolve('@payloadcms/storage-vercel-blob')] }))
const { DATABASE_URL, DATABASE_AUTH_TOKEN, BLOB_READ_WRITE_TOKEN: token } = process.env
if (!DATABASE_URL?.startsWith('libsql://') || !DATABASE_AUTH_TOKEN || !token) {
  throw new Error('Set the hosted database and Blob credentials before migrating media.')
}
const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../media')
const client = createClient({ url: DATABASE_URL, authToken: DATABASE_AUTH_TOKEN })

try {
  const records = await client.execute('SELECT id, filename, mime_type, filesize FROM media ORDER BY id')
  const files = await Promise.all(records.rows.map(async (row) => {
    const filePath = path.resolve(mediaDir, String(row.filename))
    if (path.dirname(filePath) !== mediaDir) throw new Error('Unexpected media file path')
    const buffer = await fs.readFile(filePath)
    if (buffer.length !== Number(row.filesize)) throw new Error(`File size mismatch: ${row.filename}`)
    return { row, buffer }
  }))

  const columns = await client.execute('PRAGMA table_info(media)')
  if (!columns.rows.some((column) => column.name === '_objectkey')) {
    if (columns.rows.some((column) => column.name === '_object_key')) {
      await client.execute('ALTER TABLE media RENAME COLUMN _object_key TO _objectkey')
    } else {
      await client.execute('ALTER TABLE media ADD COLUMN _objectkey text')
    }
  }

  const existing = new Map()
  let cursor
  do {
    const page = await list({ token, cursor, limit: 1000 })
    for (const blob of page.blobs) existing.set(blob.pathname, blob)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
  for (const { row, buffer } of files) {
    const filename = String(row.filename)
    const blob = existing.get(filename) || await put(filename, buffer, {
      token,
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: String(row.mime_type),
    })
    const response = await fetch(blob.url)
    if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== hash(buffer)) {
      throw new Error(`Uploaded image did not match the source: ${filename}`)
    }
    await client.execute({ sql: 'UPDATE media SET url = ? WHERE id = ?', args: [blob.url, row.id] })
    console.log(`Verified ${filename}`)
  }
  console.log(`Migrated and verified ${files.length} images without changing media IDs.`)
} finally {
  client.close()
}
