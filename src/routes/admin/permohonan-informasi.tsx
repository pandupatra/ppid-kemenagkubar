import { createFileRoute } from '@tanstack/react-router'
import { InformationRequestManager } from '@/components/admin/InformationRequestManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminInformationRequests } from '@/modules/information-requests/admin-requests'

export const Route = createFileRoute('/admin/permohonan-informasi')({
  loader: () => getAdminInformationRequests(),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/permohonan-informasi" />
  ),
  component: () => <InformationRequestManager data={Route.useLoaderData()} />,
})
