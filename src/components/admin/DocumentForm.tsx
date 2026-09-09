import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react'
import { FilePlus2, FileText, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Category = { id: string; title: string }
type DipGroup = { id: string; code: string; title: string }
type DocumentFormValues = {
  attachmentName?: string | null
  attachmentSize?: number | null
  description?: string
  keywords?: string[]
  officialTitle?: string
  groupId?: string
  publishDate?: string | null
}

type DocumentFormProps = {
  categories?: Category[]
  dipGroups?: DipGroup[]
  idPrefix: string
  isSubmitting: boolean
  mode: 'create' | 'edit-dip'
  onCancel: () => void
  onRemoveAttachment?: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  recordId?: string
  values?: DocumentFormValues
}

export function DocumentForm({
  categories = [],
  dipGroups = [],
  idPrefix,
  isSubmitting,
  mode,
  onCancel,
  onRemoveAttachment,
  onSubmit,
  recordId,
  values,
}: Readonly<DocumentFormProps>) {
  const isCreate = mode === 'create'
  const titleId = `${idPrefix}-title`
  const titleName = isCreate ? 'title' : 'officialTitle'

  return (
    <form className="admin-document-form" onSubmit={onSubmit}>
      {!isCreate && recordId ? (
        <input name="dipId" type="hidden" value={recordId} />
      ) : null}
      <div>
        <Label htmlFor={titleId}>
          {isCreate ? 'Judul dokumen' : 'Judul informasi'}
        </Label>
        <Input
          defaultValue={values?.officialTitle ?? ''}
          id={titleId}
          name={titleName}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-description`}>Deskripsi Dokumen</Label>
        <Textarea
          defaultValue={values?.description ?? ''}
          id={`${idPrefix}-description`}
          maxLength={5000}
          name="description"
          placeholder="Ringkasan isi dan konteks dokumen"
          rows={4}
        />
      </div>
      {isCreate ? (
        <div>
          <Label htmlFor={`${idPrefix}-category`}>Kategori</Label>
          <Select defaultValue="" name="categoryId" required>
            <SelectTrigger id={`${idPrefix}-category`}>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div>
        <Label htmlFor={`${idPrefix}-group`}>Grup</Label>
        <Select defaultValue={values?.groupId ?? ''} name="groupId" required>
          <SelectTrigger id={`${idPrefix}-group`}>
            <SelectValue placeholder="Pilih grup" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dipGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.code}. {group.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-publish-date`}>Tanggal publikasi</Label>
        <Input
          defaultValue={values?.publishDate ?? ''}
          id={`${idPrefix}-publish-date`}
          name="publishDate"
          type="date"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-keywords`}>Kata kunci</Label>
        <Input
          defaultValue={values?.keywords?.join(', ') ?? ''}
          id={`${idPrefix}-keywords`}
          name="keywords"
          placeholder="Contoh: anggaran, laporan, 2026"
        />
      </div>
      {values?.attachmentName ? (
        <div className="admin-existing-attachment">
          <div>
            <FileText aria-hidden="true" />
            <span>
              <strong>Lampiran saat ini</strong>
              <small>
                {values.attachmentName}
                {values.attachmentSize
                  ? ` · ${Math.ceil(values.attachmentSize / 1024)} KB`
                  : ''}
              </small>
            </span>
          </div>
          {onRemoveAttachment ? (
            <Button
              onClick={onRemoveAttachment}
              type="button"
              variant="destructive"
            >
              <Trash2 aria-hidden="true" /> Hapus lampiran
            </Button>
          ) : null}
        </div>
      ) : null}
      <FileUploadZone id={`${idPrefix}-file`} name="file" required={isCreate} />
      <div className="admin-edit-actions">
        <Button disabled={isSubmitting} type="submit">
          <FilePlus2 aria-hidden="true" />
          {isSubmitting
            ? isCreate
              ? 'Mengunggah…'
              : 'Menyimpan…'
            : isCreate
              ? 'Simpan sebagai draf'
              : 'Simpan perubahan'}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Batal
        </Button>
      </div>
    </form>
  )
}

function FileUploadZone({
  id,
  name,
  required,
}: Readonly<{ id: string; name: string; required: boolean }>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function setFile(file: File | undefined) {
    if (!file) return
    const transfer = new DataTransfer()
    transfer.items.add(file)
    if (inputRef.current) inputRef.current.files = transfer.files
    setSelectedFile(file)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    setFile(event.dataTransfer.files[0])
  }

  return (
    <div className="admin-upload-field">
      <Label htmlFor={id}>{required ? 'Berkas PDF' : 'PDF (opsional)'}</Label>
      <Input
        ref={inputRef}
        accept="application/pdf,.pdf"
        className="sr-only"
        id={id}
        name={name}
        onChange={handleChange}
        required={required}
        type="file"
      />
      <label
        className={
          isDragging ? 'admin-upload-zone is-dragging' : 'admin-upload-zone'
        }
        htmlFor={id}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload aria-hidden="true" />
        <strong>{selectedFile?.name ?? 'Tarik PDF atau pilih berkas'}</strong>
        <span>
          {selectedFile
            ? `${Math.ceil(selectedFile.size / 1024)} KB dipilih`
            : 'PDF saja · ukuran maksimum 10 MB'}
        </span>
      </label>
    </div>
  )
}
