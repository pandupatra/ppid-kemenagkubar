import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInAdmin } from '@/modules/auth/admin-login'

export function AdminSignInForm() {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setMessage('')
    try {
      const result = await signInAdmin({
        data: {
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        },
      })
      if (result.ok) {
        window.location.assign('/admin')
        return
      }
      setMessage(result.message)
    } catch {
      setMessage('Masuk tidak berhasil. Coba lagi beberapa saat lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
      <div>
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {message ? (
        <p className="admin-login-error" role="alert">
          {message}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Memeriksa akun…' : 'Masuk ke administrasi'}
      </Button>
    </form>
  )
}
