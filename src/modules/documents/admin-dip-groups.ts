import { createServerFn } from '@tanstack/react-start'
import { getAdminActor } from '@/modules/auth/admin-access'
import { queryRows, withTransaction } from '@/server/db/postgres'

export type AdminDipGroup = {
  code: string
  id: string
  itemCount: number
  title: string
}

export type AdminDipGroupsData =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      groups: AdminDipGroup[]
    }

function canManageDipGroups(
  actor: NonNullable<Awaited<ReturnType<typeof getAdminActor>>>,
) {
  return actor.roles.includes('administrator')
}

function validateGroup(data: unknown) {
  if (!(data instanceof FormData))
    throw new Error('Data kategori DIP tidak valid.')
  const id = String(data.get('id') ?? '').trim()
  const code = String(data.get('code') ?? '')
    .trim()
    .toUpperCase()
  const title = String(data.get('title') ?? '').trim()
  if (!/^[A-Z][A-Z0-9_-]{0,11}$/.test(code))
    throw new Error('Kode kategori harus diawali huruf kapital.')
  if (!title) throw new Error('Nama kategori wajib diisi.')
  return { code, id, title }
}

export const getAdminDipGroups = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminDipGroupsData> => {
    const actor = await getAdminActor()
    if (!actor || !canManageDipGroups(actor)) return { access: 'denied' }
    const groups = await queryRows<AdminDipGroup>(
      `select dip_group.id, dip_group.code, dip_group.title,
        count(item.id)::integer as "itemCount"
       from ppid.dip_groups dip_group
       left join ppid.dip_items item on item.group_id = dip_group.id
         and item.publication_state <> 'archived'
       group by dip_group.id
       order by dip_group.display_order, dip_group.code`,
    )
    return {
      access: 'granted',
      actor: { displayName: actor.displayName, roles: actor.roles },
      groups,
    }
  },
)

export const createDipGroup = createServerFn({ method: 'POST' })
  .validator(validateGroup)
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDipGroups(actor))
      throw new Error('Anda tidak berwenang mengelola kategori DIP.')
    await withTransaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `insert into ppid.dip_groups (code, title, display_order)
         values ($1, $2, coalesce((select max(display_order) + 1 from ppid.dip_groups), 1))
         returning id`,
        [data.code, data.title],
      )
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'dip_group.created', 'dip_group', $2, $3::jsonb)`,
        [actor.userId, result.rows[0].id, JSON.stringify({ code: data.code })],
      )
    })
    return { ok: true }
  })

export const updateDipGroup = createServerFn({ method: 'POST' })
  .validator(validateGroup)
  .handler(async ({ data }) => {
    const actor = await getAdminActor()
    if (!actor || !canManageDipGroups(actor))
      throw new Error('Anda tidak berwenang mengelola kategori DIP.')
    if (!data.id) throw new Error('Kategori DIP tidak valid.')
    await withTransaction(async (client) => {
      const result = await client.query(
        `update ppid.dip_groups set code = $1, title = $2, updated_at = now()
         where id = $3`,
        [data.code, data.title, data.id],
      )
      if (result.rowCount !== 1)
        throw new Error('Kategori DIP tidak ditemukan.')
      await client.query(
        `update ppid.dip_items set thematic_group = $1, updated_at = now()
         where group_id = $2`,
        [data.code, data.id],
      )
      await client.query(
        `insert into ppid.audit_logs (actor_user_id, action, resource_type, resource_id, change_summary)
         values ($1, 'dip_group.updated', 'dip_group', $2, $3::jsonb)`,
        [actor.userId, data.id, JSON.stringify({ code: data.code })],
      )
    })
    return { ok: true }
  })
