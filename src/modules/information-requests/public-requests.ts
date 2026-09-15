import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { queryRows, withTransaction } from '@/server/db/postgres'

const applicantTypes = new Set([
  'individual',
  'community_group',
  'legal_entity',
  'organization',
  'other',
])
const requestedFormats = new Set(['pdf', 'electronic_data', 'in_person'])
const deliveryMethods = new Set(['email', 'whatsapp', 'other_electronic'])

type ValidPublicRequest = {
  address: string
  applicantType: string
  applicantTypeOther: string | null
  authorizationAttachment: File
  deliveryMethod: string
  email: string | null
  fullName: string
  identityAttachment: File
  informationPeriod: string | null
  intendedUse: string
  requestedDetail: string
  requestedFormat: string
  requestedTitle: string
  whatsappNumber: string
}

type ValidPublicObjection = {
  address: string
  applicantStatus: string
  attachment: File
  email: string | null
  expectedResponse: string
  fullName: string
  objectionDetail: string
  objectionReasons: string[]
  otherReason: string | null
  requestChannel: string
  requestDate: string
  requestedInformation: string
  whatsappNumber: string
}

function text(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function validatePublicRequest(input: unknown): ValidPublicRequest {
  if (!(input instanceof FormData))
    throw new Error('Data permohonan tidak valid.')
  const fullName = text(input.get('fullName'), 200)
  const address = text(input.get('address'), 2_000)
  const whatsappNumber = text(input.get('whatsappNumber'), 32)
  const requestedTitle = text(input.get('requestedTitle'), 500)
  const requestedDetail = text(input.get('requestedDetail'), 5_000)
  const intendedUse = text(input.get('intendedUse'), 2_000)
  const email = text(input.get('email'), 320)
  const applicantType = text(input.get('applicantType'), 64)
  const applicantTypeOther = text(input.get('applicantTypeOther'), 200)
  const requestedFormat = text(input.get('requestedFormat'), 64)
  const deliveryMethod = text(input.get('deliveryMethod'), 64)
  const identityAttachment = input.get('identityAttachment')
  const authorizationAttachment = input.get('authorizationAttachment')

  if (
    fullName.length < 2 ||
    address.length < 10 ||
    whatsappNumber.length < 8 ||
    requestedTitle.length < 3 ||
    requestedDetail.length < 10 ||
    intendedUse.length < 3
  ) {
    throw new Error('Lengkapi semua isian wajib dengan informasi yang memadai.')
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email))
    throw new Error('Alamat email tidak valid.')
  if (!applicantTypes.has(applicantType))
    throw new Error('Pilih status pemohon.')
  if (applicantType === 'other' && applicantTypeOther.length < 2)
    throw new Error('Tuliskan status pemohon lainnya.')
  if (!requestedFormats.has(requestedFormat))
    throw new Error('Pilih bentuk informasi yang diinginkan.')
  if (!deliveryMethods.has(deliveryMethod))
    throw new Error('Pilih cara memperoleh informasi.')
  for (const [label, attachment] of [
    ['Identitas pemohon', identityAttachment],
    ['Surat kuasa atau surat pengantar', authorizationAttachment],
  ] as const) {
    if (!(attachment instanceof File) || attachment.size === 0)
      throw new Error(`${label} wajib diunggah.`)
    if (
      attachment.size > maximumAttachmentBytes ||
      !allowedAttachmentTypes.has(attachment.type)
    )
      throw new Error(`${label} harus berupa PDF atau PNG, maksimum 15 MB.`)
  }

  return {
    address,
    applicantType,
    applicantTypeOther: applicantTypeOther || null,
    authorizationAttachment: authorizationAttachment as File,
    deliveryMethod,
    email: email || null,
    fullName,
    identityAttachment: identityAttachment as File,
    informationPeriod: text(input.get('informationPeriod'), 100) || null,
    intendedUse,
    requestedDetail,
    requestedFormat,
    requestedTitle,
    whatsappNumber,
  }
}

const allowedObjectionReasons = new Set([
  'request_rejected',
  'periodic_information_unavailable',
  'no_response',
  'response_not_as_requested',
  'late_response',
  'unreasonable_fee',
  'incomplete_information',
  'other',
])
const applicantStatuses = new Set([
  'individual',
  'legal_entity',
  'group_or_organization',
  'other',
])
const requestChannels = new Set([
  'email',
  'whatsapp',
  'social_media',
  'in_person',
])
const allowedAttachmentTypes = new Set(['application/pdf', 'image/png'])
const maximumAttachmentBytes = 15 * 1024 * 1024
const quarantineBucket = 'ppid-quarantine'

function validatePublicObjection(input: unknown): ValidPublicObjection {
  if (!(input instanceof FormData))
    throw new Error('Data keberatan tidak valid.')
  const fullName = text(input.get('fullName'), 200)
  const address = text(input.get('address'), 2_000)
  const whatsappNumber = text(input.get('whatsappNumber'), 32)
  const requestedInformation = text(input.get('requestedInformation'), 5_000)
  const objectionDetail = text(input.get('objectionDetail'), 5_000)
  const expectedResponse = text(input.get('expectedResponse'), 2_000)
  const email = text(input.get('email'), 320)
  const applicantStatus = text(input.get('applicantStatus'), 64)
  const requestChannel = text(input.get('requestChannel'), 64)
  const requestDate = text(input.get('requestDate'), 10)
  const objectionReasons = input
    .getAll('objectionReasons')
    .map((value) => text(value, 64))
    .filter((value, index, values) => value && values.indexOf(value) === index)
  const otherReason = text(input.get('otherReason'), 500)
  const attachment = input.get('attachment')

  if (
    fullName.length < 2 ||
    address.length < 10 ||
    whatsappNumber.length < 8 ||
    requestedInformation.length < 3 ||
    objectionDetail.length < 10 ||
    expectedResponse.length < 3
  ) {
    throw new Error('Lengkapi semua isian wajib dengan informasi yang memadai.')
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email))
    throw new Error('Alamat email tidak valid.')
  if (!applicantStatuses.has(applicantStatus))
    throw new Error('Pilih status pemohon.')
  if (!requestChannels.has(requestChannel))
    throw new Error('Pilih media atau saluran permintaan informasi.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestDate))
    throw new Error('Tanggal permintaan informasi tidak valid.')
  if (
    objectionReasons.length === 0 ||
    objectionReasons.some((reason) => !allowedObjectionReasons.has(reason))
  )
    throw new Error('Pilih sedikitnya satu alasan pengajuan keberatan.')
  if (objectionReasons.includes('other') && otherReason.length < 3)
    throw new Error('Jelaskan alasan keberatan lainnya.')
  if (!(attachment instanceof File) || attachment.size === 0)
    throw new Error('Dokumen pendukung wajib diunggah.')
  if (
    attachment.size > maximumAttachmentBytes ||
    !allowedAttachmentTypes.has(attachment.type)
  )
    throw new Error('Pilih dokumen PDF atau PNG dengan ukuran maksimum 15 MB.')

  return {
    address,
    applicantStatus,
    attachment,
    email: email || null,
    expectedResponse,
    fullName,
    objectionDetail,
    objectionReasons,
    otherReason: otherReason || null,
    requestChannel,
    requestDate,
    requestedInformation,
    whatsappNumber,
  }
}

async function objectionStorageRequest(path: string, init: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey)
    throw new Error('Penyimpanan dokumen belum dikonfigurasi.')
  return fetch(`${baseUrl}/storage/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  })
}

function createReceiptNumber() {
  return `PPID-${new Date().getUTCFullYear()}-${randomBytes(12).toString('hex').toUpperCase()}`
}

function createObjectionReceiptNumber() {
  return `KBR-${new Date().getUTCFullYear()}-${randomBytes(12).toString('hex').toUpperCase()}`
}

export const submitPublicInformationRequest = createServerFn({ method: 'POST' })
  .validator(validatePublicRequest)
  .handler(async ({ data }) => {
    const attachments = await Promise.all(
      [
        ['identity', data.identityAttachment],
        ['authorization', data.authorizationAttachment],
      ].map(async ([kind, attachment]) => {
        const file = attachment as File
        const bytes = Buffer.from(await file.arrayBuffer())
        const extension = file.type === 'image/png' ? 'png' : 'pdf'
        const validSignature =
          (file.type === 'application/pdf' &&
            bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) ||
          (file.type === 'image/png' &&
            bytes
              .subarray(0, 8)
              .equals(
                Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
              ))
        if (!validSignature)
          throw new Error(`Isi berkas ${file.name} tidak valid.`)
        return { bytes, extension, file, kind: String(kind) }
      }),
    )

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const requestId = randomUUID()
      const receiptNumber = createReceiptNumber()
      const uploadedPaths: string[] = []
      try {
        for (const attachment of attachments) {
          const storagePath = `information-requests/${requestId}/${attachment.kind}-${randomUUID()}.${attachment.extension}`
          const upload = await objectionStorageRequest(
            `/object/${quarantineBucket}/${storagePath}`,
            {
              method: 'POST',
              headers: {
                'content-type': attachment.file.type,
                'x-upsert': 'false',
              },
              body: attachment.bytes,
            },
          )
          if (!upload.ok)
            throw new Error('Lampiran permohonan tidak dapat diunggah.')
          uploadedPaths.push(storagePath)
        }

        await withTransaction(async (client) => {
          await client.query(
            `insert into ppid.information_requests
              (id, receipt_number, requested_title, requested_detail, intended_use, information_period, requested_format, delivery_method)
             values ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              requestId,
              receiptNumber,
              data.requestedTitle,
              data.requestedDetail,
              data.intendedUse,
              data.informationPeriod,
              data.requestedFormat,
              data.deliveryMethod,
            ],
          )
          await client.query(
            `insert into ppid.request_applicants
              (information_request_id, full_name, applicant_type, applicant_type_other, address, whatsapp_number, email)
             values ($1, $2, $3, $4, $5, $6, $7)`,
            [
              requestId,
              data.fullName,
              data.applicantType,
              data.applicantTypeOther,
              data.address,
              data.whatsappNumber,
              data.email,
            ],
          )
          await client.query(
            `insert into ppid.request_events (information_request_id, event_type, event_summary)
             values ($1, 'submitted', '{"source":"public_form"}'::jsonb)`,
            [requestId],
          )
          for (const [index, attachment] of attachments.entries()) {
            await client.query(
              `insert into ppid.request_attachments
                (information_request_id, attachment_kind, storage_bucket, storage_path, original_filename, content_type, byte_size, sha256)
               values ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                requestId,
                attachment.kind,
                quarantineBucket,
                uploadedPaths[index],
                attachment.file.name,
                attachment.file.type,
                attachment.bytes.byteLength,
                createHash('sha256').update(attachment.bytes).digest('hex'),
              ],
            )
          }
        })
        return { receiptNumber }
      } catch (error) {
        await Promise.all(
          uploadedPaths.map((storagePath) =>
            objectionStorageRequest(
              `/object/${quarantineBucket}/${storagePath}`,
              { method: 'DELETE' },
            ).catch(() => undefined),
          ),
        )
        if (
          error instanceof Error &&
          /information_requests_receipt_number_key/.test(error.message)
        )
          continue
        throw new Error(
          'Permohonan belum dapat dikirim. Coba lagi beberapa saat lagi.',
        )
      }
    }
    throw new Error('Nomor tanda terima belum dapat dibuat. Coba lagi.')
  })

export const submitPublicInformationObjection = createServerFn({
  method: 'POST',
})
  .validator(validatePublicObjection)
  .handler(async ({ data }) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const receiptNumber = createObjectionReceiptNumber()
      const objectionId = randomUUID()
      const extension = data.attachment.type === 'image/png' ? 'png' : 'pdf'
      const storagePath = `information-objections/${objectionId}/${randomUUID()}.${extension}`
      const bytes = Buffer.from(await data.attachment.arrayBuffer())
      const validSignature =
        (data.attachment.type === 'application/pdf' &&
          bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) ||
        (data.attachment.type === 'image/png' &&
          bytes
            .subarray(0, 8)
            .equals(
              Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            ))
      if (!validSignature) throw new Error('Isi dokumen pendukung tidak valid.')

      const upload = await objectionStorageRequest(
        `/object/${quarantineBucket}/${storagePath}`,
        {
          method: 'POST',
          headers: {
            'content-type': data.attachment.type,
            'x-upsert': 'false',
          },
          body: bytes,
        },
      )
      if (!upload.ok) throw new Error('Dokumen pendukung tidak dapat diunggah.')
      try {
        await withTransaction(async (client) => {
          await client.query(
            `insert into ppid.information_objections
              (id, receipt_number, full_name, address, whatsapp_number, email, applicant_status, request_date, requested_information, request_channel, objection_reasons, other_reason, objection_detail, expected_response, attachment_bucket, attachment_path, attachment_name, attachment_content_type, attachment_byte_size, attachment_sha256)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
            [
              objectionId,
              receiptNumber,
              data.fullName,
              data.address,
              data.whatsappNumber,
              data.email,
              data.applicantStatus,
              data.requestDate,
              data.requestedInformation,
              data.requestChannel,
              data.objectionReasons,
              data.otherReason,
              data.objectionDetail,
              data.expectedResponse,
              quarantineBucket,
              storagePath,
              data.attachment.name,
              data.attachment.type,
              bytes.byteLength,
              createHash('sha256').update(bytes).digest('hex'),
            ],
          )
        })
        return { receiptNumber }
      } catch (error) {
        await objectionStorageRequest(
          `/object/${quarantineBucket}/${storagePath}`,
          { method: 'DELETE' },
        ).catch(() => undefined)
        if (
          error instanceof Error &&
          /information_objections_receipt_number_key/.test(error.message)
        )
          continue
        throw new Error(
          'Keberatan belum dapat dikirim. Coba lagi beberapa saat lagi.',
        )
      }
    }
    throw new Error('Nomor tanda terima belum dapat dibuat. Coba lagi.')
  })

const statusLabels: Record<string, string> = {
  assigned: 'Permohonan diteruskan ke unit terkait',
  closed: 'Permohonan ditutup',
  extended: 'Waktu tanggapan diperpanjang',
  fulfilled: 'Informasi telah diberikan',
  in_progress: 'Permohonan sedang diproses',
  needs_correction: 'Permohonan memerlukan perbaikan',
  partially_fulfilled: 'Informasi diberikan sebagian',
  rejected: 'Permohonan tidak dapat dipenuhi',
  submitted: 'Permohonan telah diterima',
  verified: 'Permohonan telah diverifikasi',
  withdrawn: 'Permohonan ditarik',
}

function validateReceipt(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Nomor tidak valid.')
  const receiptNumber = text(
    (input as { receiptNumber?: unknown }).receiptNumber,
    64,
  ).toUpperCase()
  if (!/^PPID-\d{4}-[A-F0-9]{24}$/.test(receiptNumber))
    throw new Error('Masukkan nomor tanda terima yang valid.')
  return receiptNumber
}

export const trackPublicInformationRequest = createServerFn({ method: 'POST' })
  .validator(validateReceipt)
  .handler(async ({ data }) => {
    const rows = await queryRows<{
      receipt_number: string
      status: string
      submitted_at: string
    }>(
      `select receipt_number, status, submitted_at
       from ppid.information_requests where receipt_number = $1`,
      [data],
    )
    const request = rows[0]
    if (!request) return null
    return {
      receiptNumber: request.receipt_number,
      status: statusLabels[request.status] ?? 'Status sedang diperbarui',
      submittedAt: request.submitted_at,
    }
  })
