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
  publishInformationServiceDocument,
  replaceInformationServiceDocument,
  type AdminInformationServiceDocument,
} from '@/modules/documents/information-services'

type Data =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      documents: AdminInformationServiceDocument[]
    }

export function InformationServiceManager({ data }: Readonly<{ data: Data }>) {
  const { toast } = useToast()
  const [selected, setSelected] =
    useState<AdminInformationServiceDocument | null>(null)
  const [submitting, setSubmitting] = useState(false)
  if (data.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )
  const canPublish = data.actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
  const groups = [
    ['procedure', 'Tata Cara'],
    ['announcement', 'Standar Pengumuman'],
  ] as const
  function done(title: string, description: string) {
    toast({ title, description, variant: 'success' })
    window.setTimeout(() => window.location.reload(), 1_200)
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const result = await replaceInformationServiceDocument({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setSelected(null)
        done(
          'Berkas diperbarui',
          'Dokumen disimpan sebagai draf dan menunggu publikasi.',
        )
      }
    } catch (error) {
      toast({
        title: 'Perubahan belum disimpan',
        description:
          error instanceof Error
            ? error.message
            : 'Berkas tidak dapat diperbarui.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function publish(id: string) {
    if (submitting || !window.confirm('Terbitkan berkas ini untuk publik?'))
      return
    setSubmitting(true)
    try {
      const result = await publishInformationServiceDocument({ data: { id } })
      if (result.ok)
        done(
          'Berkas diterbitkan',
          'Dokumen sekarang tersedia pada halaman layanan informasi.',
        )
    } catch (error) {
      toast({
        title: 'Penerbitan gagal',
        description:
          error instanceof Error
            ? error.message
            : 'Berkas tidak dapat diterbitkan.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  return (
    <AdminShell actor={data.actor} activePath="/admin/layanan-informasi">
      <main className="admin-content" id="isi-admin">
        <section className="admin-page-heading">
          <div>
            <h1>Kelola layanan informasi</h1>
            <p>
              Perbarui PDF dan diagram PNG Tata Cara atau Standar Pengumuman.
            </p>
          </div>
        </section>
        {groups.map(([kind, heading]) => (
          <section className="admin-dip-register" id={kind} key={kind}>
            <div className="admin-dip-register-heading">
              <h2>{heading}</h2>
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
                  {data.documents
                    .filter((document) => document.kind === kind)
                    .map((document) => (
                      <tr key={document.id}>
                        <td>
                          <strong>{document.title}</strong>
                          <br />
                          <small>
                            {document.attachmentName ?? 'Belum ada berkas'}
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
                              : 'Terbit'}
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
                          {document.publicationState === 'draft' &&
                          canPublish ? (
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
        ))}
        <Dialog
          open={Boolean(selected)}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perbarui dokumen layanan informasi</DialogTitle>
            </DialogHeader>
            {selected ? (
              <form className="admin-document-form" onSubmit={submit}>
                <input type="hidden" name="id" value={selected.id} />
                <div>
                  <Label htmlFor="information-title">Judul dokumen</Label>
                  <Input
                    id="information-title"
                    name="title"
                    defaultValue={selected.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="information-file">
                    Berkas PDF atau PNG pengganti
                  </Label>
                  <Input
                    id="information-file"
                    name="file"
                    accept="application/pdf,.pdf,image/png,.png"
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
