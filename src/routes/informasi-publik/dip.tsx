import { createFileRoute } from '@tanstack/react-router'
import { DipPage } from '../../components/public/DipPage'
import { DipPageSkeleton } from '@/components/loading/PageSkeletons'
import {
  disclosureCategoryByPath,
  getPublicDipItems,
} from '../../modules/documents/public-dip'

export const Route = createFileRoute('/informasi-publik/dip')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string; category?: string } => ({
    q: typeof search.q === 'string' ? search.q.trim() : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
  }),
  loader: () => getPublicDipItems(),
  pendingComponent: DipPageSkeleton,
  component: PublicInformationPage,
})

function PublicInformationPage() {
  const { q = '', category: categoryPath } = Route.useSearch()
  const category = categoryPath
    ? disclosureCategoryByPath[categoryPath]
    : undefined

  return (
    <DipPage
      key={JSON.stringify([category, q])}
      category={category}
      initialQuery={q}
      items={Route.useLoaderData()}
    />
  )
}
