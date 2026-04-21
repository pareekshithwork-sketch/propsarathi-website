/**
 * PropSarathi — Master Sprint Migration
 * Adds: client_devices, share_links, client_activity_logs, referral_chain,
 *       protected_documents, document_view_logs
 * ALTERs: crm_leads, client_users, client_enquiries
 * Run: node scripts/master-migration.mjs
 */
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🚀 Running master sprint migration...\n')

  // ── client_devices ──────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS client_devices (
      id            SERIAL PRIMARY KEY,
      client_id     INTEGER REFERENCES client_users(id) ON DELETE CASCADE,
      fingerprint   TEXT NOT NULL,
      phone         TEXT,
      verified_at   TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, fingerprint)
    )
  `
  console.log('✅ client_devices')

  // ── share_links ─────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS share_links (
      id            SERIAL PRIMARY KEY,
      code          TEXT NOT NULL UNIQUE,
      project_slug  TEXT NOT NULL,
      sharer_type   TEXT NOT NULL CHECK (sharer_type IN ('client','affiliate')),
      sharer_id     INTEGER NOT NULL,
      sharer_name   TEXT DEFAULT '',
      rm_id         INTEGER,
      clicks        INTEGER DEFAULT 0,
      leads_count   INTEGER DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ share_links')

  // ── client_activity_logs ────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS client_activity_logs (
      id            SERIAL PRIMARY KEY,
      client_id     INTEGER REFERENCES client_users(id) ON DELETE SET NULL,
      session_id    TEXT,
      fingerprint   TEXT,
      event_type    TEXT NOT NULL,
      project_slug  TEXT,
      metadata      JSONB,
      share_code    TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ client_activity_logs')

  // ── referral_chain ──────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS referral_chain (
      id             SERIAL PRIMARY KEY,
      lead_id        INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
      share_code     TEXT REFERENCES share_links(code) ON DELETE SET NULL,
      sharer_type    TEXT,
      sharer_id      INTEGER,
      rm_id          INTEGER,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ referral_chain')

  // ── protected_documents ─────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS protected_documents (
      id            SERIAL PRIMARY KEY,
      project_slug  TEXT NOT NULL,
      doc_type      TEXT NOT NULL CHECK (doc_type IN ('floor_plan','payment_plan','brochure')),
      label         TEXT NOT NULL DEFAULT '',
      file_url      TEXT NOT NULL,
      is_active     BOOLEAN DEFAULT TRUE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ protected_documents')

  // ── document_view_logs ──────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS document_view_logs (
      id            SERIAL PRIMARY KEY,
      document_id   INTEGER REFERENCES protected_documents(id) ON DELETE CASCADE,
      client_id     INTEGER REFERENCES client_users(id) ON DELETE SET NULL,
      fingerprint   TEXT,
      viewed_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ document_view_logs')

  // ── ALTER crm_leads ──────────────────────────────────────────────────────────
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS client_id INTEGER`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS project TEXT DEFAULT ''`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS share_code TEXT`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referrer_type TEXT`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referrer_id INTEGER`
  await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS rm_override INTEGER`
  console.log('✅ crm_leads columns added')

  // ── ALTER client_users ───────────────────────────────────────────────────────
  await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE`
  await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ`
  console.log('✅ client_users columns added')

  // ── ALTER client_enquiries ───────────────────────────────────────────────────
  await sql`ALTER TABLE client_enquiries ADD COLUMN IF NOT EXISTS share_code TEXT`
  await sql`ALTER TABLE client_enquiries ADD COLUMN IF NOT EXISTS referrer_id INTEGER`
  console.log('✅ client_enquiries columns added')

  console.log('\n✅ Master migration complete!')
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
