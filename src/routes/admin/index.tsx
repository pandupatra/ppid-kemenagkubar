import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminDashboardSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminDashboard } from '@/modules/admin/dashboard'

export const Route = createFileRoute('/admin/')({
  loader: () => getAdminDashboard(),
  pendingComponent: AdminDashboardSkeleton,
  component: () => <AdminDashboard data={Route.useLoaderData()} />,
})
