import { createHash, randomUUID } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { canReadContent, getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'

export type InformationServiceKind = 'procedure' | 'announcement'
export type InformationServiceDocument = {
  id: string
  title: string
  href: string | null
  contentType: string | null
}
export type AdminInformationServiceDocument = InformationServiceDocument & {
  kind: InformationServiceKind
  attachmentName: string | null
  publicationState: 'draft' | 'published' | null
}

const quarantineBucket = 'ppid-quarantine'
const publicDocumentsBucket = 'ppid-public-documents'
const maximumFileBytes = 15 * 1024 * 1024
const allowedMimeTypes = ['application/pdf', 'image/png']

function validateKind(value: unknown): InformationServiceKind {
  if (value !== 'procedure' && value !== 'announcement')
    throw new Error('Jenis layanan tidak valid.')
  return value
}
function canManage(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['content_editor', 'reviewer', 'ppid_supervisor', 'administrator'].includes(
      role,
    ),
  )
}
function canPublish(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
}

async function storageRequest(path: string, init: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey)
    throw new Error('Penyimpanan berkas belum dikonfigurasi.')
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  })
}
async function ensureBucket(bucketId: string, isPublic: boolean) {
  const listed = await storageRequest('/bucket')
  const buckets = (await listed.json().catch(() => null)) as unknown
  if (!listed.ok || !Array.isArray(buckets))
    throw new Error('Penyimpanan berkas tidak tersedia.')
  const config = {
    file_size_limit: maximumFileBytes,
    allowed_mime_types: allowedMimeTypes,
  }
  if (
    buckets.some(
      (item) =>
        typeof item === 'object' &&
        item &&
        ('id' in item
          ? item.id === bucketId
          : 'name' in item && item.name === bucketId),
    )
  ) {
    const updated = await storageRequest(`/bucket/${bucketId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!updated.ok)
      throw new Error('Konfigurasi bucket tidak dapat diperbarui.')
    return
  }
  const created = await storageRequest('/bucket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: bucketId,
      name: bucketId,
      public: isPublic,
      ...config,
    }),
  })
  if (!created.ok && created.status !== 409)
    throw new Error('Penyimpanan berkas belum siap.')
}

export const getPublicInformationServices = createServerFn({ method: 'GET' })
  .validator((data: unknown) =>
    validateKind((data as { kind?: unknown })?.kind),
  )
  .handler(async ({ data }): Promise<InformationServiceDocument[]> => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
    const rows = await queryRows<{
      id: string
      title: string
      storagePath: string | null
      contentType: string | null
    }>(
      `select item.id, item.title, version.storage_path as "storagePath", version.content_type as "contentType" from ppid.information_service_documents item left join ppid.documents document on document.id = item.document_id and document.publication_state = 'published' left join ppid.document_versions version on version.id = document.active_version_id where item.kind = $1 order by item.display_order`,
      [data],
    )
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      contentType: row.contentType,
      href:
        row.storagePath && baseUrl
          ? `${baseUrl}/storage/v1/object/public/${publicDocumentsBucket}/${row.storagePath.split('/').map(encodeURIComponent).join('/')}`
          : null,
    }))
  })

export const getAdminInformationServices = createServerFn({
  method: 'GET',
}).handler(async () => {
  const actor = await getAdminActor()
  if (!actor || !canReadContent(actor)) return { access: 'denied' as const }
  const documents = await queryRows<AdminInformationServiceDocument>(
    `select item.id, item.kind, item.title, document.publication_state as "publicationState", version.original_filename as "attachmentName", version.content_type as "contentType", case when document.publication_state = 'published' then version.storage_path end as href from ppid.information_service_documents item left join ppid.documents document on document.id = item.document_id left join lateral (select original_filename, content_type, storage_path from ppid.document_versions where document_id = document.id order by created_at desc limit 1) version on true order by item.kind, item.display_order`,
  )
  return {
    access: 'granted' as const,
    actor: { displayName: actor.displayName, roles: actor.roles },
    documents,
  }
})

export const replaceInformationServiceDocument = createServerFn({
  method: 'POST',
})
  .validator((data: unknown) => {
    if (!(data instanceof FormData))
      throw new Error('Data dokumen tidak valid.')
    const id = String(data.get('id') ?? '').trim()
    const title = String(data.get('title') ?? '').trim()
    const file = data.get('file')
    if (!id || !title || !(file instanceof File) || !file.size)
      throw new Error('Judul dan berkas wajib diisi.')
    const contentType =
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
        ? 'image/png'
        : file.type === 'application/pdf' ||
            file.name.toLowerCase().endsWith('.pdf')
          ? 'application/pdf'
          : null
    if (!contentType || file.size > maximumFileBytes)
      throw new Error('Pilih PDF atau PNG dengan ukuran maksimum 15 MB.')
    return { id, title, file, contentType }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManage(actor))
      throw new Error('Anda tidak berwenang mengubah dokumen ini.')
    const item = await queryRows<{ id: string }>(
      'select id from ppid.information_service_documents where id = $1',
      [data.id],
    )
    if (!item[0]) throw new Error('Dokumen layanan tidak ditemukan.')
    const bytes = Buffer.from(await data.file.arrayBuffer())
    if (
      data.contentType === 'application/pdf' &&
      !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))
    )
      throw new Error('Isi berkas bukan PDF yang valid.')
    if (
      data.contentType === 'image/png' &&
      !bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw new Error('Isi berkas bukan PNG yang valid.')
    const documentId = randomUUID(),
      versionId = randomUUID(),
      extension = data.contentType === 'image/png' ? 'png' : 'pdf',
      storagePath = `information-services/${documentId}/${versionId}.${extension}`
    await ensureBucket(quarantineBucket, false)
    await ensureBucket(publicDocumentsBucket, true)
    const upload = await storageRequest(
      `/object/${quarantineBucket}/${storagePath}`,
      {
        method: 'POST',
        headers: { 'content-type': data.contentType, 'x-upsert': 'false' },
        body: bytes,
      },
    )
    if (!upload.ok) throw new Error('Berkas tidak dapat diunggah ke karantina.')
    try {
      await withTransaction(async (client) => {
        const category = await client.query<{ id: string }>(
          "select id from ppid.document_categories where slug = 'service-standard' limit 1",
        )
        if (!category.rows[0])
          throw new Error('Kategori Standar Layanan belum tersedia.')
        await client.query(
          `insert into ppid.documents (id, category_id, slug, title, publication_state, description, created_by) values ($1, $2, $3, $4, 'draft', '', $5)`,
          [
            documentId,
            category.rows[0].id,
            `layanan-${documentId.slice(0, 8)}`,
            data.title,
            actor.userId,
          ],
        )
        await client.query(
          `insert into ppid.document_versions (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256, uploaded_by) values ($1, $2, $3, $4, 'pending', 'draft', $5, $6, $7, $8, $9)`,
          [
            versionId,
            documentId,
            quarantineBucket,
            storagePath,
            data.file.name,
            data.contentType,
            bytes.byteLength,
            createHash('sha256').update(bytes).digest('hex'),
            actor.userId,
          ],
        )
        await client.query(
          'update ppid.information_service_documents set title = $1, document_id = $2, updated_at = now() where id = $3',
          [data.title, documentId, data.id],
        )
        await client.query(
          `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary) values ($1, 'information_service.replaced', 'information_service_document', $2, $3::jsonb)`,
          [actor.userId, data.id, JSON.stringify({ versionId })],
        )
      })
    } catch (error) {
      await storageRequest(`/object/${quarantineBucket}/${storagePath}`, {
        method: 'DELETE',
      }).catch(() => undefined)
      throw error
    }
    return { ok: true }
  })

export const publishInformationServiceDocument = createServerFn({
  method: 'POST',
})
  .validator((data: unknown) => {
    const id = String((data as { id?: unknown })?.id ?? '').trim()
    if (!id) throw new Error('Dokumen layanan tidak valid.')
    return { id }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canPublish(actor))
      throw new Error('Anda tidak berwenang menerbitkan dokumen ini.')
    const rows = await queryRows<{
      documentId: string
      versionId: string
      storagePath: string
    }>(
      `select document.id as "documentId", version.id as "versionId", version.storage_path as "storagePath" from ppid.information_service_documents item join ppid.documents document on document.id = item.document_id join ppid.document_versions version on version.document_id = document.id where item.id = $1 and version.storage_bucket = $2 order by version.created_at desc limit 1`,
      [data.id, quarantineBucket],
    )
    const row = rows[0]
    if (!row) throw new Error('Dokumen yang siap diterbitkan tidak ditemukan.')
    const copied = await storageRequest('/object/copy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bucketId: quarantineBucket,
        sourceKey: row.storagePath,
        destinationBucket: publicDocumentsBucket,
        destinationKey: row.storagePath,
      }),
    })
    if (!copied.ok) throw new Error('Berkas tidak dapat dipindahkan ke publik.')
    await withTransaction(async (client) => {
      await client.query(
        `update ppid.document_versions set storage_bucket = $1, scan_state = 'accepted', approval_state = 'approved' where id = $2`,
        [publicDocumentsBucket, row.versionId],
      )
      await client.query(
        `update ppid.documents set active_version_id = $1, publication_state = 'published', published_at = now() where id = $2`,
        [row.versionId, row.documentId],
      )
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary) values ($1, 'information_service.published', 'information_service_document', $2, $3::jsonb)`,
        [actor.userId, data.id, JSON.stringify({ versionId: row.versionId })],
      )
    })
    return { ok: true }
  })
