import { readFile } from 'node:fs/promises'
import { Client } from 'pg'

const env = Object.fromEntries(
  (await readFile('.env.local', 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...value] = line.split('=')
      return [key, value.join('=').replace(/^['"]|['"]$/g, '')]
    }),
)

if (!env.SUPABASE_DB_URL)
  throw new Error('SUPABASE_DB_URL is missing from .env.local.')

const client = new Client({ connectionString: env.SUPABASE_DB_URL })

try {
  await client.connect()
  await client.query(
    await readFile(
      'supabase/migrations/202609110002_add_document_report_documents.sql',
      'utf8',
    ),
  )
  console.log('Document-report migration applied.')
} finally {
  await client.end()
}
