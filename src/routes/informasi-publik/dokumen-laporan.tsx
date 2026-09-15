import { createFileRoute } from '@tanstack/react-router'
import { DocumentReportsPage } from '@/components/public/DocumentReportsPage'
import { getPublicDocumentReports } from '@/modules/documents/document-reports'

export const Route = createFileRoute('/informasi-publik/dokumen-laporan')({
  loader: () => getPublicDocumentReports(),
  component: () => <DocumentReportsPage documents={Route.useLoaderData()} />,
})
