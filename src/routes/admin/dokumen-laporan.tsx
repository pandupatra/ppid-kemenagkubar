import { createFileRoute } from '@tanstack/react-router'
import { DocumentReportsManager } from '@/components/admin/DocumentReportsManager'
import { getAdminDocumentReports } from '@/modules/documents/document-reports'

export const Route = createFileRoute('/admin/dokumen-laporan')({
  loader: () => getAdminDocumentReports(),
  component: () => <DocumentReportsManager data={Route.useLoaderData()} />,
})
