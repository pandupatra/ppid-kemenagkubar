import { createHash, randomUUID } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { canReadContent, getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'

const maximumFileBytes = 15 * 1024 * 1024
const quarantineBucket = 'ppid-quarantine'
const publicDocumentsBucket = 'ppid-public-documents'
const allowedMimeType = 'application/pdf'
const allowedStorageMimeTypes = [allowedMimeType, 'image/png']

export type AdminDocument = {
  category: string | null
  createdAt: string
  id: string
  publicationState: 'draft' | 'in_review' | 'published' | 'archived'
  title: string
  versionState: string | null
}

export type DocumentCategory = { id: string; title: string }
export type DipGroup = { id: string; code: string; title: string }
export type AdminDipItem = {
  attachmentName: string | null
  attachmentSize: number | null
  description: string
  disclosureCategory:
    'periodic' | 'available_anytime' | 'immediate' | 'excluded'
  documentId: string | null
  documentPublicationState:
    'draft' | 'in_review' | 'published' | 'archived' | null
  id: string
  groupId: string
  keywords: string[]
  officialTitle: string
  publicationState: 'draft' | 'published' | 'archived'
  publishDate: string | null
}

export type AdminDocumentsData =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      categories: DocumentCategory[]
      dipGroups: DipGroup[]
      dipItems: AdminDipItem[]
      documents: AdminDocument[]
    }

function canManageDocuments(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['content_editor', 'reviewer', 'ppid_supervisor', 'administrator'].includes(
      role,
    ),
  )
}

function canPublishDocuments(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
}

async function getStorageConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey)
    throw new Error('Penyimpanan berkas belum dikonfigurasi.')
  return { baseUrl: baseUrl.replace(/\/$/, ''), serviceKey }
}

async function storageRequest(path: string, init: RequestInit = {}) {
  const { baseUrl, serviceKey } = await getStorageConfig()
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
  // The Storage API accepts listing buckets reliably across Supabase versions.
  // Some deployments return 400 for a direct bucket lookup when it is missing.
  const listed = await storageRequest('/bucket')
  if (!listed.ok)
    throw new Error(
      'Penyimpanan berkas tidak tersedia. Coba lagi atau hubungi administrator.',
    )
  const buckets = (await listed.json().catch(() => null)) as unknown
  if (!Array.isArray(buckets))
    throw new Error(
      'Penyimpanan berkas tidak tersedia. Coba lagi atau hubungi administrator.',
    )
  if (
    buckets.some(
      (bucket) =>
        typeof bucket === 'object' &&
        bucket !== null &&
        ('id' in bucket
          ? bucket.id === bucketId
          : 'name' in bucket && bucket.name === bucketId),
    )
  ) {
    const updated = await storageRequest(`/bucket/${bucketId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        file_size_limit: maximumFileBytes,
        allowed_mime_types: allowedStorageMimeTypes,
      }),
    })
    if (!updated.ok)
      throw new Error(
        'Penyimpanan berkas belum siap. Hubungi administrator untuk memeriksa izin Storage.',
      )
    return
  }
  const created = await storageRequest('/bucket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: bucketId,
      name: bucketId,
      public: isPublic,
      file_size_limit: maximumFileBytes,
      allowed_mime_types: allowedStorageMimeTypes,
    }),
  })
  const creationResult = (await created.json().catch(() => null)) as unknown
  const wasCreatedByAnotherRequest =
    typeof creationResult === 'object' &&
    creationResult !== null &&
    'code' in creationResult &&
    creationResult.code === 'BucketAlreadyExists'
  if (!created.ok && created.status !== 409 && !wasCreatedByAnotherRequest)
    throw new Error(
      'Penyimpanan berkas belum siap. Hubungi administrator untuk memeriksa izin Storage.',
    )
}

async function ensureQuarantineBucket() {
  return ensureBucket(quarantineBucket, false)
}

async function ensurePublicDocumentsBucket() {
  return ensureBucket(publicDocumentsBucket, true)
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function validateDocumentForm(data: unknown) {
  if (!(data instanceof FormData)) throw new Error('Data dokumen tidak valid.')
  const title = String(data.get('title') ?? '').trim()
  const categoryId = String(data.get('categoryId') ?? '').trim()
  const groupId = String(data.get('groupId') ?? '').trim()
  const description = String(data.get('description') ?? '').trim()
  const publishDate = String(data.get('publishDate') ?? '').trim()
  const keywords = String(data.get('keywords') ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 12)
  const file = data.get('file')
  if (!title || !categoryId || !groupId)
    throw new Error('Lengkapi judul, kategori, dan grup dokumen.')
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > maximumFileBytes
  ) {
    throw new Error('Pilih berkas PDF dengan ukuran maksimum 15 MB.')
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Hanya berkas PDF yang dapat diunggah.')
  }
  if (description.length > 5_000)
    throw new Error('Deskripsi dokumen maksimal 5.000 karakter.')
  if (
    publishDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
      new Date(`${publishDate}T00:00:00.000Z`).toISOString().slice(0, 10) !==
        publishDate)
  )
    throw new Error('Tanggal publikasi tidak valid.')
  return {
    categoryId,
    groupId,
    description,
    file,
    keywords,
    publishDate: publishDate || null,
    title,
  }
}

export const getAdminDocuments = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminDocumentsData> => {
    const actor = await getAdminActor()
    if (!actor || !canReadContent(actor)) return { access: 'denied' }
    const [categories, dipGroups, documents, dipItems] = await Promise.all([
      queryRows<DocumentCategory>(
        'select id, title from ppid.document_categories order by title',
      ),
      queryRows<DipGroup>(
        'select id, code, title from ppid.dip_groups order by display_order, code',
      ),
      queryRows<AdminDocument>(`
        select document.id, document.title, document.publication_state as "publicationState",
          document.created_at as "createdAt", category.title as category,
          version.scan_state as "versionState"
        from ppid.documents document
        left join ppid.document_categories category on category.id = document.category_id
        left join ppid.document_versions version on version.id = document.active_version_id
        order by document.created_at desc
        limit 100
      `),
      queryRows<AdminDipItem>(
        `select dip.id, dip.group_id as "groupId", dip.official_title as "officialTitle", dip.disclosure_category as "disclosureCategory", dip.document_id as "documentId",
          dip.keywords, dip.publication_state as "publicationState",
          document.publication_state as "documentPublicationState",
          coalesce(document.description, '') as description,
          document.publish_date::text as "publishDate",
          version.original_filename as "attachmentName",
          version.byte_size::integer as "attachmentSize"
         from ppid.dip_items dip
         left join ppid.documents document on document.id = dip.document_id
         left join lateral (
           select original_filename, byte_size
           from ppid.document_versions
           where document_id = document.id
           order by created_at desc
           limit 1
         ) version on true
         where dip.publication_state <> 'archived'
         order by dip.thematic_group, dip.group_order`,
      ),
    ])
    return {
      access: 'granted',
      actor: { displayName: actor.displayName, roles: actor.roles },
      categories,
      dipGroups,
      dipItems,
      documents,
    }
  },
)

export const createAdminDocument = createServerFn({ method: 'POST' })
  .validator(validateDocumentForm)
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDocuments(actor))
      throw new Error('Anda tidak berwenang menambah dokumen.')
    const [category, group] = await Promise.all([
      queryRows<{ id: string }>(
        'select id from ppid.document_categories where id = $1',
        [data.categoryId],
      ),
      queryRows<{ id: string }>(
        'select id from ppid.dip_groups where id = $1',
        [data.groupId],
      ),
    ])
    if (category.length === 0) throw new Error('Kategori dokumen tidak valid.')
    if (group.length === 0) throw new Error('Grup dokumen tidak valid.')

    const bytes = Buffer.from(await data.file.arrayBuffer())
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new Error('Isi berkas bukan PDF yang valid.')
    const documentId = randomUUID()
    const versionId = randomUUID()
    const slug = `${slugify(data.title) || 'dokumen'}-${documentId.slice(0, 8)}`
    const storagePath = `${documentId}/${versionId}.pdf`

    await ensureQuarantineBucket()
    const upload = await storageRequest(
      `/object/${quarantineBucket}/${storagePath}`,
      {
        method: 'POST',
        headers: { 'content-type': allowedMimeType, 'x-upsert': 'false' },
        body: bytes,
      },
    )
    if (!upload.ok) throw new Error('Berkas tidak dapat diunggah ke karantina.')

    try {
      await withTransaction(async (client) => {
        await client.query(
          `insert into ppid.documents (id, category_id, group_id, slug, title, owner_unit, document_year, keywords, publication_state, description, document_number, publish_date, created_by)
           values ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9, $10, $11, $12)`,
          [
            documentId,
            data.categoryId,
            data.groupId,
            slug,
            data.title,
            null,
            null,
            data.keywords,
            data.description,
            null,
            data.publishDate,
            actor.userId,
          ],
        )
        await client.query(
          `insert into ppid.document_versions (id, document_id, storage_bucket, storage_path, scan_state, approval_state, original_filename, content_type, byte_size, sha256, uploaded_by)
           values ($1, $2, $3, $4, 'pending', 'draft', $5, $6, $7, $8, $9)`,
          [
            versionId,
            documentId,
            quarantineBucket,
            storagePath,
            data.file.name,
            allowedMimeType,
            bytes.byteLength,
            createHash('sha256').update(bytes).digest('hex'),
            actor.userId,
          ],
        )
        await client.query(
          `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
           values ($1, 'document.created', 'document', $2, $3::jsonb)`,
          [
            actor.userId,
            documentId,
            JSON.stringify({
              categoryId: data.categoryId,
              groupId: data.groupId,
              state: 'draft',
              versionId,
            }),
          ],
        )
      })
    } catch (error) {
      await storageRequest(`/object/${quarantineBucket}/${storagePath}`, {
        method: 'DELETE',
      }).catch(() => undefined)
      throw error
    }
    return { documentId, ok: true }
  })

export const attachPdfToDip = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Data DIP tidak valid.')
    const dipId = String(data.get('dipId') ?? '')
    const description = String(data.get('description') ?? '').trim()
    const publishDate = String(data.get('publishDate') ?? '').trim()
    const file = data.get('file')
    if (!dipId || !(file instanceof File))
      throw new Error('Pilih berkas PDF terlebih dahulu.')
    if (!file.size || file.size > maximumFileBytes)
      throw new Error('Ukuran PDF maksimum 15 MB.')
    if (!file.name.toLowerCase().endsWith('.pdf'))
      throw new Error('Hanya berkas dengan ekstensi .pdf yang dapat diunggah.')
    if (description.length > 5_000)
      throw new Error('Deskripsi dokumen maksimal 5.000 karakter.')
    if (
      publishDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
        new Date(`${publishDate}T00:00:00.000Z`).toISOString().slice(0, 10) !==
          publishDate)
    )
      throw new Error('Tanggal publikasi tidak valid.')
    return { description, dipId, file, publishDate: publishDate || null }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDocuments(actor))
      throw new Error('Anda tidak berwenang mengubah DIP.')
    const dip = await queryRows<{
      official_title: string
      owner_unit: string | null
      document_year: number | null
      keywords: string[]
    }>(
      'select official_title, owner_unit, document_year, keywords from ppid.dip_items where id = $1',
      [data.dipId],
    )
    if (!dip[0]) throw new Error('Entri DIP tidak ditemukan.')
    const bytes = Buffer.from(await data.file.arrayBuffer())
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
      throw new Error('Isi berkas bukan PDF yang valid.')
    const documentId = randomUUID(),
      versionId = randomUUID(),
      storagePath = `${documentId}/${versionId}.pdf`
    await ensureQuarantineBucket()
    const upload = await storageRequest(
      `/object/${quarantineBucket}/${storagePath}`,
      {
        method: 'POST',
        headers: { 'content-type': allowedMimeType, 'x-upsert': 'false' },
        body: bytes,
      },
    )
    if (!upload.ok) throw new Error('Berkas tidak dapat diunggah ke karantina.')
    try {
      await withTransaction(async (client) => {
        const category = await client.query<{ id: string }>(
          "select id from ppid.document_categories where slug = 'dip' limit 1",
        )
        if (!category.rows[0]) throw new Error('Kategori DIP belum tersedia.')
        await client.query(
          `insert into ppid.documents (id,category_id,slug,title,owner_unit,document_year,keywords,publication_state,description,publish_date,created_by) values ($1,$2,$3,$4,$5,$6,$7,'draft',$8,$9,$10)`,
          [
            documentId,
            category.rows[0].id,
            `dip-${documentId.slice(0, 8)}`,
            dip[0].official_title,
            null,
            null,
            dip[0].keywords,
            data.description,
            data.publishDate,
            actor.userId,
          ],
        )
        await client.query(
          `insert into ppid.document_versions (id,document_id,storage_bucket,storage_path,scan_state,approval_state,original_filename,content_type,byte_size,sha256,uploaded_by) values ($1,$2,$3,$4,'pending','draft',$5,$6,$7,$8,$9)`,
          [
            versionId,
            documentId,
            quarantineBucket,
            storagePath,
            data.file.name,
            allowedMimeType,
            bytes.byteLength,
            createHash('sha256').update(bytes).digest('hex'),
            actor.userId,
          ],
        )
        await client.query(
          'update ppid.dip_items set document_id = $1, updated_at = now() where id = $2',
          [documentId, data.dipId],
        )
        await client.query(
          `insert into ppid.audit_logs (actor_user_id,action,resource_type,resource_id,change_summary) values ($1,'dip.pdf_attached','dip_item',$2,$3::jsonb)`,
          [actor.userId, data.dipId, JSON.stringify({ documentId, versionId })],
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

export const publishDipDocument = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object' || !('dipId' in data))
      throw new Error('Data penerbitan DIP tidak valid.')
    const dipId = String(data.dipId ?? '').trim()
    if (!dipId) throw new Error('Entri DIP tidak valid.')
    return { dipId }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canPublishDocuments(actor))
      throw new Error('Anda tidak berwenang menerbitkan dokumen publik.')

    const items = await queryRows<{
      documentId: string
      storageBucket: string
      storagePath: string
      versionId: string
    }>(
      `select document.id as "documentId", version.id as "versionId",
              version.storage_bucket as "storageBucket", version.storage_path as "storagePath"
       from ppid.dip_items dip
       join ppid.documents document on document.id = dip.document_id
       join lateral (
         select id, storage_bucket, storage_path
         from ppid.document_versions
         where document_id = document.id
         order by created_at desc
         limit 1
       ) version on true
       where dip.id = $1 and dip.publication_state = 'published'
         and dip.disclosure_category <> 'excluded'`,
      [data.dipId],
    )
    const item = items[0]
    if (!item)
      throw new Error('PDF DIP yang dapat diterbitkan tidak ditemukan.')
    if (item.storageBucket !== quarantineBucket)
      throw new Error('Versi PDF ini sudah tidak berada dalam antrean review.')

    await ensurePublicDocumentsBucket()
    const copied = await storageRequest('/object/copy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bucketId: quarantineBucket,
        sourceKey: item.storagePath,
        destinationBucket: publicDocumentsBucket,
        destinationKey: item.storagePath,
      }),
    })
    if (!copied.ok) throw new Error('PDF tidak dapat dipindahkan ke publik.')

    try {
      await withTransaction(async (client) => {
        await client.query(
          `update ppid.document_versions
           set storage_bucket = $1, scan_state = 'accepted', approval_state = 'approved'
           where id = $2 and document_id = $3`,
          [publicDocumentsBucket, item.versionId, item.documentId],
        )
        await client.query(
          `update ppid.documents
           set active_version_id = $1, publication_state = 'published', published_at = now(),
               publish_date = coalesce(publish_date, current_date)
           where id = $2`,
          [item.versionId, item.documentId],
        )
        await client.query(
          `insert into ppid.publication_reviews (document_id, document_version_id, decision, public_summary)
           values ($1, $2, 'approved', $3)`,
          [
            item.documentId,
            item.versionId,
            'Disetujui untuk publikasi oleh petugas PPID berwenang.',
          ],
        )
        await client.query(
          `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
           values ($1, 'document.published', 'document', $2, $3::jsonb)`,
          [
            actor.userId,
            item.documentId,
            JSON.stringify({ dipId: data.dipId, versionId: item.versionId }),
          ],
        )
      })
    } catch (error) {
      await storageRequest(
        `/object/${publicDocumentsBucket}/${item.storagePath}`,
        { method: 'DELETE' },
      ).catch(() => undefined)
      throw error
    }
    return { ok: true }
  })

export const removeDipAttachment = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object' || !('dipId' in data))
      throw new Error('Data lampiran DIP tidak valid.')
    const dipId = String(data.dipId ?? '').trim()
    if (!dipId) throw new Error('Entri DIP tidak valid.')
    return { dipId }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDocuments(actor))
      throw new Error('Anda tidak berwenang menghapus lampiran DIP.')

    const attachments = await queryRows<{
      documentId: string
      storageBucket: string
      storagePath: string
    }>(
      `select document.id as "documentId", version.storage_bucket as "storageBucket",
              version.storage_path as "storagePath"
       from ppid.dip_items dip
       join ppid.documents document on document.id = dip.document_id
       join lateral (
         select storage_bucket, storage_path
         from ppid.document_versions
         where document_id = document.id
         order by created_at desc
         limit 1
       ) version on true
       where dip.id = $1 and dip.publication_state <> 'archived'`,
      [data.dipId],
    )
    const attachment = attachments[0]
    if (!attachment) throw new Error('Lampiran DIP tidak ditemukan.')

    await withTransaction(async (client) => {
      const detached = await client.query(
        `update ppid.dip_items
         set document_id = null, updated_at = now()
         where id = $1 and document_id = $2 and publication_state <> 'archived'`,
        [data.dipId, attachment.documentId],
      )
      if (detached.rowCount !== 1)
        throw new Error(
          'Lampiran DIP sudah berubah. Muat ulang halaman lalu coba lagi.',
        )
      await client.query(
        `update ppid.documents
         set publication_state = 'archived'
         where id = $1`,
        [attachment.documentId],
      )
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'dip.attachment_removed', 'dip_item', $2, $3::jsonb)`,
        [
          actor.userId,
          data.dipId,
          JSON.stringify({ documentId: attachment.documentId }),
        ],
      )
    })

    const deleted = await storageRequest(
      `/object/${attachment.storageBucket}/${attachment.storagePath}`,
      { method: 'DELETE' },
    )
    if (!deleted.ok)
      throw new Error(
        'Lampiran telah dilepas, tetapi berkas penyimpanan belum dapat dihapus. Hubungi administrator.',
      )
    return { ok: true }
  })

function validateDipUpdate(data: unknown) {
  if (!(data instanceof FormData)) throw new Error('Data DIP tidak valid.')
  const id = String(data.get('dipId') ?? '').trim()
  const officialTitle = String(data.get('officialTitle') ?? '').trim()
  const description = String(data.get('description') ?? '').trim()
  const groupId = String(data.get('groupId') ?? '').trim()
  const publishDate = String(data.get('publishDate') ?? '').trim()
  const keywords = String(data.get('keywords') ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 12)

  if (!id || !officialTitle) throw new Error('Judul DIP wajib diisi.')
  if (!groupId) throw new Error('Kategori kelompok DIP wajib dipilih.')
  if (description.length > 5_000)
    throw new Error('Deskripsi dokumen maksimal 5.000 karakter.')
  if (
    publishDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
      new Date(`${publishDate}T00:00:00.000Z`).toISOString().slice(0, 10) !==
        publishDate)
  )
    throw new Error('Tanggal publikasi tidak valid.')
  return {
    description,
    id,
    groupId,
    keywords,
    officialTitle,
    publishDate: publishDate || null,
  }
}

export const updateDipItem = createServerFn({ method: 'POST' })
  .validator(validateDipUpdate)
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDocuments(actor))
      throw new Error('Anda tidak berwenang mengubah DIP.')

    await withTransaction(async (client) => {
      const group = await client.query<{ code: string }>(
        'select code from ppid.dip_groups where id = $1',
        [data.groupId],
      )
      if (!group.rows[0]) throw new Error('Kategori kelompok DIP tidak valid.')
      const result = await client.query(
        `update ppid.dip_items
         set official_title = $1, keywords = $2, group_id = $3, thematic_group = $4, updated_at = now()
         where id = $5 and publication_state <> 'archived'`,
        [
          data.officialTitle,
          data.keywords,
          data.groupId,
          group.rows[0].code,
          data.id,
        ],
      )
      if (result.rowCount !== 1) throw new Error('Entri DIP tidak ditemukan.')
      await client.query(
        `update ppid.documents
         set title = $1, description = $2, publish_date = $3, keywords = $4
         where id = (select document_id from ppid.dip_items where id = $5)`,
        [
          data.officialTitle,
          data.description,
          data.publishDate,
          data.keywords,
          data.id,
        ],
      )
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'dip.updated', 'dip_item', $2, $3::jsonb)`,
        [
          actor.userId,
          data.id,
          JSON.stringify({
            fields: [
              'official_title',
              'description',
              'publish_date',
              'keywords',
              'group_id',
            ],
          }),
        ],
      )
    })
    return { ok: true }
  })

export const archiveDipItem = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object' || !('id' in data))
      throw new Error('Entri DIP tidak valid.')
    const id = String(data.id ?? '').trim()
    if (!id) throw new Error('Entri DIP tidak valid.')
    return { id }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDocuments(actor))
      throw new Error('Anda tidak berwenang menghapus DIP.')

    await withTransaction(async (client) => {
      const result = await client.query(
        `update ppid.dip_items
         set publication_state = 'archived', updated_at = now()
         where id = $1 and publication_state <> 'archived'`,
        [data.id],
      )
      if (result.rowCount !== 1) throw new Error('Entri DIP tidak ditemukan.')
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'dip.archived', 'dip_item', $2, $3::jsonb)`,
        [
          actor.userId,
          data.id,
          JSON.stringify({ reason: 'Removed from register by administrator' }),
        ],
      )
    })
    return { ok: true }
  })
