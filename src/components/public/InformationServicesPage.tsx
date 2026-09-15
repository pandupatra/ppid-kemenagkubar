import { useMemo, useState } from 'react'
import { ArrowRight, FileImage, FileText, Search } from 'lucide-react'
import { PublicPage } from '@/components/public/PublicPage'
import { Input } from '@/components/ui/input'
import type {
  InformationServiceDocument,
  InformationServiceKind,
} from '@/modules/documents/information-services'

const copy: Record<
  InformationServiceKind,
  { eyebrow: string; title: string; lead: string }
> = {
  procedure: {
    eyebrow: 'Layanan Informasi',
    title: 'Tata Cara Layanan',
    lead: 'Panduan dan alur untuk mengakses layanan informasi publik.',
  },
  announcement: {
    eyebrow: 'Layanan Informasi',
    title: 'Standar Pengumuman',
    lead: 'Standar penyampaian informasi publik oleh PPID Kemenag Kutai Barat.',
  },
}

export function InformationServicesPage({
  documents,
  kind,
}: Readonly<{
  documents: InformationServiceDocument[]
  kind: InformationServiceKind
}>) {
  const content = copy[kind]
  const [query, setQuery] = useState('')
  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID')
    if (!term) return documents
    return documents.filter((document) =>
      document.title.toLocaleLowerCase('id-ID').includes(term),
    )
  }, [documents, query])
  return (
    <PublicPage {...content}>
      <section className="section page-container" aria-label={content.title}>
        <label className="relative mb-5 block max-w-xl">
          <span className="sr-only">Cari {content.title}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari dokumen"
            type="search"
            value={query}
          />
        </label>
        <div className="document-list">
          {filteredDocuments.map((document) =>
            document.href ? (
              <a
                className="simple-row group text-foreground no-underline transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                href={document.href}
                key={document.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka dokumen di tab baru: ${document.title}`}
              >
                <div>
                  <h2>{document.title}</h2>
                  <p>Dokumen layanan informasi</p>
                </div>
                <ArrowRight
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            ) : (
              <div className="simple-row" key={document.id}>
                <div>
                  <h2>{document.title}</h2>
                  <p>Dokumen sedang diperbarui oleh PPID.</p>
                </div>
                {document.contentType === 'image/png' ? (
                  <FileImage
                    className="mt-1 size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : (
                  <FileText
                    className="mt-1 size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            ),
          )}
        </div>
        {filteredDocuments.length === 0 ? (
          <p className="mt-5 text-muted-foreground">
            Tidak ada dokumen yang sesuai dengan pencarian.
          </p>
        ) : null}
      </section>
    </PublicPage>
  )
}
