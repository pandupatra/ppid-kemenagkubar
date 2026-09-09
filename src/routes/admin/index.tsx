import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { getAdminDashboard } from '@/modules/admin/dashboard'

export const Route = createFileRoute('/admin/')({
  loader: () => getAdminDashboard(),
  component: () => <AdminDashboard data={Route.useLoaderData()} />,
})
