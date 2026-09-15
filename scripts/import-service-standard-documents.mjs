import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { Client } from 'pg'

const sourceDirectory = process.argv[2]
if (!sourceDirectory)
  throw new Error(
    'Usage: node scripts/import-service-standard-documents.mjs <source-directory>',
  )

const entries = [
  ['sop', 1, 'SOP/1. SOP Monitoring dan Evaluasi Pelayanan Publik.pdf'],
  ['sop', 2, 'SOP/10. SOP Pengelolaan Pelayanan Informasi.pdf'],
  [
    'sop',
    3,
    'SOP/11. SOP Penetapan dan Pemutakhiran Daftar Informasi Publik.pdf',
  ],
  ['sop', 4, 'SOP/2. SOP Pendokumentasian Informasi Publik.pdf'],
  ['sop', 5, 'SOP/3. SOP Pendokumentasian Informasi yang Dikecualikan.pdf'],
  ['sop', 6, 'SOP/4. SOP Pengelolaan Pengaduan Keberatan Informasi.pdf'],
  ['sop', 7, 'SOP/5. SOP Monitoring dan Evaluasi Pelayanan Publik.pdf'],
  ['sop', 8, 'SOP/6. SOP Koordinasi Penilaian Kepatuhan Pelayanan Publik.pdf'],
  [
    'sop',
    9,
    'SOP/7. SOP Monitoring dan Evaluasi Keterbukaan Informasi Publik.pdf',
  ],
  ['sop', 10, 'SOP/8. SOP Penanganan Sengketa Informasi.pdf'],
  ['sop', 11, 'SOP/9. SOP Pengelolaan Data Publikasi PPID pada Website.pdf'],
  [
    'policy',
    1,
    'Kebijakan/11.2 & 21. Standar Jangka Waktu Pelayanan Informasi Publik (maksimal 3 hari).pdf',
  ],
  [
    'policy',
    2,
    'Kebijakan/20. Kebijakan  Standar Pelayanan Informasi Publik Tidak Lebih Dari 1 Hari.pdf',
  ],
  [
    'policy',
    3,
    'Kebijakan/23. Kebijakan Penegakan Disiplin dan Sanksi Internal dalam Pelayanan Informasi Publik.pdf',
  ],
  [
    'policy',
    4,
    'Kebijakan/24. Kebijakan_Penegakan_Disiplin_dan_Sanksi_Internal_Atasan_Badan_Publik.pdf',
  ],
  [
    'policy',
    5,
    'Kebijakan/25. Kebijakan Reward Pelaksana Layanan Informasi Publik.pdf',
  ],
  ['policy', 6, 'Kebijakan/5.2 SK KEBIJAKAN 2025.pdf'],
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
const databaseUrl = env.SUPABASE_DB_URL
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!databaseUrl || !baseUrl || !serviceKey)
  throw new Error('Konfigurasi Supabase belum lengkap di .env.local.')

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
    "select id from ppid.document_categories where slug = 'service-standard' limit 1",
  )
  if (!category.rows[0])
    throw new Error('Kategori Standar Layanan belum tersedia.')
  const listed = await storage('/bucket')
  const buckets = await listed.json()
  if (!listed.ok || !Array.isArray(buckets))
    throw new Error('Bucket dokumen publik tidak dapat diperiksa.')
  if (!buckets.some((item) => item.id === bucket || item.name === bucket))
    throw new Error('Bucket ppid-public-documents belum tersedia.')

  const records = await client.query(
    'select id, kind, display_order as "displayOrder", title, document_id as "documentId" from ppid.service_standard_documents',
  )
  const byKey = new Map(
    records.rows.map((record) => [
      `${record.kind}:${record.displayOrder}`,
      record,
    ]),
  )
  let imported = 0
  for (const [kind, displayOrder, relativePath] of entries) {
    const record = byKey.get(`${kind}:${displayOrder}`)
    if (!record)
      throw new Error(`Rekor ${kind} urutan ${displayOrder} tidak ditemukan.`)
    if (record.documentId) continue
    const bytes = await readFile(join(sourceDirectory, relativePath))
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new Error(`${relativePath} bukan PDF yang valid.`)
    const documentId = randomUUID()
    const versionId = randomUUID()
    const storagePath = `service-standards/${documentId}/${versionId}.pdf`
    const uploaded = await storage(`/object/${bucket}/${storagePath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/pdf', 'x-upsert': 'false' },
      body: bytes,
    })
    if (!uploaded.ok)
      throw new Error(`Gagal mengunggah ${relativePath} ke bucket.`)
    try {
      await client.query('begin')
      await client.query(
        `insert into ppid.documents (id, category_id, slug, title, publication_state, description, created_at, published_at)
         values ($1, $2, $3, $4, 'published', '', now(), now())`,
        [
          documentId,
          category.rows[0].id,
          `standar-${documentId.slice(0, 8)}`,
          record.title,
        ],
      )
      await client.query(
        `insert into ppid.document_versions (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256)
         values ($1, $2, $3, $4, 'accepted', 'approved', $5, 'application/pdf', $6, $7)`,
        [
          versionId,
          documentId,
          bucket,
          storagePath,
          basename(relativePath),
          bytes.byteLength,
          createHash('sha256').update(bytes).digest('hex'),
        ],
      )
      await client.query(
        'update ppid.documents set active_version_id = $1 where id = $2',
        [versionId, documentId],
      )
      await client.query(
        'update ppid.service_standard_documents set document_id = $1, updated_at = now() where id = $2',
        [documentId, record.id],
      )
      await client.query(
        `insert into ppid.publication_reviews (document_id, document_version_id, decision, public_summary)
         values ($1, $2, 'approved', 'Initial service-standard PDF import.')`,
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
