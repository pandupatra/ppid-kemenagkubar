import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/standar-layanan/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/standar-layanan/maklumat-pelayanan' })
  },
})
