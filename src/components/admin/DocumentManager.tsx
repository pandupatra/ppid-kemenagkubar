import { useMemo, useState, type FormEvent } from 'react'
import {
  FileCheck2,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { DocumentForm } from '@/components/admin/DocumentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  archiveDipItem,
  attachPdfToDip,
  createAdminDocument,
  publishDipDocument,
  removeDipAttachment,
  type AdminDocumentsData,
  updateDipItem,
} from '@/modules/documents/admin-documents'

const disclosureCategoryLabels = {
  available_anytime: 'Setiap saat',
  excluded: 'Dikecualikan',
  immediate: 'Serta merta',
  periodic: 'Berkala',
} as const

export function DocumentManager({
  data,
}: Readonly<{ data: AdminDocumentsData }>) {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDipId, setSelectedDipId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const canPublish =
    data.access === 'granted' &&
    data.actor.roles.some((role) =>
      ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
    )
  const selectedDip =
    data.access === 'granted'
      ? (data.dipItems.find((item) => item.id === selectedDipId) ?? null)
      : null
  const dipItems = useMemo(() => {
    if (data.access === 'denied') return []
    const term = query.trim().toLocaleLowerCase('id-ID')
    if (!term) return data.dipItems
    return data.dipItems.filter((item) =>
      [item.officialTitle, item.keywords.join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('id-ID')
        .includes(term),
    )
  }, [data, query])

  if (data.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )

  function showError(error: unknown, fallback: string) {
    toast({
      description: error instanceof Error ? error.message : fallback,
      title: 'Perubahan belum disimpan',
      variant: 'destructive',
    })
    setSubmitting(false)
  }

  function showSuccess(title: string, description: string) {
    toast({ description, title, variant: 'success' })
    window.setTimeout(() => window.location.reload(), 4_000)
  }

  async function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await createAdminDocument({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setCreateOpen(false)
        showSuccess(
          'Dokumen disimpan sebagai draf',
          'Berkas PDF telah masuk karantina dan menunggu review publikasi.',
        )
      }
    } catch (error) {
      showError(error, 'Dokumen tidak dapat disimpan.')
    }
  }

  async function saveDip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !selectedDip) return
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      const updated = await updateDipItem({ data: form })
      if (!updated.ok) return
      const file = form.get('file')
      if (file instanceof File && file.size > 0) {
        const attachment = new FormData()
        attachment.set('dipId', selectedDip.id)
        attachment.set('description', String(form.get('description') ?? ''))
        attachment.set('file', file)
        attachment.set('publishDate', String(form.get('publishDate') ?? ''))
        await attachPdfToDip({ data: attachment })
      }
      setSelectedDipId(null)
      showSuccess(
        'DIP berhasil diperbarui',
        file instanceof File && file.size > 0
          ? 'Metadata dan PDF baru telah disimpan untuk review.'
          : 'Perubahan metadata telah disimpan.',
      )
    } catch (error) {
      showError(error, 'DIP tidak dapat disimpan.')
    }
  }

  async function archiveDip(id: string) {
    if (
      submitting ||
      !window.confirm(
        'Hapus entri ini dari register publik? Entri akan diarsipkan agar tetap dapat diaudit.',
      )
    )
      return
    setSubmitting(true)
    try {
      const result = await archiveDipItem({ data: { id } })
      if (result.ok)
        showSuccess(
          'DIP diarsipkan',
          'Entri telah dihapus dari register publik dan tetap tersimpan untuk audit.',
        )
    } catch (error) {
      showError(error, 'DIP tidak dapat dihapus.')
    }
  }

  async function removeAttachment() {
    if (
      submitting ||
      !selectedDip ||
      !window.confirm(
        'Hapus lampiran PDF ini? Dokumen tidak lagi tersedia dari register publik.',
      )
    )
      return
    setSubmitting(true)
    try {
      const result = await removeDipAttachment({
        data: { dipId: selectedDip.id },
      })
      if (result.ok) {
        setSelectedDipId(null)
        showSuccess(
          'Lampiran dihapus',
          'PDF telah dilepas dari DIP dan tidak lagi tersedia untuk publik.',
        )
      }
    } catch (error) {
      showError(error, 'Lampiran DIP tidak dapat dihapus.')
    }
  }

  async function publishPdf(dipId: string) {
    if (
      submitting ||
      !window.confirm(
        'Terbitkan PDF ini ke portal publik? Pastikan isi, aksesibilitas, dan data pribadi sudah ditinjau.',
      )
    )
      return
    setSubmitting(true)
    try {
      const result = await publishDipDocument({ data: { dipId } })
      if (result.ok)
        showSuccess(
          'PDF telah diterbitkan',
          'Dokumen sekarang tersedia untuk diunduh dari portal publik.',
        )
    } catch (error) {
      showError(error, 'PDF tidak dapat diterbitkan.')
    }
  }

  return (
    <AdminShell actor={data.actor} activePath="/admin/dokumen">
      <main className="admin-content" id="isi-admin">
        <section
          className="admin-page-heading"
          aria-labelledby="documents-title"
        >
          <div>
            <h1 id="documents-title">Kelola dokumen dan DIP</h1>
            <p>
              Kelola register Daftar Informasi Publik, metadata, dan berkas PDF
              dalam satu tempat.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} type="button">
            <FilePlus2 aria-hidden="true" /> Tambah dokumen
          </Button>
        </section>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="admin-create-document-dialog">
            <DialogHeader>
              <DialogTitle>Tambah dokumen baru</DialogTitle>
            </DialogHeader>
            <DocumentForm
              categories={data.categories}
              dipGroups={data.dipGroups}
              idPrefix="create-document"
              isSubmitting={submitting}
              mode="create"
              onCancel={() => setCreateOpen(false)}
              onSubmit={submitDocument}
            />
          </DialogContent>
        </Dialog>
        <section
          className="admin-dip-register"
          aria-labelledby="dip-register-title"
        >
          <div className="admin-dip-register-heading">
            <div>
              <h2 id="dip-register-title">Daftar Informasi Publik</h2>
              <p>{data.dipItems.length} entri aktif dalam register.</p>
            </div>
            <label className="admin-search">
              <span className="sr-only">Cari entri DIP</span>
              <Input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul atau kata kunci"
                type="search"
                value={query}
              />
            </label>
          </div>
          <div className="admin-table-wrap">
            <Table className="admin-table admin-dip-table">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Informasi</TableHead>
                  <TableHead scope="col">Kategori</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dipItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell data-label="Informasi">
                      <strong>{item.officialTitle}</strong>
                    </TableCell>
                    <TableCell data-label="Kategori">
                      <Badge variant="secondary">
                        {disclosureCategoryLabels[item.disclosureCategory]}
                      </Badge>
                    </TableCell>
                    <TableCell data-label="Status">
                      <Badge
                        variant={
                          item.documentPublicationState === 'published'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {item.documentPublicationState === 'published'
                          ? 'Terbit'
                          : 'Draf'}
                      </Badge>
                    </TableCell>
                    <TableCell className="admin-row-action" data-label="Aksi">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={`Aksi untuk ${item.officialTitle}`}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <MoreHorizontal aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.documentId &&
                          item.documentPublicationState !== 'published' &&
                          canPublish ? (
                            <DropdownMenuItem
                              onSelect={() => void publishPdf(item.id)}
                            >
                              <FileCheck2 aria-hidden="true" /> Terbitkan PDF
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onSelect={() => setSelectedDipId(item.id)}
                          >
                            <Pencil aria-hidden="true" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="admin-dropdown-delete"
                            onSelect={() => void archiveDip(item.id)}
                          >
                            <Trash2 aria-hidden="true" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {dipItems.length === 0 ? (
              <p className="admin-empty-result">Tidak ada DIP yang sesuai.</p>
            ) : null}
          </div>
        </section>

        {selectedDip ? (
          <Dialog
            open={Boolean(selectedDip)}
            onOpenChange={(open) => {
              if (!open) setSelectedDipId(null)
            }}
          >
            <DialogContent className="admin-dip-edit-dialog">
              <DialogHeader>
                <DialogTitle>Edit DIP</DialogTitle>
              </DialogHeader>
              <DocumentForm
                idPrefix="edit-dip"
                isSubmitting={submitting}
                mode="edit-dip"
                dipGroups={data.dipGroups}
                onCancel={() => setSelectedDipId(null)}
                onRemoveAttachment={() => void removeAttachment()}
                onSubmit={saveDip}
                recordId={selectedDip.id}
                values={selectedDip}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </main>
    </AdminShell>
  )
}
