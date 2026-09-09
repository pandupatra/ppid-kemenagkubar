import { queryRows } from '@/server/db/postgres'

export type StaffRole =
  | 'content_editor'
  | 'ppid_officer'
  | 'reviewer'
  | 'ppid_supervisor'
  | 'administrator'
  | 'auditor'

export type AdminActor = {
  displayName: string
  roles: StaffRole[]
  userId: string
}

const defaultSessionCookieNames = [
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
]

async function getSessionToken() {
  const { getCookies } =
    await import('@tanstack/start-server-core/request-response')
  const cookies = getCookies()
  const configuredNames = (process.env.AUTH_SESSION_COOKIE_NAME ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  const cookieNames = [...configuredNames, ...defaultSessionCookieNames]
  const signedToken = cookieNames.map((name) => cookies[name]).find(Boolean)
  if (!signedToken) return null

  // Better Auth stores the database token followed by its cookie signature.
  // PPID never validates credentials itself; it only uses the token portion
  // to resolve the server-side session record that Better Auth created.
  return signedToken.split('.', 1)[0] || null
}

export async function getAdminActor(): Promise<AdminActor | null> {
  const token = await getSessionToken()
  if (!token) return null

  const rows = await queryRows<{
    display_name: string
    role: StaffRole
    user_id: string
  }>(
    `select u.id as user_id, u.name as display_name, membership.role
     from public.session session
     join public."user" u on u.id = session."userId"
     join ppid.staff_memberships membership on membership.user_id = u.id
     where session.token = $1
       and session."expiresAt" > now()
       and membership.is_active = true
     order by membership.role`,
    [token],
  )

  if (rows.length === 0) return null
  return {
    userId: rows[0].user_id,
    displayName: rows[0].display_name,
    roles: [...new Set(rows.map((row) => row.role))],
  }
}

export async function getAdminActorForUserId(
  userId: string,
): Promise<AdminActor | null> {
  const rows = await queryRows<{
    display_name: string
    role: StaffRole
    user_id: string
  }>(
    `select u.id as user_id, u.name as display_name, membership.role
     from public."user" u
     join ppid.staff_memberships membership on membership.user_id = u.id
     where u.id = $1 and membership.is_active = true
     order by membership.role`,
    [userId],
  )

  if (rows.length === 0) return null
  return {
    userId: rows[0].user_id,
    displayName: rows[0].display_name,
    roles: [...new Set(rows.map((row) => row.role))],
  }
}

export function canReadContent(actor: AdminActor) {
  return actor.roles.some((role) =>
    [
      'content_editor',
      'reviewer',
      'ppid_supervisor',
      'administrator',
      'auditor',
    ].includes(role),
  )
}
