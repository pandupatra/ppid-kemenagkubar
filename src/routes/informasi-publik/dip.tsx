import { createFileRoute, useRouterState } from '@tanstack/react-router'
import { DipPage } from '../../components/public/DipPage'
import {
  disclosureCategoryByPath,
  getPublicDipItems,
} from '../../modules/documents/public-dip'

export const Route = createFileRoute('/informasi-publik/dip')({
  loader: () => getPublicDipItems(),
  component: PublicInformationPage,
})

function PublicInformationPage() {
  const category = useRouterState({
    select: ({ location }) => {
      const value = new URLSearchParams(location.searchStr).get('category')
      return value ? disclosureCategoryByPath[value] : undefined
    },
  })

  return <DipPage category={category} items={Route.useLoaderData()} />
}
