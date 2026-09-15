import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import logoKemenag from '../../../logo-kemenag.png'
import { PublicShell } from './PublicShell'
import { Button } from '@/components/ui/button'
import { ToastOnMount } from '@/components/ui/ToastOnMount'

export function PublicPage({
  children,
  eyebrow,
  heroAside,
  lead,
  title,
}: Readonly<{
  children: ReactNode
  eyebrow?: string
  heroAside?: ReactNode
  lead: string
  title: string
}>) {
  return (
    <PublicShell>
      <main id="isi-utama">
        <section className="page-hero">
          <div className="page-container page-hero-content">
            <div>
              {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
              <h1>{title}</h1>
              <p className="lead">{lead}</p>
            </div>
            {heroAside}
          </div>
        </section>
        {children}
      </main>
    </PublicShell>
  )
}

export function PublicPending() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <section
          className="public-loading page-container"
          aria-busy="true"
          aria-label="Memuat informasi"
          role="status"
        >
          <div className="public-loading-mark" aria-hidden="true">
            <span className="public-loading-orbit" />
            <img src={logoKemenag} alt="" />
          </div>
          <div className="public-loading-copy">
            <strong>Memuat informasi</strong>
            <span>Mohon tunggu sebentar.</span>
          </div>
        </section>
      </main>
    </PublicShell>
  )
}

export function PublicError() {
  const router = useRouter()
  return (
    <PublicPage
      eyebrow="Layanan informasi"
      title="Informasi belum dapat dimuat"
      lead="Silakan coba kembali dalam beberapa saat."
    >
      <section className="section page-container">
        <ToastOnMount
          input={{
            description: 'Periksa koneksi Anda, lalu coba lagi.',
            title: 'Terjadi kendala saat memuat informasi',
            variant: 'destructive',
          }}
        />
        <Button onClick={() => void router.invalidate()}>Coba lagi</Button>
      </section>
    </PublicPage>
  )
}

export function PublicNotFound() {
  return (
    <PublicPage
      eyebrow="Layanan informasi"
      title="Halaman tidak ditemukan"
      lead="Halaman yang Anda cari tidak tersedia."
    >
      <section className="section page-container">
        <Button asChild variant="outline">
          <a href="/">Kembali ke beranda</a>
        </Button>
      </section>
    </PublicPage>
  )
}
