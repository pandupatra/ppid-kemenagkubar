import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { submitPublicInformationObjection } from '@/modules/information-requests/public-requests'
import { createFileRoute } from '@tanstack/react-router'
import { FormEvent, useState } from 'react'
import { PublicPage } from '../../components/public/PublicPage'

export const Route = createFileRoute('/layanan-informasi/keberatan')({
  component: ObjectionPage,
})

const applicantStatusOptions = [
  ['individual', 'Perorangan'],
  ['legal_entity', 'Badan Hukum'],
  ['group_or_organization', 'Kelompok/Organisasi'],
  ['other', 'Lainnya'],
] as const
const requestChannelOptions = [
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp'],
  ['social_media', 'Media Sosial'],
  ['in_person', 'Datang Langsung'],
] as const
const objectionReasonOptions = [
  ['request_rejected', 'Penolakan atas permintaan informasi'],
  ['periodic_information_unavailable', 'Informasi berkala tidak tersedia'],
  ['no_response', 'Permintaan informasi tidak ditanggapi'],
  [
    'response_not_as_requested',
    'Permintaan informasi ditanggapi tidak sebagaimana yang diminta',
  ],
  ['late_response', 'Penyampaian informasi melebihi jangka waktu'],
  ['unreasonable_fee', 'Pengenaan biaya yang tidak wajar'],
  ['incomplete_information', 'Informasi yang diberikan tidak lengkap'],
  ['other', 'Yang lain'],
] as const

function ObjectionPage() {
  const [applicantStatus, setApplicantStatus] = useState('')
  const [requestChannel, setRequestChannel] = useState('')
  const [objectionReasons, setObjectionReasons] = useState<string[]>([])
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  function toggleReason(value: string, checked: boolean) {
    setObjectionReasons((current) =>
      checked
        ? [...current.filter((reason) => reason !== value), value]
        : current.filter((reason) => reason !== value),
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || receiptNumber) return
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    if (
      !applicantStatus ||
      !requestChannel ||
      objectionReasons.length === 0 ||
      !declarationAccepted
    ) {
      toast({
        description:
          'Lengkapi semua pilihan yang wajib diisi sebelum mengirim.',
        title: 'Formulir belum lengkap',
        variant: 'destructive',
      })
      return
    }
    const values = new FormData(form)
    values.set('applicantStatus', applicantStatus)
    values.set('requestChannel', requestChannel)
    objectionReasons.forEach((reason) =>
      values.append('objectionReasons', reason),
    )
    setSubmitting(true)
    try {
      const result = await submitPublicInformationObjection({ data: values })
      setReceiptNumber(result.receiptNumber)
      toast({
        description: (
          <>
            Simpan nomor registrasi ini untuk memantau proses penyelesaian:{' '}
            <strong>{result.receiptNumber}</strong>
          </>
        ),
        duration: 10_000,
        title: 'Keberatan berhasil dikirim',
        variant: 'success',
      })
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : 'Coba lagi beberapa saat lagi.',
        title: 'Keberatan belum dapat dikirim',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicPage
      eyebrow="Pengajuan keberatan"
      title="Formulir Pengajuan Keberatan Informasi Publik"
      lead="Sampaikan keberatan atas pelayanan atau tanggapan terhadap permintaan informasi publik."
    >
      <section className="section page-container form-layout">
        <div className="request-form mb-6">
          <p>
            Formulir Pengajuan Keberatan Informasi Publik merupakan sarana bagi
            masyarakat untuk menyampaikan keberatan secara online terhadap
            pelayanan atau tanggapan atas permintaan informasi publik pada PPID
            Kementerian Agama Kabupaten Kutai Barat.
          </p>
          <p>
            Pemohon dapat mengajukan keberatan apabila permintaan informasi
            ditolak, tidak ditanggapi, tidak dipenuhi sebagaimana yang diminta,
            melebihi jangka waktu, atau terdapat alasan lain sesuai dengan
            ketentuan yang berlaku.
          </p>
          <p>
            Silakan isi seluruh data dan uraian keberatan dengan benar, lengkap,
            dan jelas, serta lampirkan dokumen pendukung apabila diperlukan.
            Setelah formulir dikirim, pemohon akan memperoleh bukti/nomor
            registrasi pengajuan keberatan sebagai tanda bahwa pengajuan telah
            diterima dan dapat digunakan untuk memantau proses penyelesaiannya.
          </p>
          <p>
            <strong>Petunjuk:</strong> Silakan mengisi formulir berikut dengan
            data yang benar dan lengkap. Pengajuan keberatan dilakukan apabila
            pemohon tidak puas terhadap pelayanan atau tanggapan atas permintaan
            informasi publik.
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <strong>PPID Kementerian Agama Kabupaten Kutai Barat</strong>
            <p className="mt-1 text-sm text-muted-foreground">
              Memberikan layanan informasi publik yang cepat, tepat, transparan,
              dan akuntabel.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            * Menunjukkan pertanyaan yang wajib diisi.
          </p>
        </div>

        <form className="request-form" onSubmit={submit}>
          <FieldSet>
            <FieldLegend>Data Pemohon</FieldLegend>
            <Label htmlFor="full-name">1. Nama *</Label>
            <Input
              id="full-name"
              name="fullName"
              required
              autoComplete="name"
            />
            <Label htmlFor="address">2. Alamat *</Label>
            <Textarea
              id="address"
              name="address"
              required
              autoComplete="street-address"
              rows={3}
            />
            <Label htmlFor="whatsapp">3. Kontak WhatsApp *</Label>
            <Input
              id="whatsapp"
              name="whatsappNumber"
              type="tel"
              required
              autoComplete="tel"
            />
            <Label htmlFor="email">4. Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" />
            <span className="field-label" id="applicant-status-label">
              5. Status Pemohon *
            </span>
            <p className="text-sm text-muted-foreground">
              Tandai satu oval saja.
            </p>
            <RadioGroup
              value={applicantStatus}
              onValueChange={setApplicantStatus}
              aria-labelledby="applicant-status-label"
              className="choice-grid"
            >
              {applicantStatusOptions.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`status-${value}`}
                  className="choice"
                >
                  <RadioGroupItem id={`status-${value}`} value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Informasi Permohonan</FieldLegend>
            <Label htmlFor="request-date">
              6. Tanggal Permintaan Informasi *
            </Label>
            <Input id="request-date" name="requestDate" type="date" required />
            <p className="text-sm text-muted-foreground">
              Contoh: 7 Januari 2019
            </p>
            <Label htmlFor="requested-information">
              7. Informasi yang Dimohon *
            </Label>
            <Textarea
              id="requested-information"
              name="requestedInformation"
              required
              rows={4}
            />
            <span className="field-label" id="request-channel-label">
              8. Media/Saluran Permintaan Informasi *
            </span>
            <p className="text-sm text-muted-foreground">
              Tandai satu oval saja.
            </p>
            <RadioGroup
              value={requestChannel}
              onValueChange={setRequestChannel}
              aria-labelledby="request-channel-label"
              className="choice-grid"
            >
              {requestChannelOptions.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`channel-${value}`}
                  className="choice"
                >
                  <RadioGroupItem id={`channel-${value}`} value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Alasan Keberatan</FieldLegend>
            <span className="field-label" id="objection-reasons-label">
              9. Alasan Pengajuan Keberatan *
            </span>
            <p className="text-sm text-muted-foreground">
              Centang semua yang sesuai.
            </p>
            <div
              className="choice-grid"
              aria-labelledby="objection-reasons-label"
            >
              {objectionReasonOptions.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`reason-${value}`}
                  className="check"
                >
                  <Checkbox
                    id={`reason-${value}`}
                    checked={objectionReasons.includes(value)}
                    onCheckedChange={(checked) =>
                      toggleReason(value, checked === true)
                    }
                  />
                  {label}
                </Label>
              ))}
            </div>
            {objectionReasons.includes('other') ? (
              <Input
                name="otherReason"
                required
                placeholder="Tuliskan alasan lainnya"
                aria-label="Alasan lainnya"
              />
            ) : null}
            <Label htmlFor="objection-detail">
              10. Uraian Keberatan (uraikan secara rinci alasan keberatan) *
            </Label>
            <Textarea
              id="objection-detail"
              name="objectionDetail"
              required
              rows={6}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>Tanggapan Keberatan</FieldLegend>
            <Label htmlFor="expected-response">
              11. Tanggapan/informasi yang diharapkan *
            </Label>
            <Textarea
              id="expected-response"
              name="expectedResponse"
              required
              rows={4}
            />
            <Label htmlFor="attachment">12. Upload Dokumen Pendukung *</Label>
            <Input
              id="attachment"
              name="attachment"
              type="file"
              accept="application/pdf,image/png"
              required
            />
            <p className="text-sm text-muted-foreground">
              File dikirimkan: PDF atau PNG, maksimum 15 MB.
            </p>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Pernyataan</FieldLegend>
            <span className="field-label">13. Pernyataan *</span>
            <p>
              Saya menyatakan bahwa data dan informasi yang saya sampaikan dalam
              formulir ini adalah benar dan dapat dipertanggungjawabkan. Saya
              memahami bahwa pengajuan keberatan akan diproses sesuai dengan
              ketentuan peraturan perundang-undangan yang berlaku.
            </p>
            <p className="text-sm text-muted-foreground">
              Centang semua yang sesuai.
            </p>
            <Label className="check" htmlFor="declaration">
              <Checkbox
                id="declaration"
                checked={declarationAccepted}
                onCheckedChange={(checked) =>
                  setDeclarationAccepted(checked === true)
                }
              />
              Setuju
            </Label>
          </FieldSet>
          <Button type="submit" disabled={submitting || Boolean(receiptNumber)}>
            {submitting ? 'Mengirim keberatan...' : 'Kirim keberatan'}
          </Button>
        </form>
      </section>
    </PublicPage>
  )
}
