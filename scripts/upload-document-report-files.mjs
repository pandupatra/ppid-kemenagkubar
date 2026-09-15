import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { Client } from 'pg'

const filePaths = process.argv.slice(2)
if (filePaths.length === 0)
  throw new Error(
    'Usage: node scripts/upload-document-report-files.mjs <pdf-file> [...pdf-file]',
  )

const env = Object.fromEntries(
  (await readFile('.env.local', 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...value] = line.split('=')
      return [key, value.join('=').replace(/^['"]|['"]$/g, '')]
    }),
)
const databaseUrl = env.SUPABASE_DB_URL
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!databaseUrl || !baseUrl || !serviceKey)
  throw new Error('Konfigurasi Supabase belum lengkap di .env.local.')

const maximumFileBytes = 15 * 1024 * 1024
const bucket = 'ppid-public-documents'
const client = new Client({ connectionString: databaseUrl })

async function storage(path, init = {}) {
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  })
}

try {
  await client.connect()
  const category = await client.query(
    "select id from ppid.document_categories where slug = 'document-report' limit 1",
  )
  if (!category.rows[0])
    throw new Error('Kategori Dokumen dan Laporan belum tersedia.')

  const results = []
  for (const filePath of filePaths) {
    const filename = basename(filePath)
    const title = filename.slice(0, -extname(filename).length).trim()
    const existing = await client.query(
      `select report.id, document.id as "documentId"
       from ppid.document_report_documents report
       left join ppid.documents document on document.id = report.document_id
       where lower(report.title) = lower($1) limit 1`,
      [title],
    )
    if (existing.rows[0]?.documentId) {
      results.push({ filename, status: 'already-published' })
      continue
    }

    const bytes = await readFile(filePath)
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new Error(`${filename} bukan PDF yang valid.`)
    if (bytes.byteLength > maximumFileBytes)
      throw new Error(`${filename} melebihi batas unggahan 15 MB.`)

    const documentId = randomUUID()
    const versionId = randomUUID()
    const storagePath = `document-reports/${documentId}/${versionId}.pdf`
    const uploaded = await storage(`/object/${bucket}/${storagePath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/pdf', 'x-upsert': 'false' },
      body: bytes,
    })
    if (!uploaded.ok) throw new Error(`Gagal mengunggah ${filename} ke bucket.`)

    try {
      await client.query('begin')
      const order = await client.query(
        'select coalesce(max(display_order), 0) + 1 as value from ppid.document_report_documents',
      )
      await client.query(
        `insert into ppid.documents (id, category_id, slug, title, publication_state, description, created_at, published_at)
         values ($1, $2, $3, $4, 'published', '', now(), now())`,
        [
          documentId,
          category.rows[0].id,
          `laporan-${documentId.slice(0, 8)}`,
          title,
        ],
      )
      await client.query(
        `insert into ppid.document_versions
           (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256)
         values ($1, $2, $3, $4, 'accepted', 'approved', $5, 'application/pdf', $6, $7)`,
        [
          versionId,
          documentId,
          bucket,
          storagePath,
          filename,
          bytes.byteLength,
          createHash('sha256').update(bytes).digest('hex'),
        ],
      )
      await client.query(
        'update ppid.documents set active_version_id = $1 where id = $2',
        [versionId, documentId],
      )
      if (existing.rows[0]) {
        await client.query(
          'update ppid.document_report_documents set document_id = $1, updated_at = now() where id = $2',
          [documentId, existing.rows[0].id],
        )
      } else {
        await client.query(
          'insert into ppid.document_report_documents (title, document_id, display_order) values ($1, $2, $3)',
          [title, documentId, order.rows[0].value],
        )
      }
      await client.query(
        `insert into ppid.publication_reviews
           (document_id, document_version_id, decision, public_summary)
         values ($1, $2, 'approved', 'Document-report PDF import.')`,
        [documentId, versionId],
      )
      await client.query('commit')
      results.push({ filename, status: 'published' })
    } catch (error) {
      await client.query('rollback')
      await storage(`/object/${bucket}/${storagePath}`, {
        method: 'DELETE',
      }).catch(() => undefined)
      throw error
    }
  }
  console.log(JSON.stringify(results))
} finally {
  await client.end()
}
