import { useMemo, useState } from 'react'
import { ArrowRight, FileText, Search } from 'lucide-react'
import { PublicPage } from '@/components/public/PublicPage'
import { Input } from '@/components/ui/input'
import type {
  ServiceStandardDocument,
  ServiceStandardKind,
} from '@/modules/documents/service-standards'

const copy: Record<
  ServiceStandardKind,
  { eyebrow: string; title: string; lead: string }
> = {
  sop: {
    eyebrow: 'Standar Layanan',
    title: 'Standar Operasional Prosedur',
    lead: 'Daftar SOP pelayanan informasi publik Kementerian Agama Kabupaten Kutai Barat.',
  },
  policy: {
    eyebrow: 'Standar Layanan',
    title: 'Kebijakan layanan',
    lead: 'Kebijakan yang menjadi pedoman pelaksanaan layanan informasi publik.',
  },
}

export function ServiceStandardsPage({
  documents,
  kind,
}: Readonly<{
  documents: ServiceStandardDocument[]
  kind: ServiceStandardKind
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
                aria-label={`Buka PDF di tab baru: ${document.title}`}
              >
                <div>
                  <h2>{document.title}</h2>
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
                <FileText
                  className="mt-1 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
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
