import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  return verifyCRMToken(token || '')
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  try {
    const [lead] = await sql`SELECT * FROM crm_leads_v2 WHERE lead_id = ${id}`
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })

    const [enquiries, listings, activity, tasks] = await Promise.all([
      sql`SELECT * FROM crm_enquiries WHERE lead_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_listings WHERE lead_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_activity_log WHERE lead_id = ${id} ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT * FROM crm_tasks WHERE lead_id = ${id} AND status = 'pending' ORDER BY due_at ASC`,
    ])

    return NextResponse.json({ success: true, lead, enquiries, listings, activity, tasks })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  try {
    const body = await request.json()

    const [current] = await sql`SELECT assigned_rm FROM crm_leads_v2 WHERE lead_id = ${id}`
    if (!current) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })

    // Handle assignedRm separately — needs crm_users lookup
    const newRm: string | undefined = body.assignedRm ?? body.assigned_rm
    if (newRm !== undefined) {
      let rmId: number | null = null
      if (newRm) {
        const [rmRow] = await sql`SELECT id FROM crm_users WHERE name = ${newRm} AND is_active = TRUE LIMIT 1`
        if (rmRow) rmId = rmRow.id
      }
      await sql`
        UPDATE crm_leads_v2
        SET assigned_rm = ${newRm}, assigned_rm_id = ${rmId}, updated_at = NOW()
        WHERE lead_id = ${id}
      `
      if (current.assigned_rm !== newRm) {
        await sql`
          INSERT INTO crm_activity_log (lead_id, activity_type, title, performed_by)
          VALUES (${id}, 'lead_assigned', ${'Lead reassigned to ' + (newRm || 'nobody')}, ${user.name})
        `
      }
    }

    // COALESCE update for all other fields
    const b = body
    await sql`
      UPDATE crm_leads_v2 SET
        name              = COALESCE(${b.name              ?? null}, name),
        phone             = COALESCE(${b.phone             ?? null}, phone),
        alternate_phone   = COALESCE(${(b.alternatePhone ?? b.alternate_phone) ?? null}, alternate_phone),
        email             = COALESCE(${b.email             ?? null}, email),
        country_code      = COALESCE(${(b.countryCode ?? b.country_code) ?? null}, country_code),
        source            = COALESCE(${b.source            ?? null}, source),
        sub_source        = COALESCE(${(b.subSource ?? b.sub_source) ?? null}, sub_source),
        referral_name     = COALESCE(${(b.referralName ?? b.referral_name) ?? null}, referral_name),
        referral_phone    = COALESCE(${(b.referralPhone ?? b.referral_phone) ?? null}, referral_phone),
        customer_location = COALESCE(${(b.customerLocation ?? b.customer_location) ?? null}, customer_location),
        lead_type         = COALESCE(${(b.leadType ?? b.lead_type) ?? null}, lead_type),
        tags              = COALESCE(${b.tags              ?? null}, tags),
        is_duplicate      = COALESCE(${(b.isDuplicate ?? b.is_duplicate) ?? null}, is_duplicate),
        score             = COALESCE(${b.score             ?? null}, score),
        updated_at        = NOW()
      WHERE lead_id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  const { id } = params
  try {
    await sql`
      UPDATE crm_leads_v2
      SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${user.name}
      WHERE lead_id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
