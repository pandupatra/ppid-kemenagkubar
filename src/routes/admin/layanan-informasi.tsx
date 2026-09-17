import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/layanan-informasi')({
  component: Outlet,
})
