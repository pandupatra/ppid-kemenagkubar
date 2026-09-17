import { createFileRoute } from '@tanstack/react-router'
import { DipGroupManager } from '@/components/admin/DipGroupManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminDipGroups } from '@/modules/documents/admin-dip-groups'

export const Route = createFileRoute('/admin/kategori-dip')({
  loader: () => getAdminDipGroups(),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/kategori-dip" />
  ),
  component: () => <DipGroupManager data={Route.useLoaderData()} />,
})
