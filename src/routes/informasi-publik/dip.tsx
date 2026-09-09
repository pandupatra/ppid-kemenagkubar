import { createFileRoute } from '@tanstack/react-router'
import { DipPage } from '../../components/public/DipPage'
import { getPublicDipItems } from '../../modules/documents/public-dip'
export const Route = createFileRoute('/informasi-publik/dip')({
  loader: () => getPublicDipItems(),
  component: () => <DipPage items={Route.useLoaderData()} />,
})
