import { AlertTriangle, FileCheck2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type AdminConfirmation = {
  confirmLabel: string
  description: string
  onConfirm: () => Promise<void>
  title: string
  variant?: 'default' | 'destructive'
}

export function AdminConfirmDialog({
  confirmation,
  onCancel,
  pending,
}: Readonly<{
  confirmation: AdminConfirmation | null
  onCancel: () => void
  pending: boolean
}>) {
  const destructive = confirmation?.variant === 'destructive'

  return (
    <Dialog
      open={Boolean(confirmation)}
      onOpenChange={(open) => {
        if (!open && !pending) onCancel()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div
            className={
              destructive
                ? 'mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                : 'mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'
            }
          >
            {destructive ? (
              <AlertTriangle aria-hidden="true" className="size-5" />
            ) : (
              <FileCheck2 aria-hidden="true" className="size-5" />
            )}
          </div>
          <DialogTitle>
            {confirmation?.title ?? 'Konfirmasi tindakan'}
          </DialogTitle>
          <DialogDescription>
            {confirmation?.description ?? 'Pastikan tindakan ini sudah benar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            autoFocus
            disabled={pending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Batal
          </Button>
          <Button
            disabled={pending}
            onClick={() => void confirmation?.onConfirm()}
            type="button"
            variant={destructive ? 'destructive' : 'default'}
          >
            {pending ? 'Memproses…' : confirmation?.confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
