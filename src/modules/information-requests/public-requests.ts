import { randomBytes, randomUUID } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { queryRows, withTransaction } from '@/server/db/postgres'

const applicantTypes = new Set([
  'individual',
  'community_group',
  'legal_entity',
  'organization',
])
const requestedFormats = new Set(['pdf', 'electronic_data', 'in_person'])
const deliveryMethods = new Set(['email', 'whatsapp', 'other_electronic'])

type PublicRequestInput = {
  address?: unknown
  applicantType?: unknown
  deliveryMethod?: unknown
  email?: unknown
  fullName?: unknown
  informationPeriod?: unknown
  intendedUse?: unknown
  requestedDetail?: unknown
  requestedFormat?: unknown
  requestedTitle?: unknown
  whatsappNumber?: unknown
}

type ValidPublicRequest = {
  address: string
  applicantType: string
  deliveryMethod: string
  email: string | null
  fullName: string
  informationPeriod: string | null
  intendedUse: string
  requestedDetail: string
  requestedFormat: string
  requestedTitle: string
  whatsappNumber: string
}

function text(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function validatePublicRequest(input: unknown): ValidPublicRequest {
  if (!input || typeof input !== 'object')
    throw new Error('Data permohonan tidak valid.')
  const data = input as PublicRequestInput
  const fullName = text(data.fullName, 200)
  const address = text(data.address, 2_000)
  const whatsappNumber = text(data.whatsappNumber, 32)
  const requestedTitle = text(data.requestedTitle, 500)
  const requestedDetail = text(data.requestedDetail, 5_000)
  const intendedUse = text(data.intendedUse, 2_000)
  const email = text(data.email, 320)
  const applicantType = text(data.applicantType, 64)
  const requestedFormat = text(data.requestedFormat, 64)
  const deliveryMethod = text(data.deliveryMethod, 64)

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
  if (!requestedFormats.has(requestedFormat))
    throw new Error('Pilih bentuk informasi yang diinginkan.')
  if (!deliveryMethods.has(deliveryMethod))
    throw new Error('Pilih cara memperoleh informasi.')

  return {
    address,
    applicantType,
    deliveryMethod,
    email: email || null,
    fullName,
    informationPeriod: text(data.informationPeriod, 100) || null,
    intendedUse,
    requestedDetail,
    requestedFormat,
    requestedTitle,
    whatsappNumber,
  }
}

function createReceiptNumber() {
  return `PPID-${new Date().getUTCFullYear()}-${randomBytes(12).toString('hex').toUpperCase()}`
}

export const submitPublicInformationRequest = createServerFn({ method: 'POST' })
  .validator(validatePublicRequest)
  .handler(async ({ data }) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const requestId = randomUUID()
      const receiptNumber = createReceiptNumber()
      try {
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
              (information_request_id, full_name, applicant_type, address, whatsapp_number, email)
             values ($1, $2, $3, $4, $5, $6)`,
            [
              requestId,
              data.fullName,
              data.applicantType,
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
        })
        return { receiptNumber }
      } catch (error) {
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
