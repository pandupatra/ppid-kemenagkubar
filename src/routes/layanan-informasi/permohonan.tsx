import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { FieldSet, FieldLegend } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormEvent, useId, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'
import { submitPublicInformationRequest } from '@/modules/information-requests/public-requests'

export const Route = createFileRoute('/layanan-informasi/permohonan')({
  component: RequestPage,
})

function RequestPage() {
  const [attempted, setAttempted] = useState(false)
  const [applicantType, setApplicantType] = useState('')
  const [requestedFormat, setRequestedFormat] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const nameId = useId()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || receiptNumber) return
    setAttempted(true)
    setError('')
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    if (!applicantType || !requestedFormat || !deliveryMethod) {
      setError('Pilih semua pilihan yang wajib diisi sebelum mengirim.')
      return
    }

    const values = new FormData(form)
    setSubmitting(true)
    try {
      const result = await submitPublicInformationRequest({
        data: {
          address: String(values.get('address') ?? ''),
          applicantType,
          deliveryMethod,
          email: String(values.get('email') ?? ''),
          fullName: String(values.get('fullName') ?? ''),
          informationPeriod: String(values.get('informationPeriod') ?? ''),
          intendedUse: String(values.get('intendedUse') ?? ''),
          requestedDetail: String(values.get('requestedDetail') ?? ''),
          requestedFormat,
          requestedTitle: String(values.get('requestedTitle') ?? ''),
          whatsappNumber: String(values.get('whatsappNumber') ?? ''),
        },
      })
      setReceiptNumber(result.receiptNumber)
    } catch {
      setError('Permohonan belum dapat dikirim. Coba lagi beberapa saat lagi.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <PublicPage
      eyebrow="Permohonan informasi"
      title="Formulir Permohonan Informasi Publik"
      lead="Lengkapi informasi berikut agar PPID dapat memproses permohonan Anda."
    >
      <section className="section page-container form-layout">
        <form
          className="request-form"
          onSubmit={submit}
          onInvalid={() => {
            setAttempted(true)
          }}
        >
          {attempted && !receiptNumber && !error && (
            <Alert variant="destructive">
              <AlertDescription>
                Periksa kembali semua isian wajib sebelum melanjutkan.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {receiptNumber && (
            <Alert variant="success" role="status">
              <AlertTitle>Permohonan berhasil dikirim.</AlertTitle>
              <AlertDescription>
                Simpan nomor tanda terima ini untuk melacak permohonan Anda:
                <strong className="receipt-number">{receiptNumber}</strong>
                <a href="/layanan-informasi/lacak">Lacak permohonan</a>
              </AlertDescription>
            </Alert>
          )}
          <FieldSet>
            <FieldLegend>Identitas pemohon</FieldLegend>
            <Label htmlFor={nameId}>Nama lengkap *</Label>
            <Input id={nameId} name="fullName" required autoComplete="name" />
            <span className="field-label" id="status-label">
              Status pemohon *
            </span>
            <RadioGroup
              name="status"
              value={applicantType}
              onValueChange={setApplicantType}
              aria-labelledby="status-label"
              className="choice-grid"
            >
              {[
                'Perseorangan',
                'Kelompok masyarakat',
                'Badan hukum',
                'Lembaga atau organisasi',
              ].map((option) => (
                <Label
                  key={option}
                  htmlFor={`status-${option}`}
                  className="choice"
                >
                  <RadioGroupItem
                    id={`status-${option}`}
                    value={
                      {
                        Perseorangan: 'individual',
                        'Kelompok masyarakat': 'community_group',
                        'Badan hukum': 'legal_entity',
                        'Lembaga atau organisasi': 'organization',
                      }[option] ?? ''
                    }
                  />
                  {option}
                </Label>
              ))}
            </RadioGroup>
            <Label htmlFor="address">Alamat *</Label>
            <Textarea
              id="address"
              name="address"
              required
              autoComplete="street-address"
              rows={3}
            />
            <div className="form-columns">
              <div>
                <Label htmlFor="whatsapp">Kontak WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  name="whatsappNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label htmlFor="email">Alamat email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Informasi yang diminta</FieldLegend>
            <Label htmlFor="title">Judul atau nama informasi *</Label>
            <Input id="title" name="requestedTitle" required />
            <Label htmlFor="detail">Uraian atau rincian informasi *</Label>
            <Textarea id="detail" name="requestedDetail" required rows={5} />
            <div className="form-columns">
              <div>
                <Label htmlFor="purpose">Tujuan penggunaan informasi *</Label>
                <Textarea id="purpose" name="intendedUse" required rows={3} />
              </div>
              <div>
                <Label htmlFor="period">Periode atau tahun informasi</Label>
                <Input
                  id="period"
                  name="informationPeriod"
                  placeholder="Contoh: 2024-2025"
                />
              </div>
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Bentuk dan cara memperoleh informasi</FieldLegend>
            <span className="field-label" id="format-label">
              Bentuk informasi yang diinginkan *
            </span>
            <RadioGroup
              name="format"
              value={requestedFormat}
              onValueChange={setRequestedFormat}
              aria-labelledby="format-label"
              className="choice-grid"
            >
              {[
                'Dokumen digital atau PDF',
                'Data elektronik',
                'Melihat atau membaca langsung',
              ].map((option) => (
                <Label
                  key={option}
                  htmlFor={`format-${option}`}
                  className="choice"
                >
                  <RadioGroupItem
                    id={`format-${option}`}
                    value={
                      {
                        'Dokumen digital atau PDF': 'pdf',
                        'Data elektronik': 'electronic_data',
                        'Melihat atau membaca langsung': 'in_person',
                      }[option] ?? ''
                    }
                  />
                  {option}
                </Label>
              ))}
            </RadioGroup>
            <span className="field-label" id="delivery-label">
              Cara memperoleh informasi *
            </span>
            <RadioGroup
              name="delivery"
              value={deliveryMethod}
              onValueChange={setDeliveryMethod}
              aria-labelledby="delivery-label"
              className="choice-grid"
            >
              {['Email', 'WhatsApp', 'Media elektronik lainnya'].map(
                (option) => (
                  <Label
                    key={option}
                    htmlFor={`delivery-${option}`}
                    className="choice"
                  >
                    <RadioGroupItem
                      id={`delivery-${option}`}
                      value={
                        {
                          Email: 'email',
                          WhatsApp: 'whatsapp',
                          'Media elektronik lainnya': 'other_electronic',
                        }[option] ?? ''
                      }
                    />
                    {option}
                  </Label>
                ),
              )}
            </RadioGroup>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Pernyataan dan lampiran</FieldLegend>
            <Label className="check" htmlFor="declaration-1">
              <Checkbox id="declaration-1" name="declaration-1" required />
              Saya menyatakan data yang saya sampaikan benar.
            </Label>
            <Label className="check" htmlFor="declaration-2">
              <Checkbox id="declaration-2" name="declaration-2" required />
              Saya bersedia mengikuti ketentuan pelayanan informasi publik.
            </Label>
            <Label className="check" htmlFor="declaration-3">
              <Checkbox id="declaration-3" name="declaration-3" required />
              Saya memahami bahwa informasi diberikan sesuai ketentuan peraturan
              perundang-undangan.
            </Label>
            <p className="privacy-note">
              Dokumen identitas dan surat kuasa tidak diwajibkan pada tahap ini.
              Lampiran belum dapat diterima melalui formulir ini; PPID akan
              menghubungi Anda bila dokumen pendukung diperlukan.
            </p>
          </FieldSet>
          <Button type="submit" disabled={submitting || Boolean(receiptNumber)}>
            {submitting ? 'Mengirim permohonan…' : 'Kirim permohonan'}
          </Button>
        </form>
      </section>
    </PublicPage>
  )
}
