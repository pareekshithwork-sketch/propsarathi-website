import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { validateScope, buildPartnersScopeWhere } from '@/lib/scopeFilter'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const scope = validateScope(searchParams.get('scope'), user.role)
  const scopeWhere = buildPartnersScopeWhere(scope, user.name, user.teamId)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const tier = searchParams.get('tier') || ''
  const reEngagement = searchParams.get('reEngagement') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const partners = await sql`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM crm_enquiries WHERE partner_id = p.partner_id) AS total_enquiries_referred,
        (SELECT COUNT(*) FROM crm_listings WHERE partner_id = p.partner_id) AS total_listings_referred,
        (SELECT COUNT(*) FROM crm_enquiries WHERE partner_id = p.partner_id AND stage = 'Book') AS total_bookings,
        COALESCE((SELECT SUM(commission_amount) FROM crm_partner_commissions
          WHERE partner_id = p.partner_id AND status = 'Pending'), 0) AS total_commission_pending,
        COALESCE((SELECT SUM(commission_amount) FROM crm_partner_commissions
          WHERE partner_id = p.partner_id AND status = 'Paid'), 0) AS total_commission_paid,
        GREATEST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (
            SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id
          )))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (
            SELECT MAX(created_at) FROM crm_listings WHERE partner_id = p.partner_id
          )))/86400, 9999)
        ) AS days_since_last_referral,
        CASE WHEN GREATEST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (
            SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id
          )))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (
            SELECT MAX(created_at) FROM crm_listings WHERE partner_id = p.partner_id
          )))/86400, 9999)
        ) >= p.re_engagement_threshold THEN TRUE ELSE FALSE END AS re_engagement_alert
      FROM crm_partners p
      WHERE TRUE
        ${scopeWhere}
        ${status ? sql`AND p.status = ${status}` : sql``}
        ${tier ? sql`AND p.tier = ${tier}` : sql``}
        ${search ? sql`AND (p.name ILIKE ${'%' + search + '%'} OR p.phone LIKE ${'%' + search + '%'} OR p.partner_id ILIKE ${'%' + search + '%'})` : sql``}
        ${reEngagement ? sql`AND GREATEST(
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_enquiries WHERE partner_id = p.partner_id)))/86400, 9999),
          COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT MAX(created_at) FROM crm_listings WHERE partner_id = p.partner_id)))/86400, 9999)
        ) >= 10` : sql``}
      ORDER BY p.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ total }] = await sql`
      SELECT COUNT(*) AS total FROM crm_partners p
      WHERE TRUE ${scopeWhere}
        ${status ? sql`AND p.status = ${status}` : sql``}
        ${tier ? sql`AND p.tier = ${tier}` : sql``}
        ${search ? sql`AND (p.name ILIKE ${'%' + search + '%'} OR p.phone LIKE ${'%' + search + '%'} OR p.partner_id ILIKE ${'%' + search + '%'})` : sql``}
    `

    return NextResponse.json({ success: true, partners, total: Number(total) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      name, phone,
      countryCode = '+91', alternatePhone = '', email = '',
      professionType = 'Individual', companyName = '', designation = '',
      experienceYears = 0, city = '', locality = '', areasCovered = '',
      assignedRmId = null, assignedRmName = '',
      status = 'Pending', internalNotes = '',
      source = 'RM Added', referrerPartnerId = '',
    } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }

    // Resolve RM if not provided
    let rmId = assignedRmId
    let rmName = assignedRmName
    if (!rmId && !rmName) {
      const [rmRow] = await sql`SELECT id, name FROM crm_users WHERE name = ${user.name} AND is_active = TRUE LIMIT 1`
      if (rmRow) { rmId = rmRow.id; rmName = rmRow.name }
    }
    if (rmName && !rmId) {
      const [rmRow] = await sql`SELECT id FROM crm_users WHERE name = ${rmName} AND is_active = TRUE LIMIT 1`
      if (rmRow) rmId = rmRow.id
    }

    const [partner] = await sql`
      INSERT INTO crm_partners
        (name, phone, country_code, alternate_phone, email,
         profession_type, company_name, designation, experience_years,
         city, locality, areas_covered,
         assigned_rm_id, assigned_rm_name,
         status, internal_notes, source, referrer_partner_id, created_by)
      VALUES
        (${name}, ${phone}, ${countryCode}, ${alternatePhone}, ${email},
         ${professionType}, ${companyName}, ${designation}, ${experienceYears},
         ${city}, ${locality}, ${areasCovered},
         ${rmId}, ${rmName},
         ${status}, ${internalNotes}, ${source}, ${referrerPartnerId}, ${user.name})
      RETURNING *
    `

    // Set referral_code = partner_id (app-level safety net)
    await sql`UPDATE crm_partners SET referral_code = ${partner.partner_id} WHERE id = ${partner.id} AND referral_code IS NULL`

    await sql`
      INSERT INTO crm_partner_activity_log
        (partner_id, activity_type, title, description, performed_by)
      VALUES
        (${partner.partner_id}, 'partner_created', 'Partner added',
         ${'Source: ' + source}, ${user.name})
    `

    return NextResponse.json({ success: true, partner })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
