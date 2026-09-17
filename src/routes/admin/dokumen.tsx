import { createFileRoute } from '@tanstack/react-router'
import { DocumentManager } from '@/components/admin/DocumentManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminDocuments } from '@/modules/documents/admin-documents'

export const Route = createFileRoute('/admin/dokumen')({
  loader: () => getAdminDocuments(),
  pendingComponent: () => <AdminManagerSkeleton activePath="/admin/dokumen" />,
  component: () => <DocumentManager data={Route.useLoaderData()} />,
})
