import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/layanan-informasi/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/layanan-informasi/tata-cara' })
  },
})
