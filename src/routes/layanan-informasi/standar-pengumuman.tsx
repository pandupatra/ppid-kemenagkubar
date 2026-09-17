import { createFileRoute } from '@tanstack/react-router'
import { InformationServicesPage } from '@/components/public/InformationServicesPage'
import { InformationServicesPageSkeleton } from '@/components/loading/PageSkeletons'
import { getPublicInformationServices } from '@/modules/documents/information-services'

export const Route = createFileRoute('/layanan-informasi/standar-pengumuman')({
  loader: () =>
    getPublicInformationServices({ data: { kind: 'announcement' } }),
  pendingComponent: InformationServicesPageSkeleton,
  component: () => (
    <InformationServicesPage
      documents={Route.useLoaderData()}
      kind="announcement"
    />
  ),
})
