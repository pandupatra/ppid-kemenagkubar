import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { PublicPage } from '@/components/public/PublicPage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DocumentReport } from '@/modules/documents/document-reports'

export function DocumentReportsPage({
  documents,
}: Readonly<{ documents: DocumentReport[] }>) {
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID')
    if (!term) return documents
    return documents.filter((document) =>
      document.title.toLocaleLowerCase('id-ID').includes(term),
    )
  }, [documents, query])

  function searchDocuments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(searchInput)
  }

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
        <form
          className="mb-5 flex max-w-2xl flex-col gap-3 sm:flex-row"
          onSubmit={searchDocuments}
          role="search"
        >
          <label className="relative block flex-1">
            <span className="sr-only">Cari dokumen dan laporan</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-10"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari dokumen atau laporan"
              type="search"
              value={searchInput}
            />
          </label>
          <Button type="submit">
            <Search aria-hidden="true" /> Cari
          </Button>
        </form>
        <div className="document-list">
          {filteredDocuments.map((document) => (
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
        {filteredDocuments.length === 0 ? (
          <p className="mt-5 text-muted-foreground" role="status">
            {documents.length === 0
              ? 'Dokumen dan laporan sedang diperbarui oleh PPID.'
              : 'Tidak ada dokumen atau laporan yang sesuai dengan pencarian.'}
          </p>
        ) : null}
      </section>
    </PublicPage>
  )
}
