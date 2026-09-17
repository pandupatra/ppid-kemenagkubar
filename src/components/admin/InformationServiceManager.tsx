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
  createInformationServiceDocument,
  deleteInformationServiceDocument,
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

type InformationServiceKind = 'procedure' | 'announcement'

const informationServicePages = {
  procedure: {
    heading: 'Tata Cara',
    description: 'Kelola PDF dan diagram PNG Tata Cara layanan informasi.',
    path: '/admin/layanan-informasi/tata-cara',
  },
  announcement: {
    heading: 'Standar Pengumuman',
    description: 'Kelola PDF dan diagram PNG Standar Pengumuman.',
    path: '/admin/layanan-informasi/standar-pengumuman',
  },
} as const

export function InformationServiceManager({
  data,
  kind,
}: Readonly<{ data: Data; kind: InformationServiceKind }>) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] =
    useState<AdminInformationServiceDocument | null>(null)
  const [creatingKind, setCreatingKind] = useState<
    'procedure' | 'announcement' | null
  >(null)
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
  const page = informationServicePages[kind]
  async function done(title: string, description: string) {
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
      const result = await replaceInformationServiceDocument({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setSelected(null)
        await done(
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
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!creatingKind || submitting) return
    setSubmitting(true)
    try {
      const result = await createInformationServiceDocument({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setCreatingKind(null)
        await done(
          'Dokumen ditambahkan',
          'Berkas disimpan sebagai draf dan menunggu publikasi.',
        )
      }
    } catch (error) {
      toast({
        title: 'Dokumen belum ditambahkan',
        description:
          error instanceof Error
            ? error.message
            : 'Berkas tidak dapat disimpan.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function publish(id: string) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await publishInformationServiceDocument({ data: { id } })
      if (result.ok)
        await done(
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
  async function remove(document: AdminInformationServiceDocument) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await deleteInformationServiceDocument({
        data: { id: document.id },
      })
      if (result.ok)
        await done(
          'Dokumen dihapus',
          'Dokumen telah dihapus dari layanan informasi.',
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
    <AdminShell actor={data.actor} activePath={page.path}>
      <main className="admin-content" id="isi-admin">
        <AdminConfirmDialog
          confirmation={confirmation}
          onCancel={() => setConfirmation(null)}
          pending={submitting}
        />
        <section className="admin-page-heading">
          <div>
            <h1>{page.heading}</h1>
            <p>{page.description}</p>
          </div>
        </section>
        {[[kind, page.heading] as const].map(([currentKind, heading]) => (
          <section className="admin-dip-register" key={currentKind}>
            <div className="admin-dip-register-heading">
              <h2>{heading}</h2>
              <Button
                variant="outline"
                onClick={() => setCreatingKind(currentKind)}
              >
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
                  {data.documents
                    .filter((document) => document.kind === currentKind)
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
                              onClick={() =>
                                setConfirmation({
                                  title: 'Terbitkan dokumen?',
                                  description: `“${document.title}” akan tersedia pada halaman layanan informasi publik.`,
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
        ))}
        <Dialog
          open={Boolean(creatingKind)}
          onOpenChange={(open) => !open && setCreatingKind(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Tambah dokumen{' '}
                {creatingKind === 'procedure'
                  ? 'Tata Cara'
                  : 'Standar Pengumuman'}
              </DialogTitle>
            </DialogHeader>
            {creatingKind ? (
              <form className="admin-document-form" onSubmit={create}>
                <input type="hidden" name="kind" value={creatingKind} />
                <div>
                  <Label htmlFor="new-information-title">Judul dokumen</Label>
                  <Input id="new-information-title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="new-information-file">
                    Berkas PDF, PNG, atau JPG
                  </Label>
                  <Input
                    id="new-information-file"
                    name="file"
                    accept="application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
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
                    onClick={() => setCreatingKind(null)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : null}
          </DialogContent>
        </Dialog>
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
                    Berkas PDF, PNG, atau JPG pengganti
                  </Label>
                  <Input
                    id="information-file"
                    name="file"
                    accept="application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
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
