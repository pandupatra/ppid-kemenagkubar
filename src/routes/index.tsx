import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '../components/public/HomePage'
import { getPublicNewsItems } from '../modules/news/public-news'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'PPID Kemenag Kutai Barat' }] }),
  loader: () => getPublicNewsItems(),
  component: () => <HomePage news={Route.useLoaderData()} />,
})
