import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { calculateTier } from '@/lib/partnerTier'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function GET(request: NextRequest, { params }: { params: { partnerId: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = params
  try {
    const [partner] = await sql`SELECT * FROM crm_partners WHERE partner_id = ${partnerId}`
    if (!partner) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const enquiries = await sql`
      SELECT e.*, l.name AS lead_name, l.phone AS lead_phone
      FROM crm_enquiries e
      LEFT JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
      WHERE e.partner_id = ${partnerId}
      ORDER BY e.created_at DESC LIMIT 50
    `
    const listings = await sql`
      SELECT ls.*, l.name AS lead_name
      FROM crm_listings ls
      LEFT JOIN crm_leads_v2 l ON l.lead_id = ls.lead_id
      WHERE ls.partner_id = ${partnerId}
      ORDER BY ls.created_at DESC LIMIT 50
    `
    const commissions = await sql`
      SELECT * FROM crm_partner_commissions
      WHERE partner_id = ${partnerId}
      ORDER BY created_at DESC
    `
    const activity = await sql`
      SELECT * FROM crm_partner_activity_log
      WHERE partner_id = ${partnerId}
      ORDER BY created_at DESC LIMIT 50
    `

    const totalBookings = enquiries.filter((e: any) => e.stage === 'Book').length
    const stats = {
      totalReferred: enquiries.length + listings.length,
      totalBookings,
      conversionRate: enquiries.length > 0 ? Math.round(totalBookings / enquiries.length * 100) : 0,
      totalCommissionEarned: commissions
        .filter((c: any) => c.status === 'Paid')
        .reduce((s: number, c: any) => s + Number(c.commission_amount), 0),
    }

    return NextResponse.json({ success: true, partner, enquiries, listings, commissions, activity, stats })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { partnerId: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = params
  try {
    const body = await request.json()
    const [existing] = await sql`SELECT * FROM crm_partners WHERE partner_id = ${partnerId}`
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const {
      name, email, phone, countryCode, alternatePhone,
      professionType, companyName, designation, experienceYears,
      city, locality, areasCovered,
      assignedRmId, assignedRmName,
      status, internalNotes,
      trainingDone, trainingDoneAt, trainingDoneBy,
      agreementAccepted, agreementAcceptedAt,
      tier,
    } = body

    const [updated] = await sql`
      UPDATE crm_partners SET
        name                  = COALESCE(${name ?? null}, name),
        email                 = COALESCE(${email ?? null}, email),
        phone                 = COALESCE(${phone ?? null}, phone),
        country_code          = COALESCE(${countryCode ?? null}, country_code),
        alternate_phone       = COALESCE(${alternatePhone ?? null}, alternate_phone),
        profession_type       = COALESCE(${professionType ?? null}, profession_type),
        company_name          = COALESCE(${companyName ?? null}, company_name),
        designation           = COALESCE(${designation ?? null}, designation),
        experience_years      = COALESCE(${experienceYears ?? null}, experience_years),
        city                  = COALESCE(${city ?? null}, city),
        locality              = COALESCE(${locality ?? null}, locality),
        areas_covered         = COALESCE(${areasCovered ?? null}, areas_covered),
        assigned_rm_id        = COALESCE(${assignedRmId ?? null}, assigned_rm_id),
        assigned_rm_name      = COALESCE(${assignedRmName ?? null}, assigned_rm_name),
        status                = COALESCE(${status ?? null}, status),
        internal_notes        = COALESCE(${internalNotes ?? null}, internal_notes),
        training_done         = COALESCE(${trainingDone ?? null}, training_done),
        training_done_at      = COALESCE(${trainingDoneAt ?? null}, training_done_at),
        training_done_by      = COALESCE(${trainingDoneBy ?? null}, training_done_by),
        agreement_accepted    = COALESCE(${agreementAccepted ?? null}, agreement_accepted),
        agreement_accepted_at = COALESCE(${agreementAcceptedAt ?? null}, agreement_accepted_at),
        tier                  = COALESCE(${tier ?? null}, tier),
        updated_at            = NOW()
      WHERE partner_id = ${partnerId}
      RETURNING *
    `

    if (status && status !== existing.status) {
      await sql`
        INSERT INTO crm_partner_activity_log
          (partner_id, activity_type, title, description, performed_by)
        VALUES
          (${partnerId}, 'status_changed', 'Status changed',
           ${`${existing.status} → ${status}`}, ${user.name})
      `
    }

    return NextResponse.json({ success: true, partner: updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
