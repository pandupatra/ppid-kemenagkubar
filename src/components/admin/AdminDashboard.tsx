import { useMemo, useState } from 'react'
import { FileCheck2, MoreHorizontal, Plus, Search } from 'lucide-react'
import type {
  AdminDashboardData,
  DashboardDocument,
} from '@/modules/admin/dashboard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminShell } from '@/components/admin/AdminShell'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function statusVariant(status: DashboardDocument['status']) {
  if (status === 'published') return 'default'
  if (status === 'in_review') return 'secondary'
  return 'outline'
}

const statusLabel: Record<DashboardDocument['status'], string> = {
  archived: 'Diarsipkan',
  draft: 'Draf',
  in_review: 'Menunggu review',
  published: 'Terbit',
}

function formatWita(value: string) {
  return (
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Makassar',
    }).format(new Date(value)) + ' WITA'
  )
}

export function AdminDashboard({
  data,
}: Readonly<{ data: AdminDashboardData }>) {
  const [query, setQuery] = useState('')
  const availableDocuments =
    data.access === 'granted' ? data.recentDocuments : []
  const filteredDocuments = useMemo(
    () =>
      availableDocuments.filter((document) =>
        `${document.title} ${document.category}`
          .toLocaleLowerCase('id-ID')
          .includes(query.toLocaleLowerCase('id-ID')),
      ),
    [availableDocuments, query],
  )
  if (data.access === 'denied') return <AdminAccessDenied />

  return (
    <AdminShell actor={data.actor} activePath="/admin">
      <main className="admin-content" id="isi-admin">
        <section className="admin-page-heading" aria-labelledby="admin-title">
          <div>
            <p className="admin-eyebrow">Ringkasan konten</p>
            <h1 id="admin-title">Selamat datang, {data.actor.displayName}.</h1>
            <p>
              Kelola halaman, dokumen, dan antrean review portal PPID dari satu
              ruang kerja.
            </p>
          </div>
          <Button asChild>
            <a href="/admin/dokumen">
              <Plus /> Tambah dokumen
            </a>
          </Button>
        </section>

        <section className="admin-metrics" aria-label="Ringkasan status konten">
          <Metric
            label="Dokumen terbit"
            value={String(data.metrics.publishedDocuments)}
            detail="Versi aktif yang sudah dipublikasikan"
          />
          <Metric
            label="Menunggu review"
            value={String(data.metrics.reviewDocuments)}
            detail="Memerlukan keputusan reviewer"
            warning
          />
          <Metric
            label="Entri DIP terbit"
            value={String(data.metrics.dipItems)}
            detail="Daftar Informasi Publik yang tersedia"
          />
          <Metric
            label="Draf tersimpan"
            value={String(data.metrics.draftDocuments)}
            detail="Belum dapat diakses publik"
          />
        </section>

        <section
          className="admin-dashboard-grid"
          aria-label="Konten dan review"
        >
          <Card className="admin-documents-card">
            <CardHeader className="admin-card-heading">
              <div>
                <CardTitle>Dokumen terbaru</CardTitle>
                <CardDescription>
                  Perubahan terakhir pada katalog informasi publik.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <label className="admin-search" htmlFor="document-search">
                <Search aria-hidden="true" />
                <span className="sr-only">Cari dokumen</span>
                <Input
                  id="document-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari dokumen atau kategori"
                />
              </label>
              <div className="admin-table-wrap">
                <Table className="admin-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Dokumen</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Pembaruan</TableHead>
                      <TableHead scope="col">
                        <span className="sr-only">Tindakan</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell data-label="Dokumen">
                          <strong>{document.title}</strong>
                          <span>{document.category}</span>
                        </TableCell>
                        <TableCell data-label="Status">
                          <Badge variant={statusVariant(document.status)}>
                            {statusLabel[document.status]}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Pembaruan">
                          <span>{formatWita(document.updatedAt)}</span>
                          <small>Metadata dokumen</small>
                        </TableCell>
                        <TableCell className="admin-row-action">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Tindakan ${document.title}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredDocuments.length === 0 ? (
                  <p className="admin-empty-result">
                    Tidak ada dokumen yang cocok.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </AdminShell>
  )
}

function AdminAccessDenied() {
  return (
    <main className="admin-access-denied">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-foreground">
            Akses administrasi tidak tersedia
          </h1>
          <CardDescription>
            Masuk dengan akun staf PPID yang memiliki penugasan aktif untuk
            mengakses ruang kerja ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/masuk">Masuk sebagai staf PPID</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="/">Kembali ke portal publik</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

function Metric({
  detail,
  label,
  value,
  warning = false,
}: Readonly<{
  detail: string
  label: string
  value: string
  warning?: boolean
}>) {
  return (
    <Card className={warning ? 'admin-metric is-warning' : 'admin-metric'}>
      <CardContent>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </CardContent>
    </Card>
  )
}

function ReviewItem({
  detail,
  title,
  urgency,
}: Readonly<{ detail: string; title: string; urgency: string }>) {
  return (
    <div className="admin-review-item">
      <span className="admin-review-icon" aria-hidden="true">
        <FileCheck2 />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      <Badge variant="outline">{urgency}</Badge>
    </div>
  )
}
