import { createFileRoute } from '@tanstack/react-router'
import { ServiceStandardManager } from '@/components/admin/ServiceStandardManager'
import { getAdminServiceCharter } from '@/modules/documents/service-charter'
import { getAdminServiceStandards } from '@/modules/documents/service-standards'

export const Route = createFileRoute('/admin/standar-layanan')({
  loader: async () => ({
    standards: await getAdminServiceStandards(),
    charter: await getAdminServiceCharter(),
  }),
  component: () => <ServiceStandardManager data={Route.useLoaderData()} />,
})
