import { useState, type FormEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { FileCheck2, Image, Pencil, Plus, Trash2 } from 'lucide-react'
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
  replaceServiceCharterImage,
  type ServiceCharterImage,
} from '@/modules/documents/service-charter'
import {
  createServiceStandardDocument,
  deleteServiceStandardDocument,
  publishServiceStandardDocument,
  replaceServiceStandardDocument,
  type AdminServiceStandardDocument,
} from '@/modules/documents/service-standards'

type Data =
  | {
      standards: { access: 'denied' }
      charter:
        { access: 'denied' } | { access: 'granted'; image: ServiceCharterImage }
    }
  | {
      standards: {
        access: 'granted'
        actor: { displayName: string; roles: string[] }
        documents: AdminServiceStandardDocument[]
      }
      charter:
        { access: 'denied' } | { access: 'granted'; image: ServiceCharterImage }
    }

type ServiceStandardSection = 'charter' | 'sop' | 'policy'

const serviceStandardPages = {
  charter: {
    heading: 'Maklumat Pelayanan',
    description: 'Kelola gambar Maklumat Pelayanan pada portal publik.',
    path: '/admin/standar-layanan/maklumat-pelayanan',
  },
  sop: {
    heading: 'SOP',
    description: 'Kelola dokumen SOP layanan publik.',
    path: '/admin/standar-layanan/sop',
  },
  policy: {
    heading: 'Kebijakan',
    description: 'Kelola dokumen kebijakan layanan publik.',
    path: '/admin/standar-layanan/kebijakan',
  },
} as const

export function ServiceStandardManager({
  data,
  section,
}: Readonly<{ data: Data; section: ServiceStandardSection }>) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<AdminServiceStandardDocument | null>(
    null,
  )
  const [creatingKind, setCreatingKind] = useState<'sop' | 'policy' | null>(
    null,
  )
  const [editingCharter, setEditingCharter] = useState(false)
  const [confirmation, setConfirmation] = useState<AdminConfirmation | null>(
    null,
  )
  const [submitting, setSubmitting] = useState(false)
  if (data.standards.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )
  const { actor, documents } = data.standards
  const charterImage =
    data.charter.access === 'granted' ? data.charter.image : null
  const canPublish = actor.roles.some((role) =>
    ['reviewer', 'ppid_supervisor', 'administrator'].includes(role),
  )
  const page = serviceStandardPages[section]
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
      const result = await replaceServiceStandardDocument({
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
    if (!creatingKind || submitting) return
    setSubmitting(true)
    try {
      const result = await createServiceStandardDocument({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setCreatingKind(null)
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
  async function submitCharter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await replaceServiceCharterImage({
        data: new FormData(event.currentTarget),
      })
      if (result.ok) {
        setEditingCharter(false)
        await finish(
          'Maklumat Pelayanan diperbarui',
          'Gambar baru sekarang tampil pada portal publik.',
        )
      }
    } catch (error) {
      toast({
        title: 'Gambar belum disimpan',
        description:
          error instanceof Error
            ? error.message
            : 'Maklumat Pelayanan tidak dapat diperbarui.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }
  async function publish(id: string) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await publishServiceStandardDocument({ data: { id } })
      if (result.ok)
        await finish(
          'PDF diterbitkan',
          'Dokumen sekarang tersedia pada halaman standar layanan.',
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
  async function remove(document: AdminServiceStandardDocument) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await deleteServiceStandardDocument({
        data: { id: document.id },
      })
      if (result.ok)
        await finish(
          'Dokumen dihapus',
          'Dokumen telah dihapus dari standar layanan.',
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
    <AdminShell actor={actor} activePath={page.path}>
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
        {section === 'charter' ? (
          <section className="admin-dip-register">
            <div className="admin-dip-register-heading">
              <div>
                <h2>Maklumat Pelayanan</h2>
                <p>Gambar yang ditampilkan pada portal publik.</p>
              </div>
              {charterImage ? (
                <Button
                  variant="outline"
                  onClick={() => setEditingCharter(true)}
                >
                  <Pencil aria-hidden="true" /> Perbarui gambar
                </Button>
              ) : null}
            </div>
            {charterImage ? (
              <div className="admin-charter-preview">
                <img src={charterImage.src} alt={charterImage.alt} />
                <div>
                  <strong>{charterImage.fileName ?? 'Gambar portal'}</strong>
                  <p>{charterImage.alt}</p>
                </div>
              </div>
            ) : (
              <p className="admin-empty-copy">
                Anda tidak memiliki akses untuk mengubah gambar ini.
              </p>
            )}
          </section>
        ) : null}
        {section !== 'charter'
          ? [[section, page.heading] as const].map(([kind, heading]) => (
              <section className="admin-dip-register" id={kind} key={kind}>
                <div className="admin-dip-register-heading">
                  <h2>{heading}</h2>
                  <Button
                    variant="outline"
                    onClick={() => setCreatingKind(kind)}
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
                      {documents
                        .filter((document) => document.kind === kind)
                        .map((document) => (
                          <tr key={document.id}>
                            <td>
                              <strong>{document.title}</strong>
                              <br />
                              <small>
                                {document.attachmentName ?? 'PDF awal portal'}
                              </small>
                            </td>
                            <td>
                              <Badge
                                variant={
                                  document.publicationState === 'published' ||
                                  !document.publicationState
                                    ? 'default'
                                    : 'outline'
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
                                      description: `“${document.title}” akan tersedia pada halaman standar layanan publik.`,
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
            ))
          : null}
        <Dialog
          open={Boolean(creatingKind)}
          onOpenChange={(open) => !open && setCreatingKind(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Tambah dokumen {creatingKind === 'sop' ? 'SOP' : 'Kebijakan'}
              </DialogTitle>
            </DialogHeader>
            {creatingKind ? (
              <form className="admin-document-form" onSubmit={create}>
                <input type="hidden" name="kind" value={creatingKind} />
                <div>
                  <Label htmlFor="new-standard-title">Judul dokumen</Label>
                  <Input id="new-standard-title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="new-standard-file">Berkas PDF atau JPG</Label>
                  <Input
                    id="new-standard-file"
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
          open={editingCharter}
          onOpenChange={(open) => !open && setEditingCharter(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perbarui Maklumat Pelayanan</DialogTitle>
            </DialogHeader>
            {charterImage ? (
              <form className="admin-document-form" onSubmit={submitCharter}>
                <div>
                  <Label htmlFor="charter-file">Gambar pengganti</Label>
                  <Input
                    id="charter-file"
                    name="file"
                    accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                    type="file"
                    required
                    aria-describedby="charter-file-hint"
                  />
                  <small id="charter-file-hint">
                    PNG, JPG, atau WebP. Ukuran maksimum 8 MB.
                  </small>
                </div>
                <div>
                  <Label htmlFor="charter-alt">Deskripsi gambar</Label>
                  <Input
                    id="charter-alt"
                    name="alt"
                    defaultValue={charterImage.alt}
                    maxLength={240}
                    required
                  />
                </div>
                <div className="admin-edit-actions">
                  <Button disabled={submitting} type="submit">
                    <Image aria-hidden="true" />
                    {submitting ? 'Mengunggah…' : 'Simpan dan tampilkan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingCharter(false)}
                    disabled={submitting}
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
              <DialogTitle>Perbarui dokumen standar layanan</DialogTitle>
            </DialogHeader>
            {selected ? (
              <form className="admin-document-form" onSubmit={submit}>
                <input type="hidden" name="id" value={selected.id} />
                <div>
                  <Label htmlFor="standard-title">Judul dokumen</Label>
                  <Input
                    id="standard-title"
                    name="title"
                    defaultValue={selected.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="standard-file">
                    Berkas PDF atau JPG pengganti
                  </Label>
                  <Input
                    id="standard-file"
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
