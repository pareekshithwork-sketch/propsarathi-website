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

export async function runCRMUsersMigration() {
  // crm_users enhancements for Google auth + teams
  const steps = [
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS email TEXT DEFAULT ''`,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT ''`,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT ''`,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ`,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`,
    sql`
      CREATE TABLE IF NOT EXISTS crm_teams (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        gm_user_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS team_id INTEGER`,
    sql`ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS manager_id INTEGER`,
  ]

  const results: string[] = []
  for (const step of steps) {
    try {
      await step
      results.push('ok')
    } catch (e: any) {
      results.push(`warn: ${e.message?.slice(0, 60)}`)
    }
  }

  // Seed known admin emails (idempotent — only updates if email is blank)
  try {
    await sql`
      UPDATE crm_users SET email = 'pareekshith@propsarathi.com', role = 'super_admin'
      WHERE (user_id = 'PS-U-001' OR name ILIKE '%pareekshith%')
        AND (email IS NULL OR email = '')
    `
    await sql`
      UPDATE crm_users SET email = 'kushal@propsarathi.com', role = 'super_admin'
      WHERE (user_id = 'PS-U-002' OR name ILIKE '%kushal%')
        AND (email IS NULL OR email = '')
    `
    results.push('seed ok')
  } catch (e: any) {
    results.push(`seed warn: ${e.message?.slice(0, 60)}`)
  }

  return results
}
