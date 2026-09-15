import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { Client } from 'pg'

const sourceDirectory = process.argv[2]
if (!sourceDirectory)
  throw new Error(
    'Usage: node scripts/import-information-service-documents.mjs <source-directory>',
  )

const entries = [
  [
    'procedure',
    1,
    'Tata Cara/6.1. ALUR PERMINTAAN INFORMASI PUBLIK.png',
    'image/png',
  ],
  [
    'procedure',
    2,
    'Tata Cara/6.2 Tata Cara Pengajuan Keberatan.png',
    'image/png',
  ],
  [
    'procedure',
    3,
    'Tata Cara/7.1 Tata cara pengaduan penyalahgunaan wewenang oleh pejabat.png',
    'image/png',
  ],
  [
    'announcement',
    1,
    'Standar Pengumuman/11.1 Standar Pengumuman.pdf',
    'image/png',
  ],
  [
    'announcement',
    2,
    'Standar Pengumuman/11.2 Standar Permintaan Informasi Publik.pdf',
    'image/png',
  ],
  [
    'announcement',
    3,
    'Standar Pengumuman/11.4 Standar Penetapan dan Pemutakhiran Daftar Informasi Publik.pdf',
    'image/png',
  ],
  [
    'announcement',
    4,
    'Standar Pengumuman/11.5 Standar Pendokumentasian Informasi.pdf',
    'image/png',
  ],
]

const env = Object.fromEntries(
  (await readFile('.env.local', 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...value] = line.split('=')
      return [key, value.join('=').replace(/^['"]|['"]$/g, '')]
    }),
)
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
if (!env.SUPABASE_DB_URL || !baseUrl || !env.SUPABASE_SERVICE_ROLE_KEY)
  throw new Error('Konfigurasi Supabase belum lengkap di .env.local.')
const bucket = 'ppid-public-documents'
const client = new Client({ connectionString: env.SUPABASE_DB_URL })
async function storage(path, init = {}) {
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...init.headers,
    },
  })
}

try {
  await client.connect()
  const category = await client.query(
    "select id from ppid.document_categories where slug = 'service-standard' limit 1",
  )
  if (!category.rows[0])
    throw new Error('Kategori Standar Layanan belum tersedia.')
  const configured = await storage(`/bucket/${bucket}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      file_size_limit: 15 * 1024 * 1024,
      allowed_mime_types: ['application/pdf', 'image/png'],
    }),
  })
  if (!configured.ok)
    throw new Error('Bucket dokumen publik tidak dapat dikonfigurasi.')
  const records = await client.query(
    'select id, kind, display_order as "displayOrder", title, document_id as "documentId" from ppid.information_service_documents',
  )
  const byKey = new Map(
    records.rows.map((record) => [
      `${record.kind}:${record.displayOrder}`,
      record,
    ]),
  )
  let imported = 0
  for (const [kind, displayOrder, relativePath, contentType] of entries) {
    const record = byKey.get(`${kind}:${displayOrder}`)
    if (!record)
      throw new Error(`Rekor ${kind} urutan ${displayOrder} tidak ditemukan.`)
    if (record.documentId) continue
    const bytes = await readFile(join(sourceDirectory, relativePath))
    const isPdf = bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))
    const isPng = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    if (
      (contentType === 'application/pdf' && !isPdf) ||
      (contentType === 'image/png' && !isPng)
    )
      throw new Error(`${relativePath} tidak sesuai formatnya.`)
    const documentId = randomUUID(),
      versionId = randomUUID(),
      extension = contentType === 'image/png' ? 'png' : 'pdf',
      storagePath = `information-services/${documentId}/${versionId}.${extension}`
    const uploaded = await storage(`/object/${bucket}/${storagePath}`, {
      method: 'POST',
      headers: { 'content-type': contentType, 'x-upsert': 'false' },
      body: bytes,
    })
    if (!uploaded.ok)
      throw new Error(`Gagal mengunggah ${relativePath} ke bucket.`)
    try {
      await client.query('begin')
      await client.query(
        `insert into ppid.documents (id, category_id, slug, title, publication_state, description, created_at, published_at) values ($1, $2, $3, $4, 'published', '', now(), now())`,
        [
          documentId,
          category.rows[0].id,
          `layanan-${documentId.slice(0, 8)}`,
          record.title,
        ],
      )
      await client.query(
        `insert into ppid.document_versions (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256) values ($1, $2, $3, $4, 'accepted', 'approved', $5, $6, $7, $8)`,
        [
          versionId,
          documentId,
          bucket,
          storagePath,
          basename(relativePath),
          contentType,
          bytes.byteLength,
          createHash('sha256').update(bytes).digest('hex'),
        ],
      )
      await client.query(
        'update ppid.documents set active_version_id = $1 where id = $2',
        [versionId, documentId],
      )
      await client.query(
        'update ppid.information_service_documents set document_id = $1, updated_at = now() where id = $2',
        [documentId, record.id],
      )
      await client.query(
        `insert into ppid.publication_reviews (document_id, document_version_id, decision, public_summary) values ($1, $2, 'approved', 'Initial information-service file import.')`,
        [documentId, versionId],
      )
      await client.query('commit')
      imported += 1
    } catch (error) {
      await client.query('rollback')
      await storage(`/object/${bucket}/${storagePath}`, {
        method: 'DELETE',
      }).catch(() => undefined)
      throw error
    }
  }
  console.log(JSON.stringify({ imported, total: entries.length }))
} finally {
  await client.end()
}
