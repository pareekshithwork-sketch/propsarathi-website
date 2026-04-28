/**
 * PropSarathi — Sprint 5A Migration
 * Adds: crm_notifications, lead_score_events, crm_lead_notes
 * ALTERs: crm_leads (score, lead_type, days_in_stage tracking)
 * Run: node scripts/sprint5a-migration.mjs
 */
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🚀 Sprint 5A migration...\n')

  await sql`
    CREATE TABLE IF NOT EXISTS crm_notifications (
      id           SERIAL PRIMARY KEY,
      type         TEXT NOT NULL,
      title        TEXT NOT NULL,
      message      TEXT NOT NULL DEFAULT '',
      target_rm    TEXT,
      lead_id      TEXT,
      is_read      BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ crm_notifications')

  await sql`
    CREATE TABLE IF NOT EXISTS lead_score_events (
      id           SERIAL PRIMARY KEY,
      lead_id      TEXT NOT NULL,
      event_type   TEXT NOT NULL,
      points       INTEGER NOT NULL DEFAULT 0,
      note         TEXT DEFAULT '',
      created_by   TEXT DEFAULT '',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ lead_score_events')

  await sql`
    CREATE TABLE IF NOT EXISTS crm_lead_notes (
      id           SERIAL PRIMARY KEY,
      phone_group  TEXT NOT NULL,
      note         TEXT NOT NULL,
      created_by   TEXT NOT NULL DEFAULT '',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ crm_lead_notes')

  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'Buyer'`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS stage_changed_at TIMESTAMPTZ`
  console.log('✅ crm_leads columns added')

  console.log('\n✅ Sprint 5A migration complete!')
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
