import { createFileRoute } from '@tanstack/react-router'
import { InformationObjectionManager } from '@/components/admin/InformationObjectionManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminInformationObjections } from '@/modules/information-requests/admin-objections'

export const Route = createFileRoute('/admin/keberatan-informasi')({
  loader: () => getAdminInformationObjections(),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/keberatan-informasi" />
  ),
  component: () => <InformationObjectionManager data={Route.useLoaderData()} />,
})
