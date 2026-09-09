import { createServerFn } from '@tanstack/react-start'

export type PublicNewsItem = Readonly<{
  id: string
  title: string
  url: string
  imageUrl: string
  publishedLabel: string
  excerpt: string
}>

type NewsRow = Readonly<{
  id: string
  title: string
  url: string
  imageUrl: string
  publishedLabel: string
  excerpt: string
}>

const KUBAR_PATTERNS = [
  /\bkutai barat\b/i,
  /\bkabupaten kutai barat\b/i,
  /\bkemenag kubar\b/i,
  /\bkankemenag kubar\b/i,
  /\bkubar\b/i,
  /\bmelak\b/i,
]
const REMOTE_NEWS_CACHE_MS = 30 * 60 * 1000
let remoteNewsCache: { expiresAt: number; items: PublicNewsItem[] } | null =
  null

export const getPublicNewsItems = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicNewsItem[]> => {
    const connectionString = process.env.SUPABASE_DB_URL
    if (!connectionString) return getRemoteKutaiBaratNews()

    const { Client } = await import('pg')
    const client = new Client({ connectionString })

    try {
      await client.connect()
      const result = await client.query<NewsRow>(`
        select
          id,
          title,
          url,
          image_url as "imageUrl",
          published_label as "publishedLabel",
          excerpt
        from public.news_items
        order by fetched_at desc, sort_order asc
        limit 6
      `)
      const storedNews = result.rows.map(toPublicNewsItem).filter(isNewsItem)
      return storedNews.length > 0 ? storedNews : getRemoteKutaiBaratNews()
    } catch {
      return getRemoteKutaiBaratNews()
    } finally {
      await client.end().catch(() => undefined)
    }
  },
)

async function getRemoteKutaiBaratNews(): Promise<PublicNewsItem[]> {
  if (remoteNewsCache && remoteNewsCache.expiresAt > Date.now()) {
    return remoteNewsCache.items
  }

  try {
    const response = await fetch('https://kaltim.kemenag.go.id/rss', {
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return []

    const items = [
      ...(await response.text()).matchAll(/<item>([\s\S]*?)<\/item>/g),
    ]
      .map(([, itemXml], index) => {
        const title = readXmlTag(itemXml, 'title')
        const url = readXmlTag(itemXml, 'link')
        const description = readXmlTag(itemXml, 'description')
        return toPublicNewsItem({
          id: `kaltim-${index}-${url}`,
          title,
          url,
          imageUrl: readXmlTag(itemXml, 'img_url'),
          publishedLabel: readXmlTag(itemXml, 'pubDate'),
          excerpt: stripHtml(readXmlTag(itemXml, 'detail') || description),
        })
      })
      .filter(isNewsItem)
      .filter((item) =>
        KUBAR_PATTERNS.some((pattern) => pattern.test(item.title)),
      )
      .slice(0, 6)

    remoteNewsCache = { items, expiresAt: Date.now() + REMOTE_NEWS_CACHE_MS }
    return items
  } catch {
    return []
  }
}

function toPublicNewsItem(row: NewsRow): PublicNewsItem | null {
  if (!isSafeNewsUrl(row.url) || !row.title.trim()) return null
  return {
    id: row.id,
    title: row.title.trim(),
    url: row.url,
    imageUrl: isSafeNewsUrl(row.imageUrl) ? row.imageUrl : '',
    publishedLabel: row.publishedLabel.trim(),
    excerpt: stripHtml(row.excerpt).slice(0, 180),
  }
}

function isNewsItem(item: PublicNewsItem | null): item is PublicNewsItem {
  return item !== null
}

function isSafeNewsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('kemenag.go.id')
  } catch {
    return false
  }
}

function readXmlTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'))
  return decodeXml(match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, '') ?? '').trim()
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
