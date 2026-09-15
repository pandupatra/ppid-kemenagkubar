import { FormEvent, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { trackPublicInformationRequest } from '@/modules/information-requests/public-requests'

export const Route = createFileRoute('/layanan-informasi/lacak')({
  component: TrackPage,
})

function TrackPage() {
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const receiptNumber = String(
      new FormData(event.currentTarget).get('receiptNumber') ?? '',
    )
    setSubmitting(true)
    try {
      const request = await trackPublicInformationRequest({
        data: { receiptNumber },
      })
      if (!request) {
        toast({
          description: 'Periksa kembali nomor tanda terima yang dimasukkan.',
          title: 'Nomor tanda terima tidak ditemukan',
          variant: 'destructive',
        })
        return
      }
      toast({
        description: (
          <>
            Nomor tanda terima: <strong>{request.receiptNumber}</strong>
            <br />
            Diterima pada:{' '}
            {new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'long',
              timeZone: 'Asia/Makassar',
            }).format(new Date(request.submittedAt))}
          </>
        ),
        title: request.status,
        variant: 'success',
      })
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : 'Status belum dapat dimuat. Coba lagi beberapa saat lagi.',
        title: 'Status belum dapat dimuat',
        variant: 'destructive',
      })
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
              autoCapitalize="characters"
              autoComplete="off"
              id="receipt-number"
              name="receiptNumber"
              placeholder="PPID-2026-…"
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Memuat status…' : 'Lacak permohonan'}
          </Button>
        </form>
      </section>
    </PublicPage>
  )
}
