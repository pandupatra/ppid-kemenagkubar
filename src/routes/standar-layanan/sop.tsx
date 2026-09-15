import { createFileRoute } from '@tanstack/react-router'
import { ServiceStandardsPage } from '@/components/public/ServiceStandardsPage'
import { getPublicServiceStandards } from '@/modules/documents/service-standards'

export const Route = createFileRoute('/standar-layanan/sop')({
  loader: () => getPublicServiceStandards({ data: { kind: 'sop' } }),
  component: () => (
    <ServiceStandardsPage documents={Route.useLoaderData()} kind="sop" />
  ),
})
