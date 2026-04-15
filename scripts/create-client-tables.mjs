import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function run() {
  console.log('Creating client tables...')

  // client_users: website visitor accounts (separate from CRM/admin/partner users)
  await sql`
    CREATE TABLE IF NOT EXISTS client_users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      is_verified   BOOLEAN DEFAULT FALSE,
      reset_token   TEXT DEFAULT '',
      reset_expires TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      last_login    TIMESTAMPTZ
    )
  `
  console.log('✓ client_users')

  // saved_properties: heart/bookmark per client
  await sql`
    CREATE TABLE IF NOT EXISTS saved_properties (
      id         SERIAL PRIMARY KEY,
      client_id  INTEGER NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
      slug       TEXT NOT NULL,
      saved_at   TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, slug)
    )
  `
  console.log('✓ saved_properties')

  // client_enquiries: enquiry submissions linked to a logged-in client
  await sql`
    CREATE TABLE IF NOT EXISTS client_enquiries (
      id           SERIAL PRIMARY KEY,
      client_id    INTEGER NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
      property_slug TEXT DEFAULT '',
      message      TEXT DEFAULT '',
      status       TEXT DEFAULT 'Pending',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✓ client_enquiries')

  console.log('All client tables ready.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
