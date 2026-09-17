import { createFileRoute } from '@tanstack/react-router'
import { DocumentReportsManager } from '@/components/admin/DocumentReportsManager'
import { AdminManagerSkeleton } from '@/components/loading/PageSkeletons'
import { getAdminDocumentReports } from '@/modules/documents/document-reports'

export const Route = createFileRoute('/admin/dokumen-laporan')({
  loader: () => getAdminDocumentReports(),
  pendingComponent: () => (
    <AdminManagerSkeleton activePath="/admin/dokumen-laporan" />
  ),
  component: () => <DocumentReportsManager data={Route.useLoaderData()} />,
})
