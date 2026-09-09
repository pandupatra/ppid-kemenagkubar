import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { PublicShell } from './PublicShell'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function PublicPage({
  children,
  eyebrow,
  heroAside,
  lead,
  title,
}: Readonly<{
  children: ReactNode
  eyebrow: string
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
              <p className="page-eyebrow">{eyebrow}</p>
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
    <PublicPage
      eyebrow="Informasi publik"
      title="Memuat informasi"
      lead="Mohon tunggu sebentar."
    >
      <section
        className="section page-container space-y-4"
        aria-busy="true"
        aria-label="Memuat informasi"
      >
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </section>
    </PublicPage>
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
        <Alert>
          <AlertTitle>Terjadi kendala saat memuat informasi</AlertTitle>
          <AlertDescription>
            <p>Periksa koneksi Anda, lalu coba lagi.</p>
            <Button onClick={() => void router.invalidate()}>Coba lagi</Button>
          </AlertDescription>
        </Alert>
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
