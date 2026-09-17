import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { submitPublicInformationRequest } from '@/modules/information-requests/public-requests'
import { Check, CheckCircle2, Copy, Search } from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FormEvent, useState } from 'react'
import { PublicPage } from '../../components/public/PublicPage'

export const Route = createFileRoute('/layanan-informasi/permohonan')({
  component: RequestPage,
})

const applicantTypes = [
  ['individual', 'Perseorangan'],
  ['community_group', 'Kelompok Masyarakat'],
  ['legal_entity', 'Badan Hukum'],
  ['organization', 'Lembaga/Organisasi'],
  ['other', 'Yang lain'],
] as const

const informationFormats = [
  ['pdf', 'Dokumen Digital/PDF'],
  ['electronic_data', 'Data Elektronik'],
  ['in_person', 'Melihat/Membaca Secara Langsung'],
] as const

const deliveryMethods = [
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp'],
  ['other_electronic', 'Media Elektronik Lainnya'],
] as const

const declarations = [
  'Saya menyatakan bahwa data dan informasi yang saya sampaikan dalam formulir ini adalah benar.',
  'Saya bersedia mengikuti ketentuan pelayanan informasi publik yang berlaku.',
  'Saya memahami bahwa informasi yang diberikan merupakan informasi yang dapat diakses berdasarkan ketentuan peraturan perundang-undangan.',
] as const

function RequestPage() {
  const [applicantType, setApplicantType] = useState('')
  const [requestedFormat, setRequestedFormat] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [acceptedDeclarations, setAcceptedDeclarations] = useState<number[]>([])
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)
  const [receiptCopied, setReceiptCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  function toggleDeclaration(index: number, checked: boolean) {
    setAcceptedDeclarations((current) =>
      checked
        ? [...current.filter((item) => item !== index), index]
        : current.filter((item) => item !== index),
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
      !applicantType ||
      !requestedFormat ||
      !deliveryMethod ||
      acceptedDeclarations.length !== declarations.length
    ) {
      toast({
        description: 'Lengkapi semua pilihan dan pernyataan yang wajib diisi.',
        title: 'Formulir belum lengkap',
        variant: 'destructive',
      })
      return
    }

    const values = new FormData(form)
    values.set('applicantType', applicantType)
    values.set('requestedFormat', requestedFormat)
    values.set('deliveryMethod', deliveryMethod)
    setSubmitting(true)
    try {
      const result = await submitPublicInformationRequest({ data: values })
      setReceiptNumber(result.receiptNumber)
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : 'Coba lagi beberapa saat lagi.',
        title: 'Permohonan belum dapat dikirim',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function copyReceiptNumber() {
    if (!receiptNumber) return
    try {
      await navigator.clipboard.writeText(receiptNumber)
      setReceiptCopied(true)
      window.setTimeout(() => setReceiptCopied(false), 2_000)
    } catch {
      toast({
        description: 'Pilih nomor tanda terima lalu salin secara manual.',
        title: 'Nomor belum dapat disalin',
        variant: 'destructive',
      })
    }
  }

  if (receiptNumber) {
    return (
      <PublicPage
        title="Permohonan berhasil dikirim"
        lead="Nomor tanda terima Anda sudah diterbitkan. Simpan nomor ini untuk memantau proses permohonan."
      >
        <section className="section page-container request-success-page">
          <div className="request-success-mark" aria-hidden="true">
            <CheckCircle2 size={34} />
          </div>
          <div className="request-success-heading">
            <h2>Terima kasih, permohonan Anda telah kami terima</h2>
            <p>
              Gunakan nomor tanda terima berikut setiap kali Anda ingin melihat
              perkembangan permohonan.
            </p>
          </div>

          <div className="request-receipt-panel">
            <span>Nomor tanda terima</span>
            <strong>{receiptNumber}</strong>
            <Button
              type="button"
              variant="outline"
              onClick={copyReceiptNumber}
              aria-live="polite"
            >
              {receiptCopied ? <Check /> : <Copy />}
              {receiptCopied ? 'Nomor tersalin' : 'Salin nomor'}
            </Button>
          </div>

          <div className="request-success-note">
            <strong>Simpan nomor ini di tempat yang aman</strong>
            <p>
              Nomor tanda terima diperlukan untuk membuka riwayat status
              permohonan dan tidak boleh dibagikan kepada pihak lain.
            </p>
          </div>

          <div className="request-success-actions">
            <Button asChild>
              <Link to="/layanan-informasi/lacak">
                <Search />
                Lacak permohonan
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Kembali ke beranda</Link>
            </Button>
          </div>
        </section>
      </PublicPage>
    )
  }

  return (
    <PublicPage
      title="FORMULIR PERMOHONAN INFORMASI PUBLIK"
      lead="Kantor Kementerian Agama Kabupaten Kutai Barat"
    >
      <section className="section page-container form-layout">
        <div className="request-form mb-6">
          <p>
            Formulir ini digunakan oleh masyarakat untuk mengajukan permohonan
            informasi publik yang berada dalam penguasaan Kantor Kementerian
            Agama Kabupaten Kutai Barat. Permohonan informasi akan diproses
            sesuai dengan ketentuan peraturan perundang-undangan tentang
            keterbukaan informasi publik.
          </p>
          <p>
            Standar waktu pelayanan: permohonan informasi publik diproses paling
            lambat 3 (tiga) hari kerja sejak permohonan diajukan dan dapat
            diperpanjang sesuai ketentuan yang berlaku.
          </p>
          <p>
            Layanan informasi publik tidak dipungut biaya. Biaya
            penggandaan/pengiriman salinan informasi, apabila ada, dilaksanakan
            sesuai ketentuan yang berlaku.
          </p>
          <p className="text-sm text-muted-foreground">
            * Menunjukkan pertanyaan yang wajib diisi.
          </p>
        </div>

        <form className="request-form" onSubmit={submit}>
          <FieldSet>
            <FieldLegend>Data Pemohon</FieldLegend>
            <Label htmlFor="full-name">1. Nama Lengkap *</Label>
            <Input
              id="full-name"
              name="fullName"
              minLength={2}
              maxLength={200}
              aria-describedby="full-name-hint"
              required
              autoComplete="name"
            />
            <p id="full-name-hint" className="form-validation-message">
              Nama lengkap minimal 2 karakter.
            </p>
            <span className="field-label" id="applicant-type-label">
              2. Status Pemohon *
            </span>
            <p className="text-sm text-muted-foreground">
              Tandai satu oval saja.
            </p>
            <RadioGroup
              value={applicantType}
              onValueChange={setApplicantType}
              aria-labelledby="applicant-type-label"
              className="choice-grid"
            >
              {applicantTypes.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`applicant-${value}`}
                  className="choice"
                >
                  <RadioGroupItem id={`applicant-${value}`} value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
            {applicantType === 'other' ? (
              <>
                <Input
                  name="applicantTypeOther"
                  minLength={2}
                  maxLength={200}
                  aria-describedby="applicant-type-other-hint"
                  required
                  placeholder="Tuliskan status pemohon lainnya"
                  aria-label="Status pemohon lainnya"
                />
                <p
                  id="applicant-type-other-hint"
                  className="form-validation-message"
                >
                  Status pemohon lainnya minimal 2 karakter.
                </p>
              </>
            ) : null}
            <Label htmlFor="address">3. Alamat *</Label>
            <Textarea
              id="address"
              name="address"
              minLength={10}
              maxLength={2000}
              aria-describedby="address-hint"
              required
              autoComplete="street-address"
              rows={3}
            />
            <p id="address-hint" className="form-validation-message">
              Alamat minimal 10 karakter. Tuliskan alamat yang cukup lengkap.
            </p>
            <Label htmlFor="whatsapp">4. Kontak WhatsApp *</Label>
            <Input
              id="whatsapp"
              name="whatsappNumber"
              minLength={8}
              maxLength={32}
              aria-describedby="whatsapp-hint"
              type="tel"
              required
              autoComplete="tel"
            />
            <p id="whatsapp-hint" className="form-validation-message">
              Nomor WhatsApp minimal 8 karakter, termasuk kode area bila
              diperlukan.
            </p>
            <Label htmlFor="email">5. Alamat Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={320}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>INFORMASI YANG DIMINTA</FieldLegend>
            <Label htmlFor="requested-title">
              6. Judul/Nama Informasi yang Diminta *
            </Label>
            <Input
              id="requested-title"
              name="requestedTitle"
              minLength={3}
              maxLength={500}
              aria-describedby="requested-title-hint"
              required
            />
            <p id="requested-title-hint" className="form-validation-message">
              Judul informasi minimal 3 karakter.
            </p>
            <Label htmlFor="requested-detail">
              7. Uraian/Rincian Informasi yang Diminta *
            </Label>
            <Textarea
              id="requested-detail"
              name="requestedDetail"
              minLength={10}
              maxLength={5000}
              aria-describedby="requested-detail-hint"
              required
              rows={5}
            />
            <p id="requested-detail-hint" className="form-validation-message">
              Uraian minimal 10 karakter. Jelaskan informasi yang dibutuhkan
              secara spesifik.
            </p>
            <Label htmlFor="intended-use">
              8. Tujuan/Penggunaan Informasi *
            </Label>
            <Textarea
              id="intended-use"
              name="intendedUse"
              minLength={3}
              maxLength={2000}
              aria-describedby="intended-use-hint"
              required
              rows={3}
            />
            <p id="intended-use-hint" className="form-validation-message">
              Tujuan penggunaan informasi minimal 3 karakter.
            </p>
            <Label htmlFor="information-period">
              9. Periode/Tahun Informasi yang Diminta
            </Label>
            <Input
              id="information-period"
              name="informationPeriod"
              maxLength={100}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>BENTUK INFORMASI</FieldLegend>
            <span className="field-label" id="information-format-label">
              10. Bentuk Informasi yang Diinginkan *
            </span>
            <p className="text-sm text-muted-foreground">
              Tandai satu oval saja.
            </p>
            <RadioGroup
              value={requestedFormat}
              onValueChange={setRequestedFormat}
              aria-labelledby="information-format-label"
              className="choice-grid"
            >
              {informationFormats.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`format-${value}`}
                  className="choice"
                >
                  <RadioGroupItem id={`format-${value}`} value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
            <span className="field-label" id="delivery-method-label">
              11. Cara Memperoleh Informasi *
            </span>
            <p className="text-sm text-muted-foreground">
              Tandai satu oval saja.
            </p>
            <RadioGroup
              value={deliveryMethod}
              onValueChange={setDeliveryMethod}
              aria-labelledby="delivery-method-label"
              className="choice-grid"
            >
              {deliveryMethods.map(([value, label]) => (
                <Label
                  key={value}
                  htmlFor={`delivery-${value}`}
                  className="choice"
                >
                  <RadioGroupItem id={`delivery-${value}`} value={value} />
                  {label}
                </Label>
              ))}
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>PERNYATAAN PEMOHON</FieldLegend>
            <span className="field-label">
              12. Pernyataan Pemohon (Gunakan Kotak Centang) *
            </span>
            <p className="text-sm text-muted-foreground">
              Centang semua yang sesuai.
            </p>
            {declarations.map((declaration, index) => (
              <Label
                className="check"
                htmlFor={`declaration-${index}`}
                key={declaration}
              >
                <Checkbox
                  id={`declaration-${index}`}
                  checked={acceptedDeclarations.includes(index)}
                  onCheckedChange={(checked) =>
                    toggleDeclaration(index, checked === true)
                  }
                />
                {declaration}
              </Label>
            ))}
          </FieldSet>

          <FieldSet>
            <FieldLegend>LAMPIRAN IDENTITAS</FieldLegend>
            <Label htmlFor="identity-attachment">
              13. Upload Identitas Pemohon (KTP) *
            </Label>
            <Input
              id="identity-attachment"
              name="identityAttachment"
              type="file"
              accept="application/pdf,image/png"
              required
            />
            <p className="text-sm text-muted-foreground">
              File dikirimkan: PDF atau PNG, maksimum 15 MB.
            </p>
            <Label htmlFor="authorization-attachment">
              14. Upload Surat Kuasa/Surat Pengantar *
            </Label>
            <Input
              id="authorization-attachment"
              name="authorizationAttachment"
              type="file"
              accept="application/pdf,image/png"
              required
            />
            <p className="text-sm text-muted-foreground">
              File dikirimkan: PDF atau PNG, maksimum 15 MB.
            </p>
          </FieldSet>

          <Button type="submit" disabled={submitting || Boolean(receiptNumber)}>
            {submitting ? 'Mengirim permohonan...' : 'Kirim permohonan'}
          </Button>
        </form>
      </section>
    </PublicPage>
  )
}
