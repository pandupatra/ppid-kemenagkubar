import { useState, type FormEvent } from 'react'
import { FileCheck2, Pencil } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
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
  const { toast } = useToast()
  const [selected, setSelected] = useState<AdminDocumentReport | null>(null)
  const [submitting, setSubmitting] = useState(false)
  if (data.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )
  const canPublish = data.actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
  const finish = (title: string, description: string) => {
    toast({ title, description, variant: 'success' })
    window.setTimeout(() => window.location.reload(), 1_200)
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
        finish(
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
  async function publish(id: string) {
    if (submitting || !window.confirm('Terbitkan PDF ini untuk publik?')) return
    setSubmitting(true)
    try {
      const result = await publishDocumentReport({ data: { id } })
      if (result.ok)
        finish(
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
  return (
    <AdminShell actor={data.actor} activePath="/admin/dokumen-laporan">
      <main className="admin-content" id="isi-admin">
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
                          onClick={() => void publish(document.id)}
                        >
                          <FileCheck2 aria-hidden="true" /> Terbitkan
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
                  <Label htmlFor="report-file">Berkas PDF pengganti</Label>
                  <Input
                    id="report-file"
                    name="file"
                    accept="application/pdf,.pdf"
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
