import { ArrowRight } from 'lucide-react'
import { PublicPage } from '@/components/public/PublicPage'
import type { DocumentReport } from '@/modules/documents/document-reports'

export function DocumentReportsPage({
  documents,
}: Readonly<{ documents: DocumentReport[] }>) {
  return (
    <PublicPage
      eyebrow="Informasi publik"
      title="Dokumen & Laporan"
      lead="Dokumen perencanaan, anggaran, kinerja, dan laporan informasi publik Kantor Kementerian Agama Kabupaten Kutai Barat."
    >
      <section
        className="section page-container"
        aria-label="Daftar dokumen dan laporan"
      >
        <div className="document-list">
          {documents.map((document) => (
            <a
              className="simple-row group text-foreground no-underline transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href={document.href ?? '#'}
              key={document.id}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buka PDF di tab baru: ${document.title}`}
            >
              <h2>{document.title}</h2>
              <ArrowRight
                className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">
            Dokumen dan laporan sedang diperbarui oleh PPID.
          </p>
        ) : null}
      </section>
    </PublicPage>
  )
}
