import { createFileRoute } from '@tanstack/react-router'
import { InformationServiceManager } from '@/components/admin/InformationServiceManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminInformationServices } from '@/modules/documents/information-services'

export const Route = createFileRoute(
  '/admin/layanan-informasi/standar-pengumuman',
)({
  loader: () => getAdminInformationServices(),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/layanan-informasi/standar-pengumuman" />
  ),
  component: () => (
    <InformationServiceManager
      data={Route.useLoaderData()}
      kind="announcement"
    />
  ),
})
