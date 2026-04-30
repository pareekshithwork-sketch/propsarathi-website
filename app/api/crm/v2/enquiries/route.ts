import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'active'
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500)
  const isRm = user.role === 'rm'

  try {
    const enquiries = await sql`
      SELECT
        e.enquiry_id, e.lead_id, e.stage, e.sub_stage,
        e.scheduled_at, e.property_type, e.location_pref,
        e.min_budget, e.max_budget, e.currency,
        e.status, e.created_at, e.updated_at,
        l.name AS lead_name, l.phone AS lead_phone,
        l.country_code AS lead_country_code,
        l.assigned_rm, l.tags AS lead_tags
      FROM crm_enquiries e
      JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
      WHERE l.is_deleted = FALSE
        AND (${status} = 'all' OR e.status = ${status})
        AND (${isRm} = FALSE OR l.assigned_rm = ${user.name})
      ORDER BY e.updated_at DESC
      LIMIT ${limit}
    `
    return NextResponse.json({ success: true, enquiries })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      leadId, projectSlug = '', projectName = '',
      propertyType = '', minBudget = 0, maxBudget = 0,
      currency = 'INR', bedrooms = '', locationPref = '',
      purpose = '', buyerType = '',
    } = body

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 })
    }

    const [enquiry] = await sql`
      INSERT INTO crm_enquiries
        (lead_id, project_slug, project_name,
         property_type, min_budget, max_budget,
         currency, bedrooms, location_pref,
         purpose, buyer_type, created_by)
      VALUES
        (${leadId}, ${projectSlug}, ${projectName},
         ${propertyType}, ${minBudget}, ${maxBudget},
         ${currency}, ${bedrooms}, ${locationPref},
         ${purpose}, ${buyerType}, ${user.name})
      RETURNING *
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, enquiry_id, activity_type, title, description, performed_by)
      VALUES
        (${leadId}, ${enquiry.enquiry_id}, 'enquiry_added', 'New enquiry added',
         ${propertyType + (locationPref ? ' — ' + locationPref : '')}, ${user.name})
    `

    return NextResponse.json({ success: true, enquiryId: enquiry.enquiry_id, enquiry })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
