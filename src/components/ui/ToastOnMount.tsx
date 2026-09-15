import { useEffect, useRef } from 'react'
import { useToast, type ToastInput } from '@/components/ui/toast'

export function ToastOnMount({ input }: Readonly<{ input: ToastInput }>) {
  const { toast } = useToast()
  const hasShown = useRef(false)

  useEffect(() => {
    if (hasShown.current) return
    hasShown.current = true
    toast(input)
  }, [input, toast])

  return null
}
