import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { Client } from 'pg'

const sourcePath =
  process.argv[2] ??
  'C:\\Users\\pandu\\OneDrive\\Documents\\Workspace\\Kemenag\\PPID\\1.6. STRUKTUR ORGANISASI KEMENAG KUBAR.png'
const migrationPath = new URL(
  '../supabase/migrations/202609150001_add_ministry_profile.sql',
  import.meta.url,
)
const bucket = 'ppid-public-images'
const storagePath = 'ministry-profile/struktur-organisasi-kemenag-kubar.png'
const alt = 'Struktur Organisasi Kantor Kementerian Agama Kabupaten Kutai Barat'

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const connectionString = process.env.SUPABASE_DB_URL
if (!baseUrl || !serviceKey || !connectionString) {
  throw new Error(
    'Supabase URL, service role key, and database URL are required.',
  )
}

const [bytes, migration] = await Promise.all([
  readFile(sourcePath),
  readFile(migrationPath, 'utf8'),
])
if (!bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
  throw new Error('The supplied organization chart is not a valid PNG image.')
}

async function storageRequest(path, init = {}) {
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  })
}

const bucketsResponse = await storageRequest('/bucket')
const buckets = await bucketsResponse.json().catch(() => null)
if (!bucketsResponse.ok || !Array.isArray(buckets)) {
  throw new Error('Could not inspect Supabase Storage buckets.')
}
if (!buckets.some((entry) => entry.id === bucket || entry.name === bucket)) {
  const createBucket = await storageRequest('/bucket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 8 * 1024 * 1024,
      allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp'],
    }),
  })
  if (!createBucket.ok && createBucket.status !== 409) {
    throw new Error('Could not create the public image bucket.')
  }
}

const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/')
const upload = await storageRequest(`/object/${bucket}/${encodedPath}`, {
  method: 'POST',
  headers: { 'content-type': 'image/png', 'x-upsert': 'true' },
  body: bytes,
})
if (!upload.ok) {
  throw new Error(`Could not upload the organization chart (${upload.status}).`)
}

const client = new Client({ connectionString })
try {
  await client.connect()
  await client.query('begin')
  await client.query(migration)
  await client.query(
    `update ppid.ministry_profile
     set organization_chart_alt = $1, storage_bucket = $2, storage_path = $3,
       original_filename = $4, content_type = 'image/png', byte_size = $5,
       updated_at = now()
     where id = true`,
    [alt, bucket, storagePath, basename(sourcePath), bytes.byteLength],
  )
  await client.query('commit')
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  throw error
} finally {
  await client.end()
}

console.log(
  JSON.stringify({
    bucket,
    storagePath,
    byteSize: bytes.byteLength,
    databaseRecord: 'ppid.ministry_profile',
  }),
)
