import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { sendPushNotification } from '@/lib/firebase-admin'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const body = await request.json().catch(() => ({}))
  const { stage, sub_stage = '' } = body

  if (!stage) {
    return NextResponse.json({ success: false, error: 'stage is required' }, { status: 400 })
  }

  try {
    // Find the most recent active enquiry for this lead
    const [enquiry] = await sql`
      SELECT enquiry_id, stage AS current_stage
      FROM crm_enquiries
      WHERE lead_id = ${id} AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'No active enquiry found for this lead' }, { status: 404 })
    }

    // Update stage on the enquiry
    await sql`
      UPDATE crm_enquiries
      SET stage = ${stage}, sub_stage = ${sub_stage}, updated_at = NOW()
      WHERE enquiry_id = ${enquiry.enquiry_id}
    `

    // Log to stage history
    await sql`
      INSERT INTO crm_stage_history
        (enquiry_id, lead_id, from_stage, to_stage, sub_stage, changed_by)
      VALUES
        (${enquiry.enquiry_id}, ${id}, ${enquiry.current_stage}, ${stage}, ${sub_stage}, ${user.name})
    `

    // Fire-and-forget push to assigned RM + all admin/super_admin
    const [lead] = await sql`SELECT name, assigned_rm FROM crm_leads_v2 WHERE lead_id = ${id} LIMIT 1`
    if (lead) {
      Promise.all([
        lead.assigned_rm
          ? sql`SELECT fcm_token FROM crm_device_tokens WHERE user_id = ${lead.assigned_rm}`
          : Promise.resolve([]),
        sql`SELECT dt.fcm_token FROM crm_device_tokens dt
            JOIN crm_users u ON u.name = dt.user_id
            WHERE u.role IN ('admin', 'super_admin') AND u.is_active = TRUE`,
      ])
        .then(([rmRows, adminRows]) => {
          const tokens = [...rmRows, ...adminRows]
            .map((r: any) => r.fcm_token)
            .filter((t: string, i: number, a: string[]) => t && a.indexOf(t) === i) // dedupe
          if (tokens.length) {
            sendPushNotification(
              tokens,
              'Stage Updated 📈',
              `${lead.name} → ${stage}`,
              { type: 'stage_changed', lead_id: id }
            )
          }
        })
        .catch(() => {})
    }

    return NextResponse.json({
      success: true,
      lead: { id, stage, sub_stage },
    })
  } catch (e: any) {
    console.error('[lead stage PATCH]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
