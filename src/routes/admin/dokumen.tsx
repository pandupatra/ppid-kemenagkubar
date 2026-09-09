import { createFileRoute } from '@tanstack/react-router'
import { DocumentManager } from '@/components/admin/DocumentManager'
import { getAdminDocuments } from '@/modules/documents/admin-documents'

export const Route = createFileRoute('/admin/dokumen')({
  loader: () => getAdminDocuments(),
  component: () => <DocumentManager data={Route.useLoaderData()} />,
})
