import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })
const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🚀 PropSarathi CRM Core Migration\n')

  // ID SEQUENCES
  await sql`CREATE SEQUENCE IF NOT EXISTS
    lead_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS
    enquiry_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS
    listing_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS
    crm_user_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS
    commission_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS
    task_seq START 1`
  console.log('✅ sequences')

  // CRM USERS
  await sql`
    CREATE TABLE IF NOT EXISTS crm_users (
      id            SERIAL PRIMARY KEY,
      user_id       TEXT UNIQUE NOT NULL
                    DEFAULT 'PS-U-' ||
                    LPAD(nextval('crm_user_seq')::TEXT,3,'0'),
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      phone         TEXT DEFAULT '',
      role          TEXT NOT NULL DEFAULT 'rm'
                    CHECK (role IN (
                      'super_admin','admin','rm'
                    )),
      password_env  TEXT NOT NULL,
      is_active     BOOLEAN DEFAULT TRUE,
      monthly_target_site_visits INTEGER DEFAULT 0,
      monthly_target_bookings    INTEGER DEFAULT 0,
      monthly_target_eoi         INTEGER DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ crm_users')

  // Seed default users if empty
  await sql`
    INSERT INTO crm_users
      (name, email, role, password_env)
    SELECT
      'Pareekshith Rawal',
      'pareekshith@propsarathi.com',
      'super_admin',
      'CRM_ADMIN_PASSWORD'
    WHERE NOT EXISTS (
      SELECT 1 FROM crm_users
      WHERE email = 'pareekshith@propsarathi.com'
    )
  `
  await sql`
    INSERT INTO crm_users
      (name, email, role, password_env)
    SELECT
      'Kushal Rawal',
      'kushal@propsarathi.com',
      'rm',
      'CRM_RM_PASSWORD'
    WHERE NOT EXISTS (
      SELECT 1 FROM crm_users
      WHERE email = 'kushal@propsarathi.com'
    )
  `
  console.log('✅ crm_users seeded')

  // LEADS V2
  await sql`
    CREATE TABLE IF NOT EXISTS crm_leads_v2 (
      id              SERIAL PRIMARY KEY,
      lead_id         TEXT UNIQUE NOT NULL
                      DEFAULT 'PS-L-' ||
                      LPAD(nextval('lead_seq')::TEXT,3,'0'),
      name            TEXT NOT NULL,
      phone           TEXT NOT NULL,
      alternate_phone TEXT DEFAULT '',
      email           TEXT DEFAULT '',
      country_code    TEXT DEFAULT '+91',
      source          TEXT DEFAULT 'Direct',
      sub_source      TEXT DEFAULT '',
      referral_name   TEXT DEFAULT '',
      referral_phone  TEXT DEFAULT '',
      customer_location TEXT DEFAULT '',
      assigned_rm     TEXT DEFAULT '',
      assigned_rm_id  INTEGER REFERENCES crm_users(id),
      secondary_rm    TEXT DEFAULT '',
      lead_type       TEXT DEFAULT 'Buyer'
                      CHECK (lead_type IN (
                        'Buyer','Seller','Both'
                      )),
      tags            TEXT DEFAULT '',
      is_duplicate    BOOLEAN DEFAULT FALSE,
      duplicate_of    TEXT DEFAULT '',
      affiliate_id    TEXT DEFAULT '',
      affiliate_name  TEXT DEFAULT '',
      is_affiliate_lead BOOLEAN DEFAULT FALSE,
      score           INTEGER DEFAULT 0,
      is_deleted      BOOLEAN DEFAULT FALSE,
      deleted_at      TIMESTAMPTZ,
      deleted_by      TEXT DEFAULT '',
      created_by      TEXT DEFAULT '',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS cl2_phone_idx
    ON crm_leads_v2 (phone)`
  await sql`CREATE INDEX IF NOT EXISTS cl2_rm_idx
    ON crm_leads_v2 (assigned_rm_id)`
  await sql`CREATE INDEX IF NOT EXISTS cl2_deleted_idx
    ON crm_leads_v2 (is_deleted)`
  console.log('✅ crm_leads_v2')

  // ENQUIRIES
  await sql`
    CREATE TABLE IF NOT EXISTS crm_enquiries (
      id              SERIAL PRIMARY KEY,
      enquiry_id      TEXT UNIQUE NOT NULL
                      DEFAULT 'PS-E-' ||
                      LPAD(nextval('enquiry_seq')::TEXT,3,'0'),
      lead_id         TEXT NOT NULL,
      project_slug    TEXT DEFAULT '',
      project_name    TEXT DEFAULT '',
      property_type   TEXT DEFAULT '',
      min_budget      BIGINT DEFAULT 0,
      max_budget      BIGINT DEFAULT 0,
      currency        TEXT DEFAULT 'INR',
      bedrooms        TEXT DEFAULT '',
      location_pref   TEXT DEFAULT '',
      purpose         TEXT DEFAULT '',
      buyer_type      TEXT DEFAULT '',
      stage           TEXT DEFAULT 'New',
      sub_stage       TEXT DEFAULT '',
      scheduled_at    TIMESTAMPTZ,
      booking_name    TEXT DEFAULT '',
      booking_date    TIMESTAMPTZ,
      agreement_value BIGINT DEFAULT 0,
      lost_reason     TEXT DEFAULT '',
      lost_notes      TEXT DEFAULT '',
      status          TEXT DEFAULT 'active'
                      CHECK (status IN (
                        'active','closed','reopened'
                      )),
      closed_at       TIMESTAMPTZ,
      closed_by       TEXT DEFAULT '',
      reopened_at     TIMESTAMPTZ,
      reopened_by     TEXT DEFAULT '',
      created_by      TEXT DEFAULT '',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS ce_lead_idx
    ON crm_enquiries (lead_id)`
  await sql`CREATE INDEX IF NOT EXISTS ce_stage_idx
    ON crm_enquiries (stage)`
  await sql`CREATE INDEX IF NOT EXISTS ce_scheduled_idx
    ON crm_enquiries (scheduled_at)`
  console.log('✅ crm_enquiries')

  // LISTINGS
  await sql`
    CREATE TABLE IF NOT EXISTS crm_listings (
      id              SERIAL PRIMARY KEY,
      listing_id      TEXT UNIQUE NOT NULL
                      DEFAULT 'PS-LS-' ||
                      LPAD(nextval('listing_seq')::TEXT,3,'0'),
      lead_id         TEXT NOT NULL,
      title           TEXT DEFAULT '',
      property_type   TEXT DEFAULT '',
      address         TEXT DEFAULT '',
      city            TEXT DEFAULT '',
      locality        TEXT DEFAULT '',
      bedrooms        INTEGER DEFAULT 0,
      bathrooms       INTEGER DEFAULT 0,
      area_sqft       INTEGER DEFAULT 0,
      floor_number    INTEGER DEFAULT 0,
      total_floors    INTEGER DEFAULT 0,
      asking_price    BIGINT DEFAULT 0,
      currency        TEXT DEFAULT 'INR',
      year_purchased  INTEGER,
      possession_status TEXT DEFAULT '',
      seller_notes    TEXT DEFAULT '',
      rm_visit_date   DATE,
      rm_visit_notes  TEXT DEFAULT '',
      rm_verified     BOOLEAN DEFAULT FALSE,
      rm_verified_by  TEXT DEFAULT '',
      rm_verified_at  TIMESTAMPTZ,
      images          JSONB DEFAULT '[]',
      admin_approved  BOOLEAN DEFAULT FALSE,
      admin_approved_by TEXT DEFAULT '',
      admin_approved_at TIMESTAMPTZ,
      is_live         BOOLEAN DEFAULT FALSE,
      published_at    TIMESTAMPTZ,
      slug            TEXT DEFAULT '',
      seo_title       TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      nearby_landmarks TEXT DEFAULT '',
      latitude        DECIMAL(10,8),
      longitude       DECIMAL(11,8),
      status          TEXT DEFAULT 'pending'
                      CHECK (status IN (
                        'pending','rm_verified',
                        'admin_approved','live','sold'
                      )),
      created_by      TEXT DEFAULT '',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS cls_lead_idx
    ON crm_listings (lead_id)`
  await sql`CREATE INDEX IF NOT EXISTS cls_live_idx
    ON crm_listings (is_live)`
  console.log('✅ crm_listings')

  // ACTIVITY LOG
  await sql`
    CREATE TABLE IF NOT EXISTS crm_activity_log (
      id              SERIAL PRIMARY KEY,
      lead_id         TEXT NOT NULL,
      enquiry_id      TEXT DEFAULT '',
      listing_id      TEXT DEFAULT '',
      activity_type   TEXT NOT NULL,
      title           TEXT NOT NULL,
      description     TEXT DEFAULT '',
      old_value       TEXT DEFAULT '',
      new_value       TEXT DEFAULT '',
      performed_by    TEXT NOT NULL,
      performed_by_id INTEGER,
      metadata        JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS cal_lead_idx
    ON crm_activity_log (lead_id)`
  await sql`CREATE INDEX IF NOT EXISTS cal_type_idx
    ON crm_activity_log (activity_type)`
  console.log('✅ crm_activity_log')

  // STAGE HISTORY
  await sql`
    CREATE TABLE IF NOT EXISTS crm_stage_history (
      id              SERIAL PRIMARY KEY,
      enquiry_id      TEXT NOT NULL,
      lead_id         TEXT NOT NULL,
      from_stage      TEXT DEFAULT '',
      to_stage        TEXT NOT NULL,
      sub_stage       TEXT DEFAULT '',
      scheduled_at    TIMESTAMPTZ,
      notes           TEXT NOT NULL,
      lost_reason     TEXT DEFAULT '',
      changed_by      TEXT NOT NULL,
      changed_by_id   INTEGER,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS csh_enquiry_idx
    ON crm_stage_history (enquiry_id)`
  console.log('✅ crm_stage_history')

  // TASKS
  await sql`
    CREATE TABLE IF NOT EXISTS crm_tasks (
      id              SERIAL PRIMARY KEY,
      task_id         TEXT UNIQUE NOT NULL
                      DEFAULT 'PS-T-' ||
                      LPAD(nextval('task_seq')::TEXT,3,'0'),
      lead_id         TEXT NOT NULL,
      enquiry_id      TEXT DEFAULT '',
      title           TEXT NOT NULL,
      description     TEXT DEFAULT '',
      due_at          TIMESTAMPTZ,
      assigned_to     TEXT NOT NULL,
      assigned_to_id  INTEGER,
      status          TEXT DEFAULT 'pending'
                      CHECK (status IN (
                        'pending','done','cancelled'
                      )),
      created_by      TEXT DEFAULT '',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      completed_at    TIMESTAMPTZ
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS ct_lead_idx
    ON crm_tasks (lead_id)`
  await sql`CREATE INDEX IF NOT EXISTS ct_due_idx
    ON crm_tasks (due_at)`
  console.log('✅ crm_tasks')

  // RM TARGETS
  await sql`
    CREATE TABLE IF NOT EXISTS crm_rm_targets (
      id              SERIAL PRIMARY KEY,
      rm_id           INTEGER REFERENCES crm_users(id),
      rm_name         TEXT NOT NULL,
      month           INTEGER NOT NULL,
      year            INTEGER NOT NULL,
      target_site_visits  INTEGER DEFAULT 0,
      target_bookings     INTEGER DEFAULT 0,
      target_eoi          INTEGER DEFAULT 0,
      target_revenue      BIGINT DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(rm_id, month, year)
    )
  `
  console.log('✅ crm_rm_targets')

  // COMMISSIONS
  await sql`
    CREATE TABLE IF NOT EXISTS crm_commissions (
      id              SERIAL PRIMARY KEY,
      commission_id   TEXT UNIQUE NOT NULL
                      DEFAULT 'PS-C-' ||
                      LPAD(nextval('commission_seq')::TEXT,3,'0'),
      lead_id         TEXT NOT NULL,
      enquiry_id      TEXT DEFAULT '',
      affiliate_id    TEXT NOT NULL,
      affiliate_name  TEXT NOT NULL,
      property_name   TEXT DEFAULT '',
      agreement_value BIGINT DEFAULT 0,
      commission_pct  DECIMAL(5,2) DEFAULT 0,
      commission_amount BIGINT DEFAULT 0,
      status          TEXT DEFAULT 'pending'
                      CHECK (status IN (
                        'pending','approved',
                        'paid','cancelled'
                      )),
      notes           TEXT DEFAULT '',
      approved_by     TEXT DEFAULT '',
      approved_at     TIMESTAMPTZ,
      paid_at         TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ crm_commissions')

  console.log('\n✅ CRM Core Migration Complete!')
  console.log('Tables created:')
  console.log('  crm_users, crm_leads_v2, crm_enquiries,')
  console.log('  crm_listings, crm_activity_log,')
  console.log('  crm_stage_history, crm_tasks,')
  console.log('  crm_rm_targets, crm_commissions')
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
