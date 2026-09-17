import { createServerFn } from '@tanstack/react-start'
import { getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'
import {
  requestStatuses,
  type RequestStatus,
} from '@/modules/information-requests/admin-requests'

export type AdminInformationObjection = {
  id: string
  receiptNumber: string
  status: RequestStatus
  fullName: string
  address: string
  whatsappNumber: string
  email: string | null
  applicantStatus: string
  requestDate: string
  requestedInformation: string
  requestChannel: string
  objectionReasons: string[]
  otherReason: string | null
  objectionDetail: string
  expectedResponse: string
  attachmentName: string
  attachmentContentType: string
  attachmentByteSize: number
  submittedAt: string
  updatedAt: string
  history: Array<{
    id: string
    actorName: string | null
    summary: { from?: string; to?: string }
    createdAt: string
  }>
}

export type AdminInformationObjectionsData =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      canUpdate: boolean
      objections: AdminInformationObjection[]
    }

function canRead(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['ppid_officer', 'ppid_supervisor', 'administrator', 'auditor'].includes(
      role,
    ),
  )
}

function canUpdate(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.some((role) =>
    ['ppid_officer', 'ppid_supervisor', 'administrator'].includes(role),
  )
}

export const getAdminInformationObjections = createServerFn({
  method: 'GET',
}).handler(async (): Promise<AdminInformationObjectionsData> => {
  const actor = await getAdminActor()
  if (!actor || !canRead(actor)) return { access: 'denied' }

  const objections = await queryRows<AdminInformationObjection>(`
      select
        objection.id,
        objection.receipt_number as "receiptNumber",
        objection.status,
        objection.full_name as "fullName",
        objection.address,
        objection.whatsapp_number as "whatsappNumber",
        objection.email,
        objection.applicant_status as "applicantStatus",
        objection.request_date as "requestDate",
        objection.requested_information as "requestedInformation",
        objection.request_channel as "requestChannel",
        objection.objection_reasons as "objectionReasons",
        objection.other_reason as "otherReason",
        objection.objection_detail as "objectionDetail",
        objection.expected_response as "expectedResponse",
        objection.attachment_name as "attachmentName",
        objection.attachment_content_type as "attachmentContentType",
        objection.attachment_byte_size as "attachmentByteSize",
        objection.submitted_at as "submittedAt",
        objection.updated_at as "updatedAt",
        coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', audit.id,
            'actorName', actor_user.name,
            'summary', audit.change_summary,
            'createdAt', audit.created_at
          ) order by audit.created_at desc)
          from ppid.audit_logs audit
          left join public."user" actor_user on actor_user.id = audit.actor_user_id
          where audit.resource_type = 'information_objection'
            and audit.resource_id = objection.id::text
        ), '[]'::jsonb) as history
      from ppid.information_objections objection
      order by objection.submitted_at desc
      limit 200
    `)

  return {
    access: 'granted',
    actor: { displayName: actor.displayName, roles: actor.roles },
    canUpdate: canUpdate(actor),
    objections,
  }
})

export const updateInformationObjectionStatus = createServerFn({
  method: 'POST',
})
  .validator((input: unknown) => {
    const data = input as { id?: unknown; status?: unknown }
    const id = String(data?.id ?? '').trim()
    const status = String(data?.status ?? '') as RequestStatus
    if (!id || !requestStatuses.includes(status))
      throw new Error('Status keberatan tidak valid.')
    return { id, status }
  })
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canUpdate(actor))
      throw new Error('Anda tidak berwenang mengubah status keberatan.')

    await withTransaction(async (client) => {
      const current = await client.query<{ status: RequestStatus }>(
        `select status from ppid.information_objections where id = $1 for update`,
        [data.id],
      )
      const previousStatus = current.rows[0]?.status
      if (!previousStatus)
        throw new Error('Pengajuan keberatan tidak ditemukan.')
      if (previousStatus === data.status) return

      await client.query(
        `update ppid.information_objections
         set status = $2, updated_at = now()
         where id = $1`,
        [data.id, data.status],
      )
      await client.query(
        `insert into ppid.audit_logs
          (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'information_objection.status_changed', 'information_objection', $2, $3::jsonb)`,
        [
          actor.userId,
          data.id,
          JSON.stringify({ from: previousStatus, to: data.status }),
        ],
      )
    })

    return { ok: true }
  })
