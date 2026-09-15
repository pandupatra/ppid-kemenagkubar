import { createFileRoute } from '@tanstack/react-router'
import { InformationServiceManager } from '@/components/admin/InformationServiceManager'
import { getAdminInformationServices } from '@/modules/documents/information-services'

export const Route = createFileRoute('/admin/layanan-informasi')({
  loader: () => getAdminInformationServices(),
  component: () => <InformationServiceManager data={Route.useLoaderData()} />,
})
