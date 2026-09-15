import { Button } from '@/components/ui/button'
import { ToastOnMount } from '@/components/ui/ToastOnMount'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../../components/public/PublicPage'
import { PublicShell } from '../../../components/public/PublicShell'
import { Download, ChevronRight } from 'lucide-react'
import {
  categoryLabel,
  getPublicDipItem,
  type DisclosureCategory,
} from '../../../modules/documents/public-dip'

const categories: Record<string, DisclosureCategory> = {
  berkala: 'periodic',
  'setiap-saat': 'available_anytime',
  'serta-merta': 'immediate',
  dikecualikan: 'excluded',
}

export const Route = createFileRoute('/informasi-publik/$category/$slug')({
  loader: ({ params }) => {
    const category = categories[params.category]
    return category
      ? getPublicDipItem({ data: { category, slug: params.slug } })
      : null
  },
  component: InformationDetailPage,
})

function InformationDetailPage() {
  const item = Route.useLoaderData()
  const { category } = Route.useParams()
  if (!item)
    return (
      <PublicPage
        eyebrow="Informasi publik"
        title="Informasi tidak ditemukan"
        lead="Informasi yang Anda cari tidak tersedia atau belum diterbitkan."
      >
        <section className="section page-container">
          <Button asChild className="-secondary">
            <a href="/informasi-publik">Kembali ke informasi publik</a>
          </Button>
        </section>
      </PublicPage>
    )

  const pdfUrl =
    item.public_storage_path && import.meta.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${import.meta.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ppid-public-documents/${item.public_storage_path.split('/').map(encodeURIComponent).join('/')}`
      : null
  const publicationDate = item.published_at
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeZone: 'Asia/Makassar',
      }).format(new Date(item.published_at))
    : null

  return (
    <PublicShell>
      <main id="isi-utama">
        <section className="page-hero document-detail-hero">
          <nav
            className="document-breadcrumb document-detail-breadcrumb"
            aria-label="Breadcrumb"
          >
            <div className="page-container">
              <a href="/">Beranda</a>
              <ChevronRight aria-hidden="true" />
              <a href="/informasi-publik">Informasi Publik</a>
              <ChevronRight aria-hidden="true" />
              <a href={`/informasi-publik/?category=${category}`}>
                {categoryLabel[item.disclosure_category]}
              </a>
              <ChevronRight aria-hidden="true" />
              <span aria-current="page">{item.official_title}</span>
            </div>
          </nav>
          <div className="page-container document-detail-hero-content">
            <div className="document-detail-hero-copy">
              <h1>{item.official_title}</h1>
              {publicationDate ? (
                <p className="document-publication-date">
                  Dipublikasikan pada {publicationDate}
                </p>
              ) : null}
            </div>
            {pdfUrl ? (
              <Button asChild variant="secondary" className="document-download">
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  <Download aria-hidden="true" />
                  Unduh PDF
                </a>
              </Button>
            ) : null}
          </div>
        </section>
        <section className="section page-container">
          {item.disclosure_category === 'excluded' ? (
            <ToastOnMount
              input={{
                description:
                  'Materi ini tidak dapat diberikan kepada publik sesuai klasifikasi atau hasil uji konsekuensi yang berlaku.',
                title: 'Informasi dikecualikan',
                variant: 'default',
              }}
            />
          ) : pdfUrl ? (
            <>
              {item.description ? (
                <section
                  className="document-description"
                  aria-labelledby="document-description-title"
                >
                  <h2 id="document-description-title">Deskripsi dokumen</h2>
                  <p>{item.description}</p>
                </section>
              ) : null}
              <object
                className="pdf-viewer"
                data={pdfUrl}
                type="application/pdf"
              >
                <a href={pdfUrl}>Unduh PDF</a>
              </object>
            </>
          ) : (
            <ToastOnMount
              input={{
                description:
                  'Dokumen publik untuk informasi ini belum diterbitkan.',
                title: 'PDF belum tersedia',
                variant: 'default',
              }}
            />
          )}
        </section>
      </main>
    </PublicShell>
  )
}
