import { type FormEvent, useState } from 'react'
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Clock3,
  Search,
} from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  trackPublicInformationRequest,
  type PublicTrackingResult,
} from '@/modules/information-requests/public-requests'

export const Route = createFileRoute('/layanan-informasi/lacak')({
  component: TrackPage,
})

const terminalStatuses = new Set([
  'fulfilled',
  'partially_fulfilled',
  'rejected',
  'withdrawn',
  'closed',
])

function formatWita(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  }).format(new Date(value))
}

function TrackPage() {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PublicTrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const receiptNumber = String(
      new FormData(event.currentTarget).get('receiptNumber') ?? '',
    )
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const request = await trackPublicInformationRequest({
        data: { receiptNumber },
      })
      if (!request) {
        setError(
          'Nomor tanda terima tidak ditemukan. Periksa kembali nomor yang Anda masukkan.',
        )
        return
      }
      setResult(request)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Status belum dapat dimuat. Coba lagi beberapa saat lagi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicPage
      title="Lacak Permohonan"
      lead="Masukkan nomor tanda terima untuk melihat status terkini dan riwayat proses permohonan informasi."
    >
      <section className="section page-container tracking-layout">
        <form className="tracking-search" onSubmit={track}>
          <div className="tracking-search-copy">
            <span className="tracking-search-icon" aria-hidden="true">
              <Search size={20} />
            </span>
            <div>
              <h2>Lacak dengan nomor tanda terima</h2>
            </div>
          </div>
          <div className="tracking-search-fields">
            <div>
              <Label htmlFor="receipt-number">Nomor tanda terima</Label>
              <Input
                autoCapitalize="characters"
                autoComplete="off"
                id="receipt-number"
                name="receiptNumber"
                pattern="PPID-[0-9]{4}-[A-Fa-f0-9]{24}"
                placeholder="PPID-2026-XXXXXXXXXXXXXXXXXXXXXXXX"
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Mencari…' : 'Lacak permohonan'}
            </Button>
          </div>
        </form>

        <div aria-live="polite">
          {error ? (
            <div className="tracking-feedback is-error" role="alert">
              <AlertCircle size={20} aria-hidden="true" />
              <div>
                <strong>Status belum ditemukan</strong>
                <p>{error}</p>
              </div>
            </div>
          ) : result ? (
            <TrackingResult result={result} />
          ) : (
            <div className="tracking-empty">
              <ClipboardCheck size={32} aria-hidden="true" />
              <h2>Status permohonan akan tampil di sini</h2>
              <p>
                Masukkan nomor tanda terima di atas untuk melihat tahap yang
                sudah dilalui.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  )
}

function TrackingResult({
  result,
}: Readonly<{ result: PublicTrackingResult }>) {
  const isComplete = terminalStatuses.has(result.statusCode)
  const events = [...result.events].reverse()

  return (
    <article className="tracking-result">
      <header className="tracking-result-header">
        <div>
          <span className="tracking-result-label">Status terkini</span>
          <h2>{result.status}</h2>
        </div>
        <span className={`tracking-state${isComplete ? ' is-complete' : ''}`}>
          {isComplete ? <Check size={16} /> : <Clock3 size={16} />}
          {isComplete ? 'Proses selesai' : 'Sedang diproses'}
        </span>
      </header>

      <dl className="tracking-receipt-summary">
        <div>
          <dt>Nomor tanda terima</dt>
          <dd>{result.receiptNumber}</dd>
        </div>
        <div>
          <dt>Permohonan diterima</dt>
          <dd>{formatWita(result.submittedAt)} WITA</dd>
        </div>
      </dl>

      <section
        className="tracking-history"
        aria-labelledby="tracking-history-title"
      >
        <div className="tracking-history-heading">
          <span>Riwayat proses</span>
          <h3 id="tracking-history-title">Perjalanan permohonan</h3>
        </div>
        <ol>
          {events.map((event, index) => (
            <li key={`${event.statusCode}-${event.occurredAt}-${index}`}>
              <span
                className={`tracking-timeline-marker${index === 0 ? ' is-current' : ''}`}
                aria-hidden="true"
              >
                {index === 0 ? <Check size={14} /> : null}
              </span>
              <div>
                <strong>{event.status}</strong>
                <time dateTime={event.occurredAt}>
                  {formatWita(event.occurredAt)} WITA
                </time>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="tracking-result-footer">
        Simpan nomor tanda terima ini. Pembaruan berikutnya akan muncul pada
        halaman yang sama.
      </footer>
    </article>
  )
}
