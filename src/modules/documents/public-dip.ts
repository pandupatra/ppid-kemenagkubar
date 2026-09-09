import { createServerFn } from '@tanstack/react-start'

export type DisclosureCategory =
  'periodic' | 'available_anytime' | 'immediate' | 'excluded'

export type DipItem = {
  id: string
  slug: string
  group_code: string
  group_title: string
  group_display_order: number
  group_order: number
  disclosure_category: DisclosureCategory
  official_title: string
  owner_unit: string | null
  document_year: number | null
  description: string | null
  published_at: string | null
  document_slug: string | null
  public_storage_path: string | null
}

export const categoryLabel: Record<DisclosureCategory, string> = {
  periodic: 'Berkala',
  available_anytime: 'Setiap Saat',
  immediate: 'Serta-Merta',
  excluded: 'Dikecualikan',
}

export const disclosureCategoryByPath: Record<string, DisclosureCategory> = {
  berkala: 'periodic',
  'setiap-saat': 'available_anytime',
  'serta-merta': 'immediate',
  dikecualikan: 'excluded',
}

async function queryPublicDipItems(where = '', values: string[] = []) {
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString)
    throw new Error('Katalog informasi publik belum dapat dimuat.')
  const { Client } = await import('pg')
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const result = await client.query<DipItem>(
      `select p.id, p.slug, p.group_code, p.group_title, p.group_display_order,
        p.group_order, p.disclosure_category,
        p.official_title, p.owner_unit, p.document_year,
        case when p.disclosure_category = 'excluded' then null else to_jsonb(doc)->>'description' end as description,
        p.published_at, p.document_slug, p.public_storage_path
       from ppid.public_dip_items p
       left join ppid.documents doc on doc.slug = p.document_slug
         and doc.publication_state = 'published'
       ${where} order by p.group_display_order, p.group_order`,
      values,
    )
    return result.rows
  } finally {
    await client.end()
  }
}

export const getPublicDipItems = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DipItem[]> => {
    return queryPublicDipItems()
  },
)

export const getPublicDipItem = createServerFn({ method: 'GET' })
  .validator(
    (data: unknown): { category: DisclosureCategory; slug: string } => {
      if (
        !data ||
        typeof data !== 'object' ||
        !['periodic', 'available_anytime', 'immediate', 'excluded'].includes(
          (data as { category?: string }).category ?? '',
        ) ||
        typeof (data as { slug?: unknown }).slug !== 'string' ||
        !(data as { slug: string }).slug
      )
        throw new Error('Parameter informasi tidak valid.')
      return data as { category: DisclosureCategory; slug: string }
    },
  )
  .handler(async ({ data }): Promise<DipItem | null> => {
    return (
      (
        await queryPublicDipItems(
          'where p.disclosure_category = $1 and p.slug = $2',
          [data.category, data.slug],
        )
      )[0] ?? null
    )
  })
