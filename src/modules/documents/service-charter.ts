import { createServerFn } from '@tanstack/react-start'
import { randomUUID } from 'node:crypto'
import { getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'

export type ServiceCharterImage = {
  src: string
  alt: string
  fileName: string | null
  updatedAt: string | null
}

const fallbackImage: ServiceCharterImage = {
  src: '/maklumat-pelayanan.png',
  alt: 'Maklumat Pelayanan Kantor Kementerian Agama Kabupaten Kutai Barat',
  fileName: 'maklumat-pelayanan.png',
  updatedAt: null,
}

const maximumImageBytes = 8 * 1024 * 1024
const publicImagesBucket = 'ppid-public-images'
const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'] as const

function canManage(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['content_editor', 'reviewer', 'ppid_supervisor', 'administrator'].includes(
      role,
    ),
  )
}

async function storageRequest(path: string, init: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey)
    throw new Error('Penyimpanan gambar belum dikonfigurasi.')
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  })
}

async function ensureImageBucket() {
  const listed = await storageRequest('/bucket')
  const buckets = (await listed.json().catch(() => null)) as unknown
  if (!listed.ok || !Array.isArray(buckets))
    throw new Error('Penyimpanan gambar tidak tersedia.')
  if (
    buckets.some(
      (bucket) =>
        typeof bucket === 'object' &&
        bucket &&
        ('id' in bucket
          ? bucket.id === publicImagesBucket
          : 'name' in bucket && bucket.name === publicImagesBucket),
    )
  )
    return
  const created = await storageRequest('/bucket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: publicImagesBucket,
      name: publicImagesBucket,
      public: true,
      file_size_limit: maximumImageBytes,
      allowed_mime_types: allowedImageTypes,
    }),
  })
  if (!created.ok && created.status !== 409)
    throw new Error('Penyimpanan gambar belum siap.')
}

function publicImageUrl(storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return fallbackImage.src
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/')
  return `${baseUrl}/storage/v1/object/public/${publicImagesBucket}/${encodedPath}`
}

function isValidImage(bytes: Buffer, contentType: string) {
  if (contentType === 'image/png')
    return bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
  if (contentType === 'image/jpeg')
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (contentType === 'image/webp')
    return (
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    )
  return false
}

type ServiceCharterRow = {
  altText: string
  fallbackPath: string
  originalFilename: string | null
  storagePath: string | null
  updatedAt: string | null
}

async function readServiceCharter(): Promise<ServiceCharterImage> {
  const rows = await queryRows<ServiceCharterRow>(
    `select alt_text as "altText", fallback_path as "fallbackPath",
      original_filename as "originalFilename", storage_path as "storagePath",
      updated_at::text as "updatedAt"
     from ppid.service_charter limit 1`,
  )
  const row = rows[0]
  if (!row) return fallbackImage
  return {
    src: row.storagePath ? publicImageUrl(row.storagePath) : row.fallbackPath,
    alt: row.altText,
    fileName: row.originalFilename ?? fallbackImage.fileName,
    updatedAt: row.updatedAt,
  }
}

export const getPublicServiceCharter = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    return await readServiceCharter()
  } catch {
    return fallbackImage
  }
})

export const getAdminServiceCharter = createServerFn({ method: 'GET' }).handler(
  async () => {
    const actor = await getAdminActor()
    if (!actor || !canManage(actor)) return { access: 'denied' as const }
    try {
      return { access: 'granted' as const, image: await readServiceCharter() }
    } catch {
      return { access: 'granted' as const, image: fallbackImage }
    }
  },
)

export const replaceServiceCharterImage = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Data gambar tidak valid.')
    const alt = String(data.get('alt') ?? '').trim()
    const file = data.get('file')
    if (!alt || alt.length > 240)
      throw new Error('Deskripsi gambar wajib diisi, maksimum 240 karakter.')
    if (!(file instanceof File) || !file.size)
      throw new Error('Pilih gambar Maklumat Pelayanan.')
    if (
      file.size > maximumImageBytes ||
      !allowedImageTypes.includes(
        file.type as (typeof allowedImageTypes)[number],
      )
    )
      throw new Error('Pilih gambar PNG, JPG, atau WebP maksimum 8 MB.')
    return { alt, file }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManage(actor))
      throw new Error('Anda tidak berwenang mengubah Maklumat Pelayanan.')
    const bytes = Buffer.from(await data.file.arrayBuffer())
    if (!isValidImage(bytes, data.file.type))
      throw new Error('Isi berkas bukan gambar yang valid.')
    const extension =
      data.file.type === 'image/png'
        ? 'png'
        : data.file.type === 'image/jpeg'
          ? 'jpg'
          : 'webp'
    const storagePath = `service-charter/${randomUUID()}.${extension}`
    await ensureImageBucket()
    const upload = await storageRequest(
      `/object/${publicImagesBucket}/${storagePath}`,
      {
        method: 'POST',
        headers: { 'content-type': data.file.type, 'x-upsert': 'false' },
        body: bytes,
      },
    )
    if (!upload.ok) throw new Error('Gambar tidak dapat diunggah.')
    let previousStoragePath: string | null = null
    try {
      await withTransaction(async (client) => {
        const previous = await client.query<{ storagePath: string | null }>(
          'select storage_path as "storagePath" from ppid.service_charter where id = true for update',
        )
        previousStoragePath = previous.rows[0]?.storagePath ?? null
        const updated = await client.query(
          `update ppid.service_charter
           set alt_text = $1, storage_bucket = $2, storage_path = $3,
             original_filename = $4, content_type = $5, byte_size = $6,
             updated_by = $7, updated_at = now()
           where id = true`,
          [
            data.alt,
            publicImagesBucket,
            storagePath,
            data.file.name,
            data.file.type,
            bytes.byteLength,
            actor.userId,
          ],
        )
        if (!updated.rowCount)
          throw new Error('Konfigurasi Maklumat Pelayanan belum tersedia.')
        await client.query(
          `insert into ppid.audit_logs
            (actor_user_id, action, resource_type, resource_id, change_summary)
           values ($1, 'service_charter.replaced', 'service_charter', $2, $3::jsonb)`,
          [actor.userId, 'maklumat-pelayanan', JSON.stringify({ storagePath })],
        )
      })
    } catch (error) {
      await storageRequest(`/object/${publicImagesBucket}/${storagePath}`, {
        method: 'DELETE',
      }).catch(() => undefined)
      throw error
    }
    if (previousStoragePath) {
      await storageRequest(
        `/object/${publicImagesBucket}/${previousStoragePath}`,
        { method: 'DELETE' },
      ).catch(() => undefined)
    }
    return { ok: true }
  })
