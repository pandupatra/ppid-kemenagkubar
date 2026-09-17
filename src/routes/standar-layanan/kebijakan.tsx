import { createFileRoute } from '@tanstack/react-router'
import { ServiceStandardsPage } from '@/components/public/ServiceStandardsPage'
import { ServiceStandardsPageSkeleton } from '@/components/loading/PageSkeletons'
import { getPublicServiceStandards } from '@/modules/documents/service-standards'

export const Route = createFileRoute('/standar-layanan/kebijakan')({
  loader: () => getPublicServiceStandards({ data: { kind: 'policy' } }),
  pendingComponent: ServiceStandardsPageSkeleton,
  component: () => (
    <ServiceStandardsPage documents={Route.useLoaderData()} kind="policy" />
  ),
})
