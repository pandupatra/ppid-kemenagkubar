import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ToastVariant = 'default' | 'destructive' | 'success'

export type ToastInput = {
  description?: ReactNode
  duration?: number
  title: string
  variant?: ToastVariant
}

type ToastItem = ToastInput & { id: number }

type ToastContextValue = {
  dismiss: (id: number) => void
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ duration = 6_000, variant = 'default', ...input }: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1_000)
      setToasts((current) => [...current, { ...input, id, variant }])
      window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ dismiss, toast }), [dismiss, toast])

  return (
    <ToastContext value={value}>
      {children}
      <aside
        aria-label="Notifikasi"
        className="pointer-events-none fixed right-4 bottom-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </aside>
    </ToastContext>
  )
}

export function useToast() {
  const context = use(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider.')
  return context
}

function Toast({
  item,
  onDismiss,
}: Readonly<{ item: ToastItem; onDismiss: () => void }>) {
  const Icon =
    item.variant === 'destructive'
      ? TriangleAlert
      : item.variant === 'success'
        ? CheckCircle2
        : Info
  const color =
    item.variant === 'destructive'
      ? 'border-destructive/50 text-destructive'
      : item.variant === 'success'
        ? 'border-primary/35 text-primary-deep'
        : 'border-border text-foreground'

  return (
    <section
      aria-live={item.variant === 'destructive' ? 'assertive' : 'polite'}
      className={`pointer-events-auto grid grid-cols-[auto_1fr_auto] gap-x-3 rounded-lg border bg-card p-4 shadow-lg ${color}`}
      role={item.variant === 'destructive' ? 'alert' : 'status'}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5" />
      <div className="min-w-0">
        <p className="font-semibold">{item.title}</p>
        {item.description ? (
          <div className="mt-1 text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground">
            {item.description}
          </div>
        ) : null}
      </div>
      <Button
        aria-label="Tutup notifikasi"
        className="-mr-2 -mt-2"
        onClick={onDismiss}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" />
      </Button>
    </section>
  )
}
