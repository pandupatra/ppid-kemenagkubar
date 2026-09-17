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
  AdminInformationObjection,
  AdminInformationObjectionsData,
} from '@/modules/information-requests/admin-objections'
import { updateInformationObjectionStatus } from '@/modules/information-requests/admin-objections'
import {
  requestStatuses,
  type RequestStatus,
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
  legal_entity: 'Badan hukum',
  group_or_organization: 'Kelompok/lembaga/organisasi',
  other: 'Lainnya',
}

const channelLabels: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  social_media: 'Media sosial',
  in_person: 'Datang langsung',
}

const reasonLabels: Record<string, string> = {
  request_rejected: 'Permohonan informasi ditolak',
  periodic_information_unavailable: 'Informasi berkala tidak tersedia',
  no_response: 'Permohonan tidak ditanggapi',
  response_not_as_requested: 'Tanggapan tidak sesuai permohonan',
  late_response: 'Tanggapan melewati batas waktu',
  unreasonable_fee: 'Biaya tidak wajar',
  incomplete_information: 'Informasi tidak lengkap',
  other: 'Alasan lainnya',
}

function formatWita(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  )
}

function statusVariant(status: RequestStatus) {
  if (['fulfilled', 'closed'].includes(status)) return 'default' as const
  if (['rejected', 'withdrawn'].includes(status)) return 'destructive' as const
  if (['submitted', 'needs_correction'].includes(status))
    return 'secondary' as const
  return 'outline' as const
}

export function InformationObjectionManager({
  data,
}: Readonly<{ data: AdminInformationObjectionsData }>) {
  if (data.access === 'denied') return <ObjectionAccessDenied />
  return <ObjectionWorkspace data={data} />
}

function ObjectionWorkspace({
  data,
}: Readonly<{
  data: Extract<AdminInformationObjectionsData, { access: 'granted' }>
}>) {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(data.objections[0]?.id ?? null)
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID')
    return data.objections.filter((objection) => {
      const matchesStatus = status === 'all' || objection.status === status
      const matchesQuery =
        !term ||
        [
          objection.receiptNumber,
          objection.fullName,
          objection.requestedInformation,
        ]
          .join(' ')
          .toLocaleLowerCase('id-ID')
          .includes(term)
      return matchesStatus && matchesQuery
    })
  }, [data.objections, query, status])
  const selected =
    data.objections.find((item) => item.id === selectedId) ?? null

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
      await updateInformationObjectionStatus({
        data: { id: selected.id, status: pendingStatus },
      })
      toast({
        title: 'Status keberatan diperbarui',
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
    <AdminShell actor={data.actor} activePath="/admin/keberatan-informasi">
      <main className="admin-content" id="isi-admin">
        <section
          className="admin-page-heading"
          aria-labelledby="objection-admin-title"
        >
          <div>
            <h1 id="objection-admin-title">Keberatan informasi</h1>
            <p>
              Tinjau pengajuan keberatan, dokumen pendukung, dan riwayat
              penanganannya dalam satu antrean.
            </p>
          </div>
          <Badge variant="outline">{data.objections.length} keberatan</Badge>
        </section>

        <section
          className="admin-request-layout"
          aria-label="Daftar pengajuan keberatan"
        >
          <Card className="admin-request-queue">
            <CardHeader className="admin-card-heading">
              <CardTitle>Antrean keberatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="admin-request-filters">
                <label className="admin-search" htmlFor="objection-search">
                  <Search aria-hidden="true" />
                  <Input
                    id="objection-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nomor, pemohon, atau informasi"
                  />
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger aria-label="Filter status keberatan">
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
                      <TableHead>Keberatan</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diajukan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((objection) => (
                      <TableRow
                        key={objection.id}
                        data-state={
                          selected?.id === objection.id ? 'selected' : undefined
                        }
                        className="admin-request-row"
                        onClick={() => setSelectedId(objection.id)}
                      >
                        <TableCell data-label="Keberatan">
                          <strong>{objection.requestedInformation}</strong>
                          <span>{objection.receiptNumber}</span>
                        </TableCell>
                        <TableCell data-label="Pemohon">
                          <strong>{objection.fullName}</strong>
                        </TableCell>
                        <TableCell data-label="Status">
                          <Badge variant={statusVariant(objection.status)}>
                            {statusLabels[objection.status]}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Diajukan">
                          <span>{formatWita(objection.submittedAt)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 ? (
                  <p className="admin-empty-result">
                    Belum ada keberatan yang sesuai dengan pencarian dan filter.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <ObjectionDetail
            canUpdate={data.canUpdate}
            objection={selected}
            pendingStatus={pendingStatus}
            saveStatus={saveStatus}
            setPendingStatus={setPendingStatus}
            submitting={submitting}
          />
        </section>
      </main>
    </AdminShell>
  )
}

function ObjectionDetail({
  canUpdate,
  objection,
  pendingStatus,
  saveStatus,
  setPendingStatus,
  submitting,
}: Readonly<{
  canUpdate: boolean
  objection: AdminInformationObjection | null
  pendingStatus: RequestStatus | null
  saveStatus: () => Promise<void>
  setPendingStatus: (status: RequestStatus) => void
  submitting: boolean
}>) {
  if (!objection)
    return (
      <aside className="admin-request-detail admin-request-detail-empty">
        <p>Pilih keberatan untuk melihat rincian.</p>
      </aside>
    )

  return (
    <aside
      className="admin-request-detail"
      aria-label={`Rincian ${objection.receiptNumber}`}
    >
      <div className="admin-request-detail-heading">
        <div>
          <span>{objection.receiptNumber}</span>
          <h2>{objection.requestedInformation}</h2>
        </div>
        <Badge variant={statusVariant(objection.status)}>
          {statusLabels[objection.status]}
        </Badge>
      </div>

      {canUpdate ? (
        <div className="admin-request-status-control">
          <label htmlFor="objection-status">Ubah status penanganan</label>
          <div>
            <Select
              value={pendingStatus ?? objection.status}
              onValueChange={(value) =>
                setPendingStatus(value as RequestStatus)
              }
              disabled={submitting}
            >
              <SelectTrigger id="objection-status">
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
                !pendingStatus ||
                pendingStatus === objection.status ||
                submitting
              }
            >
              {submitting ? 'Menyimpan…' : 'Simpan status'}
            </Button>
          </div>
        </div>
      ) : null}

      <DetailSection title="Data pemohon">
        <DetailItem label="Nama" value={objection.fullName} />
        <DetailItem
          label="Status pemohon"
          value={
            applicantLabels[objection.applicantStatus] ??
            objection.applicantStatus
          }
        />
        <DetailItem label="WhatsApp" value={objection.whatsappNumber} />
        <DetailItem
          label="Email"
          value={objection.email ?? 'Tidak dicantumkan'}
        />
        <DetailItem label="Alamat" value={objection.address} wide />
      </DetailSection>

      <DetailSection title="Permohonan sebelumnya">
        <DetailItem
          label="Tanggal permintaan"
          value={formatDate(objection.requestDate)}
        />
        <DetailItem
          label="Saluran"
          value={
            channelLabels[objection.requestChannel] ?? objection.requestChannel
          }
        />
        <DetailItem
          label="Informasi yang diminta"
          value={objection.requestedInformation}
          wide
        />
      </DetailSection>

      <DetailSection title="Rincian keberatan">
        <DetailItem
          label="Alasan"
          value={objection.objectionReasons
            .map((reason) => reasonLabels[reason] ?? reason)
            .join(', ')}
          wide
        />
        {objection.otherReason ? (
          <DetailItem
            label="Alasan lainnya"
            value={objection.otherReason}
            wide
          />
        ) : null}
        <DetailItem label="Uraian" value={objection.objectionDetail} wide />
        <DetailItem
          label="Tanggapan yang diharapkan"
          value={objection.expectedResponse}
          wide
        />
      </DetailSection>

      <DetailSection title="Dokumen pendukung privat">
        <div className="admin-request-attachment">
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>{objection.attachmentName}</strong>
            <small>
              {Math.ceil(objection.attachmentByteSize / 1024)} KB ·{' '}
              {objection.attachmentContentType}
            </small>
          </span>
        </div>
        <p className="admin-request-privacy-note">
          Berkas tidak dapat dibuka dari halaman ini sampai alur pemindaian dan
          unduhan berwenang tersedia.
        </p>
      </DetailSection>

      <DetailSection title="Riwayat penanganan">
        <ol className="admin-request-events">
          <li>
            <strong>Keberatan diajukan</strong>
            <span>{formatWita(objection.submittedAt)}</span>
          </li>
          {objection.history.map((event) => (
            <li key={event.id}>
              <strong>Status diperbarui</strong>
              <span>
                {formatWita(event.createdAt)}
                {event.actorName ? ` · ${event.actorName}` : ''}
              </span>
              {event.summary.to ? (
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

function ObjectionAccessDenied() {
  return (
    <main className="admin-access-denied">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">
            Akses keberatan tidak tersedia
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
