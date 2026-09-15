import { createFileRoute } from '@tanstack/react-router'
import { ServiceStandardsPage } from '@/components/public/ServiceStandardsPage'
import { getPublicServiceStandards } from '@/modules/documents/service-standards'

export const Route = createFileRoute('/standar-layanan/kebijakan')({
  loader: () => getPublicServiceStandards({ data: { kind: 'policy' } }),
  component: () => (
    <ServiceStandardsPage documents={Route.useLoaderData()} kind="policy" />
  ),
})
