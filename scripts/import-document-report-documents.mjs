import { createHash, randomUUID } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { Client } from 'pg'

const sourceDirectory = process.argv[2]
if (!sourceDirectory)
  throw new Error(
    'Usage: node scripts/import-document-report-documents.mjs <source-directory>',
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
const filenames = [
  '14.1 DIPA 2026.pdf',
  '14.2 Renja Kutai Barat 2026.pdf',
  '2.1, 2.2, 2.4, 2.6 Agenda_Penting_Kemenag_2025.xlsx.pdf',
  '2.3, 2.5, dan 2.10 Laporan Capaian Kinerja Triwulan IV (Kemenag Kutai Barat).pdf',
  '3.2 Neraca.pdf',
  '3.3 LK UAKPA 2025.pdf',
  '4. Perkin Kemenag Kubar.pdf',
  '4.1-4.5, 13.1-13.3 Rekapan Data Informasi Publik yang Diterima.pdf',
  'Laporan Realisasi Anggaran 2025.pdf',
  'rencana strategis.pdf',
]
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
  const available = new Set(
    (await readdir(sourceDirectory)).filter((name) =>
      name.toLowerCase().endsWith('.pdf'),
    ),
  )
  await client.connect()
  const category = await client.query(
    "select id from ppid.document_categories where slug = 'document-report' limit 1",
  )
  if (!category.rows[0])
    throw new Error(
      'Kategori Dokumen dan Laporan belum tersedia. Jalankan migrasi terlebih dahulu.',
    )
  const records = await client.query(
    'select id, title, document_id as "documentId", display_order as "displayOrder" from ppid.document_report_documents order by display_order',
  )
  if (records.rows.length !== filenames.length)
    throw new Error(
      'Data awal Dokumen dan Laporan belum lengkap. Jalankan migrasi terlebih dahulu.',
    )
  let imported = 0
  for (const [index, record] of records.rows.entries()) {
    const filename = filenames[index]
    if (record.documentId) continue
    if (!available.has(filename))
      throw new Error(`Berkas tidak ditemukan: ${filename}`)
    const bytes = await readFile(join(sourceDirectory, filename))
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new Error(`${filename} bukan PDF yang valid.`)
    const documentId = randomUUID(),
      versionId = randomUUID(),
      storagePath = `document-reports/${documentId}/${versionId}.pdf`
    const uploaded = await storage(`/object/${bucket}/${storagePath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/pdf', 'x-upsert': 'false' },
      body: bytes,
    })
    if (!uploaded.ok) throw new Error(`Gagal mengunggah ${filename} ke bucket.`)
    try {
      await client.query('begin')
      await client.query(
        `insert into ppid.documents (id, category_id, slug, title, publication_state, description, created_at, published_at) values ($1, $2, $3, $4, 'published', '', now(), now())`,
        [
          documentId,
          category.rows[0].id,
          `laporan-${documentId.slice(0, 8)}`,
          record.title,
        ],
      )
      await client.query(
        `insert into ppid.document_versions (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256) values ($1, $2, $3, $4, 'accepted', 'approved', $5, 'application/pdf', $6, $7)`,
        [
          versionId,
          documentId,
          bucket,
          storagePath,
          basename(filename),
          bytes.byteLength,
          createHash('sha256').update(bytes).digest('hex'),
        ],
      )
      await client.query(
        'update ppid.documents set active_version_id = $1 where id = $2',
        [versionId, documentId],
      )
      await client.query(
        'update ppid.document_report_documents set document_id = $1, updated_at = now() where id = $2',
        [documentId, record.id],
      )
      await client.query(
        `insert into ppid.publication_reviews (document_id, document_version_id, decision, public_summary) values ($1, $2, 'approved', 'Initial document-report PDF import.')`,
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
  console.log(JSON.stringify({ imported, total: filenames.length }))
} finally {
  await client.end()
}
