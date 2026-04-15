import sql from './db'

export async function runCRMMigration() {
  try {
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referral_name TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referral_phone TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS referral_email TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS min_budget TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS max_budget TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS dob TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS sourcing_manager TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS closing_manager TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS possession_date TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS enquired_location TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS buyer TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS payment_plan TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS affiliate_partner TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS landline TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS alt_phone TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS sub_source TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS secondary_owner TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS enquired_for TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS carpet_area TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS saleable_area TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_note TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS scheduled_at TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS booked_name TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS booked_date TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS agreement_value TEXT DEFAULT ''`
    await sql`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS project_enquired TEXT DEFAULT ''`
  } catch (e) {
    // columns may already exist — ignore errors
    console.warn('[CRM Migration]', e)
  }
}
