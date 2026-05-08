import sql from './db'

export async function runPartnersMigration(): Promise<string[]> {
  const results: string[] = []

  const steps: Array<[string, string]> = [
    ['create crm_partners_seq', `CREATE SEQUENCE IF NOT EXISTS crm_partners_seq START 1`],

    ['create crm_partners', `
      CREATE TABLE IF NOT EXISTS crm_partners (
        id                    SERIAL PRIMARY KEY,
        partner_id            TEXT UNIQUE NOT NULL DEFAULT ('PS-P-' || LPAD(nextval('crm_partners_seq')::TEXT, 3, '0')),
        name                  TEXT NOT NULL DEFAULT '',
        email                 TEXT NOT NULL DEFAULT '',
        phone                 TEXT NOT NULL DEFAULT '',
        country_code          TEXT DEFAULT '+91',
        alternate_phone       TEXT DEFAULT '',
        profile_image         TEXT DEFAULT '',
        profession_type       TEXT DEFAULT 'Individual',
        company_name          TEXT DEFAULT '',
        designation           TEXT DEFAULT '',
        experience_years      INT DEFAULT 0,
        city                  TEXT DEFAULT '',
        locality              TEXT DEFAULT '',
        areas_covered         TEXT DEFAULT '',
        assigned_rm_id        INT REFERENCES crm_users(id),
        assigned_rm_name      TEXT DEFAULT '',
        status                TEXT DEFAULT 'Pending',
        tier                  TEXT DEFAULT 'Bronze',
        referral_code         TEXT UNIQUE,
        re_engagement_threshold INT DEFAULT 30,
        kyc_status            TEXT DEFAULT 'Not Submitted',
        pan_number            TEXT DEFAULT '',
        aadhaar_number        TEXT DEFAULT '',
        gst_number            TEXT DEFAULT '',
        bank_account          TEXT DEFAULT '',
        bank_ifsc             TEXT DEFAULT '',
        bank_name             TEXT DEFAULT '',
        agreement_accepted    BOOLEAN DEFAULT FALSE,
        agreement_accepted_at TIMESTAMPTZ,
        training_done         BOOLEAN DEFAULT FALSE,
        training_done_at      TIMESTAMPTZ,
        training_done_by      TEXT DEFAULT '',
        internal_notes        TEXT DEFAULT '',
        portal_password_hash  TEXT DEFAULT '',
        google_id             TEXT DEFAULT '',
        last_login            TIMESTAMPTZ,
        source                TEXT DEFAULT 'Self Registration',
        referrer_partner_id   TEXT DEFAULT '',
        created_by            TEXT DEFAULT '',
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
      )
    `],

    ['create crm_partner_commissions', `
      CREATE TABLE IF NOT EXISTS crm_partner_commissions (
        id                 SERIAL PRIMARY KEY,
        commission_id      TEXT UNIQUE NOT NULL DEFAULT ('PS-C-' || LPAD(nextval('crm_partners_seq')::TEXT, 3, '0')),
        partner_id         TEXT NOT NULL REFERENCES crm_partners(partner_id),
        enquiry_id         TEXT,
        lead_id            TEXT,
        lead_name          TEXT DEFAULT '',
        deal_value         NUMERIC(15,2) DEFAULT 0,
        commission_type    TEXT DEFAULT 'percentage',
        commission_value   NUMERIC(10,2) DEFAULT 0,
        commission_amount  NUMERIC(15,2) DEFAULT 0,
        split_percentage   NUMERIC(5,2) DEFAULT 100,
        milestone          TEXT DEFAULT 'Booking',
        status             TEXT DEFAULT 'Pending',
        approved_by        TEXT DEFAULT '',
        approved_at        TIMESTAMPTZ,
        paid_at            TIMESTAMPTZ,
        payment_reference  TEXT DEFAULT '',
        created_by         TEXT DEFAULT '',
        created_at         TIMESTAMPTZ DEFAULT NOW(),
        updated_at         TIMESTAMPTZ DEFAULT NOW()
      )
    `],

    ['create crm_partner_activity_log', `
      CREATE TABLE IF NOT EXISTS crm_partner_activity_log (
        id             SERIAL PRIMARY KEY,
        partner_id     TEXT NOT NULL,
        activity_type  TEXT NOT NULL,
        title          TEXT DEFAULT '',
        description    TEXT DEFAULT '',
        enquiry_id     TEXT DEFAULT '',
        lead_id        TEXT DEFAULT '',
        performed_by   TEXT DEFAULT '',
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `],

    ['alter crm_enquiries partner cols', `
      ALTER TABLE crm_enquiries
        ADD COLUMN IF NOT EXISTS partner_id TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS partner_attribution TEXT DEFAULT 'first',
        ADD COLUMN IF NOT EXISTS partner_link_click BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS partner_link_note TEXT DEFAULT ''
    `],

    ['alter crm_listings partner cols', `
      ALTER TABLE crm_listings
        ADD COLUMN IF NOT EXISTS partner_id TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT ''
    `],

    ['backfill referral_code', `UPDATE crm_partners SET referral_code = partner_id WHERE referral_code IS NULL`],

    ['create referral_code trigger fn', `
      CREATE OR REPLACE FUNCTION set_partner_referral_code()
      RETURNS TRIGGER AS $fn$
      BEGIN
        IF NEW.referral_code IS NULL THEN
          NEW.referral_code := NEW.partner_id;
        END IF;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql
    `],

    ['create referral_code trigger', `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trg_partner_referral_code'
        ) THEN
          CREATE TRIGGER trg_partner_referral_code
          BEFORE INSERT ON crm_partners
          FOR EACH ROW EXECUTE FUNCTION set_partner_referral_code();
        END IF;
      END $$
    `],
  ]

  for (const [label, query] of steps) {
    try {
      await sql.unsafe(query)
      results.push(`ok: ${label}`)
    } catch (e: any) {
      results.push(`warn: ${label}: ${e.message?.slice(0, 80)}`)
    }
  }
  return results
}

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
