import { useMemo, useState } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import type {
  AdminInformationRequest,
  AdminInformationRequestsData,
  RequestStatus,
} from '@/modules/information-requests/admin-requests'
import {
  requestStatuses,
  updateInformationRequestStatus,
} from '@/modules/information-requests/admin-requests'

const statusLabels: Record<RequestStatus, string> = {
  submitted: 'Diajukan',
  needs_correction: 'Perlu perbaikan',
  verified: 'Terverifikasi',
  assigned: 'Ditugaskan',
  in_progress: 'Diproses',
  extended: 'Diperpanjang',
  fulfilled: 'Dipenuhi',
  partially_fulfilled: 'Dipenuhi sebagian',
  rejected: 'Ditolak',
  withdrawn: 'Ditarik',
  closed: 'Ditutup',
}

const applicantLabels: Record<string, string> = {
  individual: 'Perseorangan',
  community_group: 'Kelompok masyarakat',
  legal_entity: 'Badan hukum',
  organization: 'Lembaga/organisasi',
  other: 'Lainnya',
}

const formatLabels: Record<string, string> = {
  pdf: 'Dokumen digital/PDF',
  electronic_data: 'Data elektronik',
  in_person: 'Melihat langsung',
}

const deliveryLabels: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  other_electronic: 'Media elektronik lainnya',
}

function formatWita(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  }).format(new Date(value))
}

function statusVariant(status: RequestStatus) {
  if (['fulfilled', 'closed'].includes(status)) return 'default' as const
  if (['rejected', 'withdrawn'].includes(status)) return 'destructive' as const
  if (['submitted', 'needs_correction'].includes(status))
    return 'secondary' as const
  return 'outline' as const
}

export function InformationRequestManager({
  data,
}: Readonly<{ data: AdminInformationRequestsData }>) {
  if (data.access === 'denied') return <RequestAccessDenied />
  return <RequestWorkspace data={data} />
}

function RequestWorkspace({
  data,
}: Readonly<{
  data: Extract<AdminInformationRequestsData, { access: 'granted' }>
}>) {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(data.requests[0]?.id ?? null)
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID')
    return data.requests.filter((request) => {
      const matchesStatus = status === 'all' || request.status === status
      const matchesQuery =
        !term ||
        [
          request.receiptNumber,
          request.requestedTitle,
          request.applicant.fullName,
        ]
          .join(' ')
          .toLocaleLowerCase('id-ID')
          .includes(term)
      return matchesStatus && matchesQuery
    })
  }, [data.requests, query, status])
  const selected =
    data.requests.find((request) => request.id === selectedId) ?? null

  async function saveStatus() {
    if (
      !selected ||
      !pendingStatus ||
      pendingStatus === selected.status ||
      submitting
    )
      return
    setSubmitting(true)
    try {
      await updateInformationRequestStatus({
        data: { id: selected.id, status: pendingStatus },
      })
      toast({
        title: 'Status diperbarui',
        description: `${selected.receiptNumber} sekarang berstatus ${statusLabels[pendingStatus]}.`,
        variant: 'success',
      })
      setPendingStatus(null)
      await router.invalidate()
    } catch (error) {
      toast({
        title: 'Status belum diperbarui',
        description:
          error instanceof Error
            ? error.message
            : 'Coba lagi beberapa saat lagi.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminShell actor={data.actor} activePath="/admin/permohonan-informasi">
      <main className="admin-content" id="isi-admin">
        <section
          className="admin-page-heading"
          aria-labelledby="request-admin-title"
        >
          <div>
            <h1 id="request-admin-title">Permohonan informasi</h1>
            <p>
              Tinjau permohonan masyarakat, identitas lampiran, dan riwayat
              penanganan dalam satu antrean.
            </p>
          </div>
          <Badge variant="outline">{data.requests.length} permohonan</Badge>
        </section>

        <section
          className="admin-request-layout"
          aria-label="Daftar permohonan informasi"
        >
          <Card className="admin-request-queue">
            <CardHeader className="admin-card-heading">
              <CardTitle>Antrean permohonan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="admin-request-filters">
                <label className="admin-search" htmlFor="request-search">
                  <Search aria-hidden="true" />
                  <Input
                    id="request-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nomor, pemohon, atau informasi"
                  />
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger aria-label="Filter status permohonan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    {requestStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {statusLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="admin-table-wrap">
                <Table className="admin-table admin-request-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permohonan</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diajukan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((request) => (
                      <TableRow
                        key={request.id}
                        data-state={
                          selected?.id === request.id ? 'selected' : undefined
                        }
                        className="admin-request-row"
                        onClick={() => setSelectedId(request.id)}
                      >
                        <TableCell data-label="Permohonan">
                          <strong>{request.requestedTitle}</strong>
                          <span>{request.receiptNumber}</span>
                        </TableCell>
                        <TableCell data-label="Pemohon">
                          <strong>{request.applicant.fullName}</strong>
                        </TableCell>
                        <TableCell data-label="Status">
                          <Badge variant={statusVariant(request.status)}>
                            {statusLabels[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Diajukan">
                          <span>{formatWita(request.submittedAt)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 ? (
                  <p className="admin-empty-result">
                    Belum ada permohonan yang sesuai dengan pencarian dan
                    filter.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <RequestDetail
            canUpdate={data.canUpdate}
            request={selected}
            pendingStatus={pendingStatus}
            setPendingStatus={setPendingStatus}
            saveStatus={saveStatus}
            submitting={submitting}
          />
        </section>
      </main>
    </AdminShell>
  )
}

function RequestDetail({
  canUpdate,
  pendingStatus,
  request,
  saveStatus,
  setPendingStatus,
  submitting,
}: Readonly<{
  canUpdate: boolean
  pendingStatus: RequestStatus | null
  request: AdminInformationRequest | null
  saveStatus: () => Promise<void>
  setPendingStatus: (status: RequestStatus) => void
  submitting: boolean
}>) {
  if (!request)
    return (
      <aside className="admin-request-detail admin-request-detail-empty">
        <p>Pilih permohonan untuk melihat rincian.</p>
      </aside>
    )
  const applicantType =
    request.applicant.applicantTypeOther ??
    applicantLabels[request.applicant.applicantType] ??
    request.applicant.applicantType
  return (
    <aside
      className="admin-request-detail"
      aria-label={`Rincian ${request.receiptNumber}`}
    >
      <div className="admin-request-detail-heading">
        <div>
          <span>{request.receiptNumber}</span>
          <h2>{request.requestedTitle}</h2>
        </div>
        <Badge variant={statusVariant(request.status)}>
          {statusLabels[request.status]}
        </Badge>
      </div>

      {canUpdate ? (
        <div className="admin-request-status-control">
          <label htmlFor="request-status">Ubah status penanganan</label>
          <div>
            <Select
              value={pendingStatus ?? request.status}
              onValueChange={(value) =>
                setPendingStatus(value as RequestStatus)
              }
              disabled={submitting}
            >
              <SelectTrigger id="request-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {requestStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {statusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => void saveStatus()}
              disabled={
                !pendingStatus || pendingStatus === request.status || submitting
              }
            >
              {submitting ? 'Menyimpan…' : 'Simpan status'}
            </Button>
          </div>
        </div>
      ) : null}

      <DetailSection title="Data pemohon">
        <DetailItem label="Nama" value={request.applicant.fullName} />
        <DetailItem label="Status pemohon" value={applicantType} />
        <DetailItem label="WhatsApp" value={request.applicant.whatsappNumber} />
        <DetailItem
          label="Email"
          value={request.applicant.email ?? 'Tidak dicantumkan'}
        />
        <DetailItem label="Alamat" value={request.applicant.address} wide />
      </DetailSection>

      <DetailSection title="Informasi yang diminta">
        <DetailItem label="Rincian" value={request.requestedDetail} wide />
        <DetailItem label="Tujuan" value={request.intendedUse} wide />
        <DetailItem
          label="Periode"
          value={request.informationPeriod ?? 'Tidak dicantumkan'}
        />
        <DetailItem
          label="Bentuk"
          value={
            formatLabels[request.requestedFormat] ?? request.requestedFormat
          }
        />
        <DetailItem
          label="Pengiriman"
          value={
            deliveryLabels[request.deliveryMethod] ?? request.deliveryMethod
          }
        />
      </DetailSection>

      <DetailSection title="Lampiran privat">
        {request.attachments.length ? (
          request.attachments.map((attachment) => (
            <div className="admin-request-attachment" key={attachment.id}>
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>{attachment.originalFilename}</strong>
                <small>
                  {attachment.kind === 'identity'
                    ? 'Identitas pemohon'
                    : 'Surat kuasa/pengantar'}
                  {' · '}
                  {Math.ceil(attachment.byteSize / 1024)} KB · Pindai:{' '}
                  {attachment.scanState}
                </small>
              </span>
            </div>
          ))
        ) : (
          <p className="admin-request-muted">Tidak ada metadata lampiran.</p>
        )}
        <p className="admin-request-privacy-note">
          Berkas tidak dapat dibuka dari halaman ini sampai alur pemindaian dan
          unduhan berwenang tersedia.
        </p>
      </DetailSection>

      <DetailSection title="Riwayat penanganan">
        <ol className="admin-request-events">
          {request.events.map((event) => (
            <li key={event.id}>
              <strong>
                {event.type === 'submitted'
                  ? 'Permohonan diajukan'
                  : 'Status diperbarui'}
              </strong>
              <span>
                {formatWita(event.createdAt)}
                {event.actorName ? ` · ${event.actorName}` : ''}
              </span>
              {event.type === 'status_changed' &&
              typeof event.summary.to === 'string' ? (
                <small>
                  Menjadi{' '}
                  {statusLabels[event.summary.to as RequestStatus] ??
                    event.summary.to}
                </small>
              ) : null}
            </li>
          ))}
        </ol>
      </DetailSection>
    </aside>
  )
}

function DetailSection({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <section className="admin-request-section">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

function DetailItem({
  label,
  value,
  wide = false,
}: Readonly<{ label: string; value: string; wide?: boolean }>) {
  return (
    <div
      className={wide ? 'admin-request-field is-wide' : 'admin-request-field'}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function RequestAccessDenied() {
  return (
    <main className="admin-access-denied">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">
            Akses permohonan tidak tersedia
          </h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Gunakan akun petugas PPID, atasan PPID, administrator, atau auditor
            yang aktif.
          </p>
          <Button asChild>
            <a href="/masuk">Masuk sebagai staf PPID</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
