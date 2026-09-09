import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormEvent, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'
import { trackPublicInformationRequest } from '@/modules/information-requests/public-requests'

export const Route = createFileRoute('/layanan-informasi/lacak')({
  component: TrackPage,
})

function TrackPage() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{
    receiptNumber: string
    status: string
    submittedAt: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const receiptNumber = String(
      new FormData(event.currentTarget).get('receiptNumber') ?? '',
    )
    setSubmitting(true)
    setMessage('')
    setResult(null)
    try {
      const request = await trackPublicInformationRequest({
        data: { receiptNumber },
      })
      if (!request) {
        setMessage('Nomor tanda terima tidak ditemukan.')
        return
      }
      setResult(request)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Status belum dapat dimuat. Coba lagi beberapa saat lagi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicPage
      eyebrow="Lacak permohonan"
      title="Lacak status permohonan Anda"
      lead="Masukkan nomor tanda terima yang Anda peroleh setelah mengirim formulir."
    >
      <section className="section page-container form-layout">
        <form className="request-form" onSubmit={track}>
          <div>
            <Label htmlFor="receipt-number">Nomor tanda terima</Label>
            <Input
              id="receipt-number"
              name="receiptNumber"
              placeholder="PPID-2026-…"
              required
              autoCapitalize="characters"
              autoComplete="off"
            />
          </div>
          {message ? (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          {result ? (
            <Alert variant="success" role="status">
              <AlertTitle>{result.status}</AlertTitle>
              <AlertDescription>
                Nomor tanda terima: <strong>{result.receiptNumber}</strong>
                <br />
                Diterima pada:{' '}
                {new Intl.DateTimeFormat('id-ID', {
                  dateStyle: 'long',
                  timeZone: 'Asia/Makassar',
                }).format(new Date(result.submittedAt))}
              </AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Memuat status…' : 'Lacak permohonan'}
          </Button>
        </form>
      </section>
    </PublicPage>
  )
}
