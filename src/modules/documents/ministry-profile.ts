import { createServerFn } from '@tanstack/react-start'
import { queryRows } from '@/server/db/postgres'

export type MinistryOrganizationChart = {
  src: string | null
  alt: string
  fileName: string | null
  updatedAt: string | null
}

const fallbackChart: MinistryOrganizationChart = {
  src: null,
  alt: 'Struktur Organisasi Kantor Kementerian Agama Kabupaten Kutai Barat',
  fileName: null,
  updatedAt: null,
}

type MinistryProfileRow = {
  altText: string
  storageBucket: string | null
  storagePath: string | null
  originalFilename: string | null
  updatedAt: string | null
}

function publicImageUrl(bucket: string, storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return null
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/')
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
}

async function readMinistryOrganizationChart(): Promise<MinistryOrganizationChart> {
  const rows = await queryRows<MinistryProfileRow>(
    `select organization_chart_alt as "altText",
      storage_bucket as "storageBucket", storage_path as "storagePath",
      original_filename as "originalFilename", updated_at::text as "updatedAt"
     from ppid.ministry_profile limit 1`,
  )
  const row = rows[0]
  if (!row) return fallbackChart
  return {
    src:
      row.storageBucket && row.storagePath
        ? publicImageUrl(row.storageBucket, row.storagePath)
        : null,
    alt: row.altText,
    fileName: row.originalFilename,
    updatedAt: row.updatedAt,
  }
}

export const getPublicMinistryOrganizationChart = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    return await readMinistryOrganizationChart()
  } catch (error) {
    console.error('Failed to load the ministry organization chart.', error)
    return fallbackChart
  }
})
