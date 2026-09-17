import { createFileRoute } from '@tanstack/react-router'
import { ServiceStandardManager } from '@/components/admin/ServiceStandardManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminServiceCharter } from '@/modules/documents/service-charter'
import { getAdminServiceStandards } from '@/modules/documents/service-standards'

export const Route = createFileRoute('/admin/standar-layanan/sop')({
  loader: async () => ({
    standards: await getAdminServiceStandards(),
    charter: await getAdminServiceCharter(),
  }),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/standar-layanan/sop" />
  ),
  component: () => (
    <ServiceStandardManager data={Route.useLoaderData()} section="sop" />
  ),
})
