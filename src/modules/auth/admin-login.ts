import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/start-server-core/request-response'
import { getAdminActorForUserId } from '@/modules/auth/admin-access'

type SignInResult = { ok: true } | { ok: false; message: string }
type Credentials = { email: string; password: string }

const sessionCookieNames = new Set([
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
  ...String(process.env.AUTH_SESSION_COOKIE_NAME ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean),
])

function getAuthEndpoint() {
  const configuredOrigin = process.env.KEMENAG_AUTH_ORIGIN
  if (!configuredOrigin) return null

  try {
    const origin = new URL(configuredOrigin)
    if (origin.protocol !== 'https:' && origin.protocol !== 'http:') return null
    if (origin.username || origin.password) return null
    return new URL('/api/auth/sign-in/email', origin).toString()
  } catch {
    return null
  }
}

function getCookie(header: string) {
  const match = /^([^=;\s]+)=([^;]*)/.exec(header.trim())
  if (!match || !sessionCookieNames.has(match[1])) return null
  return { name: match[1], value: match[2] }
}

function getSetCookies(headers: Headers) {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie
  if (getSetCookie) return getSetCookie.call(headers)

  const header = headers.get('set-cookie')
  return header ? [header] : []
}

function validateCredentials(input: unknown): Credentials {
  if (!input || typeof input !== 'object') {
    throw new Error('Data masuk tidak valid.')
  }
  const { email, password } = input as {
    email?: unknown
    password?: unknown
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Data masuk tidak valid.')
  }
  return { email, password }
}

export const signInAdmin = createServerFn({ method: 'POST' })
  .validator(validateCredentials)
  .handler(async ({ data }): Promise<SignInResult> => {
    const email = data.email.trim()
    const password = data.password
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password) {
      return { ok: false, message: 'Masukkan email dan password yang valid.' }
    }

    const endpoint = getAuthEndpoint()
    if (!endpoint) {
      return {
        ok: false,
        message:
          'Layanan masuk belum dikonfigurasi. Hubungi administrator PPID.',
      }
    }

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: new URL(endpoint).origin,
        },
        body: JSON.stringify({ email, password }),
        redirect: 'manual',
      })
    } catch {
      return {
        ok: false,
        message: 'Layanan masuk sedang tidak dapat dihubungi. Coba lagi nanti.',
      }
    }

    if (!response.ok) {
      return { ok: false, message: 'Email atau password tidak tepat.' }
    }

    const payload = (await response.json().catch(() => null)) as {
      user?: { id?: unknown }
    } | null
    const userId = payload?.user?.id
    if (typeof userId !== 'string') {
      return {
        ok: false,
        message: 'Respons layanan masuk tidak dapat diproses.',
      }
    }

    const actor = await getAdminActorForUserId(userId)
    if (!actor) {
      return {
        ok: false,
        message: 'Akun ini belum memiliki penugasan aktif sebagai staf PPID.',
      }
    }

    const sessionCookie = getSetCookies(response.headers)
      .map(getCookie)
      .find((cookie) => cookie !== null)
    if (!sessionCookie) {
      return { ok: false, message: 'Sesi masuk tidak dapat dibuat. Coba lagi.' }
    }

    setCookie(sessionCookie.name, sessionCookie.value, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return { ok: true }
  })

export const signOutAdmin = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { deleteCookie } =
      await import('@tanstack/start-server-core/request-response')
    for (const name of sessionCookieNames) {
      deleteCookie(name, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
    return { ok: true }
  },
)
