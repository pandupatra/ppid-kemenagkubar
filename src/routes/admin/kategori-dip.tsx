import { createFileRoute } from '@tanstack/react-router'
import { DipGroupManager } from '@/components/admin/DipGroupManager'
import { getAdminDipGroups } from '@/modules/documents/admin-dip-groups'

export const Route = createFileRoute('/admin/kategori-dip')({
  loader: () => getAdminDipGroups(),
  component: () => <DipGroupManager data={Route.useLoaderData()} />,
})
