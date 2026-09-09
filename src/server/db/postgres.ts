import { Client, type QueryResultRow } from 'pg'

function createClient() {
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString)
    throw new Error('Koneksi basis data belum dikonfigurasi.')
  return new Client({ connectionString })
}

export async function queryRows<T extends QueryResultRow>(
  text: string,
  values: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const client = createClient()
  await client.connect()
  try {
    return (await client.query<T>(text, [...values])).rows
  } finally {
    await client.end()
  }
}

export async function withTransaction<T>(
  action: (client: Client) => Promise<T>,
): Promise<T> {
  const client = createClient()
  await client.connect()
  try {
    await client.query('begin')
    const result = await action(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback').catch(() => undefined)
    throw error
  } finally {
    await client.end()
  }
}
