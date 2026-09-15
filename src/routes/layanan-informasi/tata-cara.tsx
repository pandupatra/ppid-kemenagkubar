import { createFileRoute } from '@tanstack/react-router'
import { InformationServicesPage } from '@/components/public/InformationServicesPage'
import { getPublicInformationServices } from '@/modules/documents/information-services'

export const Route = createFileRoute('/layanan-informasi/tata-cara')({
  loader: () => getPublicInformationServices({ data: { kind: 'procedure' } }),
  component: () => (
    <InformationServicesPage
      documents={Route.useLoaderData()}
      kind="procedure"
    />
  ),
})
