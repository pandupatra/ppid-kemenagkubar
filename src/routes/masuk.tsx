import { createFileRoute } from '@tanstack/react-router'
import { AdminSignInForm } from '@/components/auth/AdminSignInForm'

export const Route = createFileRoute('/masuk')({ component: SignInPage })

function SignInPage() {
  return (
    <main className="admin-login-page">
      <section
        className="admin-login-panel"
        aria-labelledby="admin-login-title"
      >
        <a className="admin-login-brand" href="/">
          PPID Kemenag Kutai Barat
        </a>
        <p className="admin-eyebrow">Akses staf</p>
        <h1 id="admin-login-title">Masuk ke administrasi PPID</h1>
        <p>
          Gunakan akun Kemenag Kutai Barat yang telah diberi penugasan aktif
          sebagai staf PPID.
        </p>
        <AdminSignInForm />
        <a className="admin-login-back" href="/">
          Kembali ke portal publik
        </a>
      </section>
    </main>
  )
}
