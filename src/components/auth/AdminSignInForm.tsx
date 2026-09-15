import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { signInAdmin } from '@/modules/auth/admin-login'

export function AdminSignInForm() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    setSubmitting(true)
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
      toast({
        title: 'Masuk tidak berhasil',
        description: result.message,
        variant: 'destructive',
      })
    } catch {
      toast({
        title: 'Masuk tidak berhasil',
        description: 'Coba lagi beberapa saat lagi.',
        variant: 'destructive',
      })
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
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Memeriksa akun…' : 'Masuk ke administrasi'}
      </Button>
    </form>
  )
}
