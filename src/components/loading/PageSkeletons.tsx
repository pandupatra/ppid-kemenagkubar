import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminShell } from '@/components/admin/AdminShell'
import { PublicShell } from '@/components/public/PublicShell'

function LoadingRegion({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only" role="status">
        Memuat halaman
      </span>
      {children}
    </div>
  )
}

function PublicHeroSkeleton() {
  return (
    <section className="page-hero">
      <div className="page-container page-hero-content">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-5 w-4/5 max-w-xl" />
        </div>
      </div>
    </section>
  )
}

function DocumentRowsSkeleton({ count = 5 }: Readonly<{ count?: number }>) {
  return (
    <div className="document-list" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="simple-row" key={index}>
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-4 w-2/5" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function PublicCatalogSkeleton() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <LoadingRegion>
          <PublicHeroSkeleton />
          <section className="section page-container">
            <Skeleton className="mb-5 h-10 w-full max-w-xl" />
            <DocumentRowsSkeleton />
          </section>
        </LoadingRegion>
      </main>
    </PublicShell>
  )
}

export function HomePageSkeleton() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <LoadingRegion>
          <section className="home-search-hero">
            <div className="page-container home-search-layout">
              <div className="home-search-intro w-full space-y-4">
                <Skeleton className="h-12 w-full max-w-xl" />
                <Skeleton className="h-5 w-full max-w-2xl" />
                <Skeleton className="h-5 w-4/5 max-w-xl" />
              </div>
              <div className="home-search-actions w-full space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </section>
          <section className="section page-container">
            <div className="mb-6 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-full max-w-2xl" />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="space-y-3" key={index}>
                  <Skeleton className="h-44 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </section>
        </LoadingRegion>
      </main>
    </PublicShell>
  )
}

export function DipPageSkeleton() {
  return <PublicCatalogSkeleton />
}

export function DocumentReportsPageSkeleton() {
  return <PublicCatalogSkeleton />
}

export function ServiceStandardsPageSkeleton() {
  return <PublicCatalogSkeleton />
}

export function InformationServicesPageSkeleton() {
  return <PublicCatalogSkeleton />
}

export function InformationDetailPageSkeleton() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <LoadingRegion>
          <section className="page-hero document-detail-hero">
            <div className="page-container document-detail-hero-content">
              <div className="w-full max-w-3xl space-y-4">
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </section>
          <section className="section page-container max-w-4xl space-y-4">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </section>
        </LoadingRegion>
      </main>
    </PublicShell>
  )
}

export function ServiceCharterPageSkeleton() {
  return (
    <PublicShell>
      <main id="isi-utama" className="maklumat-page">
        <LoadingRegion>
          <section className="section page-container">
            <header className="maklumat-heading space-y-3">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-full max-w-2xl" />
            </header>
            <Skeleton className="mx-auto mt-8 aspect-[0.707] w-full max-w-2xl" />
          </section>
        </LoadingRegion>
      </main>
    </PublicShell>
  )
}

export function MinistryProfilePageSkeleton() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <LoadingRegion>
          <PublicHeroSkeleton />
          <section className="section page-container grid gap-10 lg:grid-cols-[16rem_1fr]">
            <aside className="space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton className="h-9 w-full" key={index} />
              ))}
            </aside>
            <div className="space-y-8">
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="aspect-[16/9] w-full" />
              <DocumentRowsSkeleton count={4} />
            </div>
          </section>
        </LoadingRegion>
      </main>
    </PublicShell>
  )
}

function AdminFrameSkeleton({
  activePath,
  children,
}: Readonly<{ activePath: string; children: ReactNode }>) {
  return (
    <AdminShell activePath={activePath}>
      <span className="sr-only" role="status">
        Memuat halaman administrasi
      </span>
      <div aria-busy="true" aria-live="polite">
        {children}
      </div>
    </AdminShell>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <AdminFrameSkeleton activePath="/admin">
      <main className="admin-content space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-32 w-full" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-72 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </main>
    </AdminFrameSkeleton>
  )
}

export function AdminManagerSkeleton({
  activePath,
}: Readonly<{ activePath: string }>) {
  return (
    <AdminFrameSkeleton activePath={activePath}>
      <main className="admin-content space-y-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-11 w-full max-w-xl" />
        <Skeleton className="h-96 w-full" />
      </main>
    </AdminFrameSkeleton>
  )
}
