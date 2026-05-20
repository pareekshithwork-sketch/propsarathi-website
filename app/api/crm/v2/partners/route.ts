import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { validateScope, type Scope } from '@/lib/scopeFilter'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

// Build scope WHERE using actual crm_partners column names.
// crm_partners uses 'assigned_rm' (text, RM name) — not assigned_rm_id or assigned_rm_name.
function partnersScopeWhere(scope: Scope, userName: string, teamId?: number | null) {
  if (scope === 'org') return sql``
  if (scope === 'team' && teamId) {
    return sql`AND p.assigned_rm IN (SELECT name FROM crm_users WHERE team_id = ${teamId} AND is_active = TRUE)`
  }
  return sql`AND p.assigned_rm = ${userName}`
}

// Idempotent — safe to call on every cold start
async function ensurePartnersTables() {
  try { await sql`CREATE SEQUENCE IF NOT EXISTS crm_partners_seq START 1` } catch {}
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_partners (
        id           SERIAL PRIMARY KEY,
        partner_id   TEXT UNIQUE NOT NULL DEFAULT ('PS-P-' || LPAD(nextval('crm_partners_seq')::TEXT, 3, '0')),
        full_name    TEXT NOT NULL DEFAULT '',
        email        TEXT NOT NULL DEFAULT '',
        phone        TEXT NOT NULL DEFAULT '',
        country_code TEXT DEFAULT '+91',
        occupation   TEXT DEFAULT '',
        assigned_rm  TEXT DEFAULT '',
        status       TEXT DEFAULT 'Pending',
        re_engagement_threshold INT DEFAULT 30,
        kyc_status   TEXT DEFAULT 'Not Submitted',
        pan_number   TEXT DEFAULT '',
        aadhar_number TEXT DEFAULT '',
        gst_number   TEXT DEFAULT '',
        bank_account TEXT DEFAULT '',
        bank_ifsc    TEXT DEFAULT '',
        bank_name    TEXT DEFAULT '',
        agreement_accepted BOOLEAN DEFAULT FALSE,
        agreement_accepted_at TIMESTAMPTZ,
        training_done BOOLEAN DEFAULT FALSE,
        training_done_at TIMESTAMPTZ,
        training_done_by TEXT DEFAULT '',
        portal_password_hash TEXT DEFAULT '',
        google_id    TEXT DEFAULT '',
        last_login   TIMESTAMPTZ,
        referrer_partner_id TEXT DEFAULT '',
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `
  } catch {}
  // Set DEFAULT on partner_id for tables created before the sequence existed
  try { await sql`ALTER TABLE crm_partners ALTER COLUMN partner_id SET DEFAULT ('PS-P-' || LPAD(nextval('crm_partners_seq')::TEXT, 3, '0'))` } catch {}
  // Backfill columns added after initial table creation
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS re_engagement_threshold INT DEFAULT 30` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'Not Submitted'` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS gst_number TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS bank_account TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS bank_ifsc TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS agreement_accepted BOOLEAN DEFAULT FALSE` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS agreement_accepted_at TIMESTAMPTZ` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS training_done BOOLEAN DEFAULT FALSE` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS training_done_at TIMESTAMPTZ` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS training_done_by TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS portal_password_hash TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ` } catch {}
  try { await sql`ALTER TABLE crm_partners ADD COLUMN IF NOT EXISTS referrer_partner_id TEXT DEFAULT ''` } catch {}
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_partner_commissions (
        id                SERIAL PRIMARY KEY,
        commission_id     TEXT UNIQUE NOT NULL DEFAULT ('PS-C-' || LPAD(nextval('crm_partners_seq')::TEXT, 3, '0')),
        partner_id        TEXT NOT NULL,
        enquiry_id        TEXT,
        lead_id           TEXT,
        lead_name         TEXT DEFAULT '',
        deal_value        NUMERIC(15,2) DEFAULT 0,
        commission_type   TEXT DEFAULT 'percentage',
        commission_value  NUMERIC(10,2) DEFAULT 0,
        commission_amount NUMERIC(15,2) DEFAULT 0,
        split_percentage  NUMERIC(5,2) DEFAULT 100,
        milestone         TEXT DEFAULT 'Booking',
        status            TEXT DEFAULT 'Pending',
        approved_by       TEXT DEFAULT '',
        approved_at       TIMESTAMPTZ,
        paid_at           TIMESTAMPTZ,
        payment_reference TEXT DEFAULT '',
        created_by        TEXT DEFAULT '',
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        updated_at        TIMESTAMPTZ DEFAULT NOW()
      )
    `
  } catch {}
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_partner_activity_log (
        id            SERIAL PRIMARY KEY,
        partner_id    TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        title         TEXT DEFAULT '',
        description   TEXT DEFAULT '',
        enquiry_id    TEXT DEFAULT '',
        lead_id       TEXT DEFAULT '',
        performed_by  TEXT DEFAULT '',
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `
  } catch {}
  try { await sql`ALTER TABLE crm_enquiries ADD COLUMN IF NOT EXISTS partner_id TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_enquiries ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_enquiries ADD COLUMN IF NOT EXISTS partner_link_click BOOLEAN DEFAULT FALSE` } catch {}
  try { await sql`ALTER TABLE crm_listings ADD COLUMN IF NOT EXISTS partner_id TEXT DEFAULT ''` } catch {}
  try { await sql`ALTER TABLE crm_listings ADD COLUMN IF NOT EXISTS partner_name TEXT DEFAULT ''` } catch {}
}

let tablesReady = false

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (!tablesReady) {
    await ensurePartnersTables()
    tablesReady = true
  }

  const { searchParams } = new URL(request.url)
  const scope = validateScope(searchParams.get('scope'), user.role)
  const scopeWhere = partnersScopeWhere(scope, user.name, user.teamId)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const reEngagement = searchParams.get('reEngagement') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const partners = await sql`
      SELECT
        p.*,
        -- Aliases for backward compatibility (clients that expect old column names)
        p.full_name                         AS name,
        p.last_updated                      AS updated_at,
        p.assigned_rm                       AS assigned_rm_name,
        -- Derived fields
        (SELECT COUNT(*) FROM crm_enquiries  WHERE partner_id = p.partner_id)                    AS total_enquiries_referred,
        (SELECT COUNT(*) FROM crm_listings   WHERE partner_id = p.partner_id)                    AS total_listings_referred,
        (SELECT COUNT(*) FROM crm_enquiries  WHERE partner_id = p.partner_id AND stage = 'Book') AS total_bookings,
        COALESCE((SELECT SUM(commission_amount) FROM crm_partner_commissions
          WHERE partner_id = p.partner_id AND status = 'Pending'), 0)                            AS total_commission_pending,
        COALESCE((SELECT SUM(commission_amount) FROM crm_partner_commissions
          WHERE partner_id = p.partner_id AND status = 'Paid'), 0)                               AS total_commission_paid,
        LEAST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id)))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_listings  WHERE partner_id = p.partner_id)))/86400, 9999)
        )                                                                                         AS days_since_last_referral,
        CASE WHEN LEAST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id)))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_listings  WHERE partner_id = p.partner_id)))/86400, 9999)
        ) >= p.re_engagement_threshold THEN TRUE ELSE FALSE END                                   AS re_engagement_alert
      FROM crm_partners p
      WHERE TRUE
        ${scopeWhere}
        ${status ? sql`AND p.status = ${status}` : sql``}
        ${search ? sql`AND (p.full_name ILIKE ${'%' + search + '%'} OR p.phone LIKE ${'%' + search + '%'} OR p.partner_id ILIKE ${'%' + search + '%'})` : sql``}
        ${reEngagement ? sql`AND LEAST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id)))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_listings  WHERE partner_id = p.partner_id)))/86400, 9999)
        ) >= 10` : sql``}
      ORDER BY p.last_updated DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ total }] = await sql`
      SELECT COUNT(*) AS total FROM crm_partners p
      WHERE TRUE ${scopeWhere}
        ${status ? sql`AND p.status = ${status}` : sql``}
        ${search ? sql`AND (p.full_name ILIKE ${'%' + search + '%'} OR p.phone LIKE ${'%' + search + '%'} OR p.partner_id ILIKE ${'%' + search + '%'})` : sql``}
    `

    return NextResponse.json({ success: true, partners, total: Number(total) })
  } catch (e: any) {
    console.error('[partners GET]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (!tablesReady) {
    await ensurePartnersTables()
    tablesReady = true
  }

  try {
    const body = await request.json()
    const {
      name, phone,
      countryCode = '+91', email = '',
      assignedRm = '', status = 'Pending',
    } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }

    const rmName = assignedRm || user.name

    const [partner] = await sql`
      INSERT INTO crm_partners (full_name, phone, country_code, email, assigned_rm, status)
      VALUES (${name}, ${phone}, ${countryCode}, ${email}, ${rmName}, ${status})
      RETURNING *
    `

    try {
      await sql`
        INSERT INTO crm_partner_activity_log (partner_id, activity_type, title, description, performed_by)
        VALUES (${partner.partner_id}, 'partner_created', 'Partner added', 'Added via CRM', ${user.name})
      `
    } catch {}

    return NextResponse.json({ success: true, partner })
  } catch (e: any) {
    console.error('[partners POST]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
