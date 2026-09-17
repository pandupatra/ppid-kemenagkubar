import { createServerFn } from '@tanstack/react-start'
import { getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'

export const requestStatuses = [
  'submitted',
  'needs_correction',
  'verified',
  'assigned',
  'in_progress',
  'extended',
  'fulfilled',
  'partially_fulfilled',
  'rejected',
  'withdrawn',
  'closed',
] as const

export type RequestStatus = (typeof requestStatuses)[number]

export type AdminInformationRequest = {
  id: string
  receiptNumber: string
  status: RequestStatus
  requestedTitle: string
  requestedDetail: string
  intendedUse: string
  informationPeriod: string | null
  requestedFormat: string
  deliveryMethod: string
  submittedAt: string
  updatedAt: string
  applicant: {
    fullName: string
    applicantType: string
    applicantTypeOther: string | null
    address: string
    whatsappNumber: string
    email: string | null
  }
  attachments: Array<{
    id: string
    kind: 'identity' | 'authorization'
    originalFilename: string
    contentType: string
    byteSize: number
    scanState: 'pending' | 'accepted' | 'rejected'
    createdAt: string
  }>
  events: Array<{
    id: string
    type: string
    summary: { from?: string; source?: string; to?: string }
    actorName: string | null
    createdAt: string
  }>
}

export type AdminInformationRequestsData =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      canUpdate: boolean
      requests: AdminInformationRequest[]
    }

function canReadRequests(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['ppid_officer', 'ppid_supervisor', 'administrator', 'auditor'].includes(
      role,
    ),
  )
}

function canUpdateRequests(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['ppid_officer', 'ppid_supervisor', 'administrator'].includes(role),
  )
}

type RequestRow = Omit<
  AdminInformationRequest,
  'applicant' | 'attachments' | 'events'
> & {
  fullName: string
  applicantType: string
  applicantTypeOther: string | null
  address: string
  whatsappNumber: string
  email: string | null
  attachments: AdminInformationRequest['attachments']
  events: AdminInformationRequest['events']
}

export const getAdminInformationRequests = createServerFn({
  method: 'GET',
}).handler(async (): Promise<AdminInformationRequestsData> => {
  const actor = await getAdminActor()
  if (!actor || !canReadRequests(actor)) return { access: 'denied' }

  const rows = await queryRows<RequestRow>(`
      select
        request.id,
        request.receipt_number as "receiptNumber",
        request.status,
        request.requested_title as "requestedTitle",
        request.requested_detail as "requestedDetail",
        request.intended_use as "intendedUse",
        request.information_period as "informationPeriod",
        request.requested_format as "requestedFormat",
        request.delivery_method as "deliveryMethod",
        request.submitted_at as "submittedAt",
        request.updated_at as "updatedAt",
        applicant.full_name as "fullName",
        applicant.applicant_type as "applicantType",
        applicant.applicant_type_other as "applicantTypeOther",
        applicant.address,
        applicant.whatsapp_number as "whatsappNumber",
        applicant.email,
        coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', attachment.id,
            'kind', attachment.attachment_kind,
            'originalFilename', attachment.original_filename,
            'contentType', attachment.content_type,
            'byteSize', attachment.byte_size,
            'scanState', attachment.scan_state,
            'createdAt', attachment.created_at
          ) order by attachment.created_at)
          from ppid.request_attachments attachment
          where attachment.information_request_id = request.id
        ), '[]'::jsonb) as attachments,
        coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', event.id,
            'type', event.event_type,
            'summary', event.event_summary,
            'actorName', actor_user.name,
            'createdAt', event.created_at
          ) order by event.created_at desc)
          from ppid.request_events event
          left join public."user" actor_user on actor_user.id = event.actor_user_id
          where event.information_request_id = request.id
        ), '[]'::jsonb) as events
      from ppid.information_requests request
      join ppid.request_applicants applicant
        on applicant.information_request_id = request.id
      order by request.submitted_at desc
      limit 200
    `)

  return {
    access: 'granted',
    actor: { displayName: actor.displayName, roles: actor.roles },
    canUpdate: canUpdateRequests(actor),
    requests: rows.map((row) => ({
      id: row.id,
      receiptNumber: row.receiptNumber,
      status: row.status,
      requestedTitle: row.requestedTitle,
      requestedDetail: row.requestedDetail,
      intendedUse: row.intendedUse,
      informationPeriod: row.informationPeriod,
      requestedFormat: row.requestedFormat,
      deliveryMethod: row.deliveryMethod,
      submittedAt: row.submittedAt,
      updatedAt: row.updatedAt,
      applicant: {
        fullName: row.fullName,
        applicantType: row.applicantType,
        applicantTypeOther: row.applicantTypeOther,
        address: row.address,
        whatsappNumber: row.whatsappNumber,
        email: row.email,
      },
      attachments: row.attachments,
      events: row.events,
    })),
  }
})

export const updateInformationRequestStatus = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const data = input as { id?: unknown; status?: unknown }
    const id = String(data?.id ?? '').trim()
    const status = String(data?.status ?? '') as RequestStatus
    if (!id || !requestStatuses.includes(status))
      throw new Error('Status permohonan tidak valid.')
    return { id, status }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canUpdateRequests(actor))
      throw new Error('Anda tidak berwenang mengubah status permohonan.')

    await withTransaction(async (client) => {
      const current = await client.query<{ status: RequestStatus }>(
        `select status from ppid.information_requests where id = $1 for update`,
        [data.id],
      )
      const previousStatus = current.rows[0]?.status
      if (!previousStatus) throw new Error('Permohonan tidak ditemukan.')
      if (previousStatus === data.status) return

      await client.query(
        `update ppid.information_requests
         set status = $2, updated_at = now()
         where id = $1`,
        [data.id, data.status],
      )
      const summary = JSON.stringify({ from: previousStatus, to: data.status })
      await client.query(
        `insert into ppid.request_events
          (information_request_id, actor_user_id, event_type, event_summary)
         values ($1, $2, 'status_changed', $3::jsonb)`,
        [data.id, actor.userId, summary],
      )
      await client.query(
        `insert into ppid.audit_logs
          (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'information_request.status_changed', 'information_request', $2, $3::jsonb)`,
        [actor.userId, data.id, summary],
      )
    })

    return { ok: true }
  })
