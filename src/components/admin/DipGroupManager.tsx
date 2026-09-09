import { useState, type FormEvent } from 'react'
import { FolderPlus, Pencil } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createDipGroup,
  updateDipGroup,
  type AdminDipGroup,
  type AdminDipGroupsData,
} from '@/modules/documents/admin-dip-groups'

export function DipGroupManager({
  data,
}: Readonly<{ data: AdminDipGroupsData }>) {
  const [editing, setEditing] = useState<AdminDipGroup | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  if (data.access === 'denied')
    return (
      <p className="admin-access-denied">Akses administrasi tidak tersedia.</p>
    )

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setNotice(null)
    try {
      const form = new FormData(event.currentTarget)
      const result = editing
        ? await updateDipGroup({ data: form })
        : await createDipGroup({ data: form })
      if (result.ok) window.location.reload()
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Kategori DIP tidak dapat disimpan.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function openCreateForm() {
    setEditing(null)
    setNotice(null)
    setFormOpen(true)
  }

  function openEditForm(group: AdminDipGroup) {
    setEditing(group)
    setNotice(null)
    setFormOpen(true)
  }

  function closeForm() {
    if (submitting) return
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <AdminShell actor={data.actor} activePath="/admin/kategori-dip">
      <main className="admin-content" id="isi-admin">
        <section
          className="admin-page-heading"
          aria-labelledby="dip-groups-title"
        >
          <div>
            <p className="admin-eyebrow">Taksonomi register</p>
            <h1 id="dip-groups-title">Kategori kelompok DIP</h1>
            <p>
              Atur kelompok yang digunakan untuk mengelompokkan entri Daftar
              Informasi Publik.
            </p>
          </div>
          <Button onClick={openCreateForm} type="button">
            <FolderPlus aria-hidden="true" /> Tambah kategori
          </Button>
        </section>
        <section aria-label="Kelola kategori DIP">
          <div className="admin-table-wrap">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Kode</TableHead>
                  <TableHead scope="col">Kategori</TableHead>
                  <TableHead scope="col">Entri aktif</TableHead>
                  <TableHead scope="col">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell data-label="Kode">
                      <strong>{group.code}</strong>
                    </TableCell>
                    <TableCell data-label="Kategori">{group.title}</TableCell>
                    <TableCell data-label="Entri aktif">
                      {group.itemCount}
                    </TableCell>
                    <TableCell className="admin-row-action" data-label="Aksi">
                      <Button
                        aria-label={`Edit kategori ${group.title}`}
                        onClick={() => openEditForm(group)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            if (!open) closeForm()
          }}
        >
          <DialogContent className="admin-dip-group-dialog">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit kategori DIP' : 'Tambah kategori DIP'}
              </DialogTitle>
            </DialogHeader>
            {notice ? (
              <Alert variant="destructive">
                <AlertTitle>Perubahan belum disimpan</AlertTitle>
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            ) : null}
            <DipGroupForm
              key={editing?.id ?? 'create'}
              editing={editing}
              isSubmitting={submitting}
              onCancel={closeForm}
              onSubmit={save}
            />
          </DialogContent>
        </Dialog>
      </main>
    </AdminShell>
  )
}

function DipGroupForm({
  editing,
  isSubmitting,
  onCancel,
  onSubmit,
}: Readonly<{
  editing: AdminDipGroup | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}>) {
  return (
    <form className="admin-document-form" onSubmit={onSubmit}>
      {editing ? <input name="id" type="hidden" value={editing.id} /> : null}
      <div>
        <Label htmlFor="dip-group-code">Kode</Label>
        <Input
          defaultValue={editing?.code ?? ''}
          id="dip-group-code"
          maxLength={12}
          name="code"
          pattern="[A-Z][A-Z0-9_-]{0,11}"
          required
        />
      </div>
      <div>
        <Label htmlFor="dip-group-title">Nama kategori</Label>
        <Input
          defaultValue={editing?.title ?? ''}
          id="dip-group-title"
          maxLength={160}
          name="title"
          required
        />
      </div>
      <div className="admin-edit-actions">
        <Button disabled={isSubmitting} type="submit">
          <FolderPlus aria-hidden="true" />
          {isSubmitting ? 'Menyimpan…' : 'Simpan kategori'}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Batal
        </Button>
      </div>
    </form>
  )
}
