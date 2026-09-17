import { useState, type FormEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { FileCheck2, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import {
  AdminConfirmDialog,
  type AdminConfirmation,
} from '@/components/admin/AdminConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import {
  createDocumentReport,
  deleteDocumentReport,
  publishDocumentReport,
  saveDocumentReport,
  type AdminDocumentReport,
} from '@/modules/documents/document-reports'

type Data =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      documents: AdminDocumentReport[]
    }

export function DocumentReportsManager({ data }: Readonly<{ data: Data }>) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<AdminDocumentReport | null>(null)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<AdminConfirmation | null>(
    null,
  )
  if (data.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )
  const canPublish = data.actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
  const finish = async (title: string, description: string) => {
    setConfirmation(null)
    toast({ title, description, variant: 'success' })
    try {
      await router.invalidate()
    } catch {
      toast({
        title: 'Data terbaru belum dimuat',
        description:
          'Tindakan berhasil, tetapi daftar belum dapat diperbarui. Buka kembali halaman ini untuk mencoba lagi.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const result = await saveDocumentReport({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setSelected(null)
        await finish(
          'PDF diperbarui',
          'Dokumen disimpan sebagai draf dan menunggu publikasi.',
        )
      }
    } catch (error) {
      toast({
        title: 'Perubahan belum disimpan',
        description:
          error instanceof Error
            ? error.message
            : 'PDF tidak dapat diperbarui.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await createDocumentReport({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setCreating(false)
        await finish(
          'Dokumen ditambahkan',
          'PDF disimpan sebagai draf dan menunggu publikasi.',
        )
      }
    } catch (error) {
      toast({
        title: 'Dokumen belum ditambahkan',
        description:
          error instanceof Error ? error.message : 'PDF tidak dapat disimpan.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function publish(id: string) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await publishDocumentReport({ data: { id } })
      if (result.ok)
        await finish(
          'PDF diterbitkan',
          'Dokumen sekarang tersedia pada halaman Dokumen & Laporan.',
        )
    } catch (error) {
      toast({
        title: 'Penerbitan gagal',
        description:
          error instanceof Error
            ? error.message
            : 'PDF tidak dapat diterbitkan.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function remove(document: AdminDocumentReport) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await deleteDocumentReport({ data: { id: document.id } })
      if (result.ok)
        await finish(
          'Dokumen dihapus',
          'Dokumen telah dihapus dari Dokumen & Laporan.',
        )
    } catch (error) {
      toast({
        title: 'Dokumen belum dihapus',
        description:
          error instanceof Error
            ? error.message
            : 'Dokumen tidak dapat dihapus.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  return (
    <AdminShell actor={data.actor} activePath="/admin/dokumen-laporan">
      <main className="admin-content" id="isi-admin">
        <AdminConfirmDialog
          confirmation={confirmation}
          onCancel={() => setConfirmation(null)}
          pending={submitting}
        />
        <section className="admin-page-heading">
          <div>
            <h1>Kelola dokumen & laporan</h1>
            <p>
              Perbarui PDF sumber. Perubahan baru perlu diterbitkan oleh
              reviewer.
            </p>
          </div>
        </section>
        <section className="admin-dip-register">
          <div className="admin-dip-register-heading">
            <h2>Dokumen & laporan</h2>
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus aria-hidden="true" /> Tambah dokumen
            </Button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dokumen</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.documents.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <strong>{document.title}</strong>
                      <br />
                      <small>
                        {document.attachmentName ?? 'PDF awal belum diimpor'}
                      </small>
                    </td>
                    <td>
                      <Badge
                        variant={
                          document.publicationState === 'draft'
                            ? 'outline'
                            : 'default'
                        }
                      >
                        {document.publicationState === 'draft'
                          ? 'Draf'
                          : document.publicationState === 'published'
                            ? 'Terbit'
                            : 'Belum diunggah'}
                      </Badge>
                    </td>
                    <td className="admin-row-action">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(document)}
                      >
                        <Pencil aria-hidden="true" /> Perbarui
                      </Button>
                      {document.publicationState === 'draft' && canPublish ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setConfirmation({
                              title: 'Terbitkan dokumen?',
                              description: `“${document.title}” akan tersedia pada halaman Dokumen & Laporan.`,
                              confirmLabel: 'Terbitkan',
                              onConfirm: () => publish(document.id),
                            })
                          }
                        >
                          <FileCheck2 aria-hidden="true" /> Terbitkan
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={submitting}
                        onClick={() =>
                          setConfirmation({
                            title: 'Hapus dokumen?',
                            description: `“${document.title}” akan dihapus dari portal dan tidak dapat dipulihkan dari halaman admin.`,
                            confirmLabel: 'Hapus dokumen',
                            onConfirm: () => remove(document),
                            variant: 'destructive',
                          })
                        }
                      >
                        <Trash2 aria-hidden="true" /> Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <Dialog
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah dokumen atau laporan</DialogTitle>
            </DialogHeader>
            <form className="admin-document-form" onSubmit={create}>
              <div>
                <Label htmlFor="new-report-title">Judul dokumen</Label>
                <Input id="new-report-title" name="title" required />
              </div>
              <div>
                <Label htmlFor="new-report-file">Berkas PDF atau JPG</Label>
                <Input
                  id="new-report-file"
                  name="file"
                  accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg"
                  type="file"
                  required
                />
              </div>
              <div className="admin-edit-actions">
                <Button disabled={submitting} type="submit">
                  {submitting ? 'Mengunggah…' : 'Simpan sebagai draf'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setCreating(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(selected)}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perbarui dokumen atau laporan</DialogTitle>
            </DialogHeader>
            {selected ? (
              <form className="admin-document-form" onSubmit={submit}>
                <input type="hidden" name="id" value={selected.id} />
                <div>
                  <Label htmlFor="report-title">Judul dokumen</Label>
                  <Input
                    id="report-title"
                    name="title"
                    defaultValue={selected.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="report-file">
                    Berkas PDF atau JPG pengganti
                  </Label>
                  <Input
                    id="report-file"
                    name="file"
                    accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg"
                    type="file"
                    required
                  />
                </div>
                <div className="admin-edit-actions">
                  <Button disabled={submitting} type="submit">
                    {submitting ? 'Mengunggah…' : 'Simpan sebagai draf'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelected(null)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </AdminShell>
  )
}
