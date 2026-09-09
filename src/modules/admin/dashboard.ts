import { createServerFn } from '@tanstack/react-start'
import { canReadContent, getAdminActor } from '@/modules/auth/admin-access'
import { queryRows } from '@/server/db/postgres'

export type DashboardDocument = {
  category: string | null
  id: string
  status: 'draft' | 'in_review' | 'published' | 'archived'
  title: string
  updatedAt: string
}

export type AdminDashboardData =
  | { access: 'denied' }
  | {
      access: 'granted'
      actor: { displayName: string; roles: string[] }
      metrics: {
        dipItems: number
        draftDocuments: number
        publishedDocuments: number
        reviewDocuments: number
      }
      recentDocuments: DashboardDocument[]
      reviewQueue: DashboardDocument[]
    }

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminDashboardData> => {
    const actor = await getAdminActor()
    if (!actor || !canReadContent(actor)) return { access: 'denied' }

    const [metrics] = await queryRows<{
      dip_items: number
      draft_documents: number
      published_documents: number
      review_documents: number
    }>(`
      select
        (select count(*)::int from ppid.dip_items where publication_state = 'published') as dip_items,
        (select count(*)::int from ppid.documents where publication_state = 'draft') as draft_documents,
        (select count(*)::int from ppid.documents where publication_state = 'published') as published_documents,
        (select count(*)::int from ppid.documents where publication_state = 'in_review') as review_documents
    `)
    const documents = await queryRows<DashboardDocument>(`
      select document.id, document.title, document.publication_state as status,
        category.title as category, document.created_at as "updatedAt"
      from ppid.documents document
      left join ppid.document_categories category on category.id = document.category_id
      order by document.created_at desc
      limit 8
    `)

    return {
      access: 'granted',
      actor: { displayName: actor.displayName, roles: actor.roles },
      metrics: metrics
        ? {
            dipItems: metrics.dip_items,
            draftDocuments: metrics.draft_documents,
            publishedDocuments: metrics.published_documents,
            reviewDocuments: metrics.review_documents,
          }
        : {
            dipItems: 0,
            draftDocuments: 0,
            publishedDocuments: 0,
            reviewDocuments: 0,
          },
      recentDocuments: documents,
      reviewQueue: documents
        .filter((document) => document.status === 'in_review')
        .slice(0, 3),
    }
  },
)
