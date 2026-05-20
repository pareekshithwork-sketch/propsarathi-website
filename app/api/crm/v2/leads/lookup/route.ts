import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone') || ''

  if (!phone) {
    return NextResponse.json({ success: false, error: 'phone is required' }, { status: 400 })
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10)

  try {
    const [lead] = await sql`
      SELECT
        l.lead_id,
        l.name            AS full_name,
        l.phone,
        l.country_code,
        l.email,
        l.assigned_rm,
        e.stage,
        e.sub_stage,
        a.description     AS last_note
      FROM crm_leads_v2 l
      LEFT JOIN LATERAL (
        SELECT stage, sub_stage
        FROM crm_enquiries
        WHERE lead_id = l.lead_id AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1
      ) e ON TRUE
      LEFT JOIN LATERAL (
        SELECT description
        FROM crm_activity_log
        WHERE lead_id = l.lead_id
        ORDER BY created_at DESC
        LIMIT 1
      ) a ON TRUE
      WHERE RIGHT(REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g'), 10) = ${cleanPhone}
        AND l.is_deleted = FALSE
      LIMIT 1
    `

    if (!lead) {
      return NextResponse.json({ success: true, found: false, lead: null })
    }

    return NextResponse.json({ success: true, found: true, lead })
  } catch (e: any) {
    console.error('[leads lookup GET]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
