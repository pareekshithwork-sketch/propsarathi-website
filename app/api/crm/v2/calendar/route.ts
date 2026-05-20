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
  const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const monthDate = `${monthParam}-01`

  const isManager = ['admin', 'super_admin', 'gm'].includes(user.role)

  const results = await Promise.allSettled([
    // Pending tasks due this month
    sql`
      SELECT
        t.task_id                        AS id,
        'follow_up'                      AS type,
        t.lead_id,
        l.name                           AS lead_name,
        COALESCE(l.country_code, '+91') || l.phone AS lead_phone,
        NULL::text                       AS stage,
        t.due_at                         AS scheduled_at,
        COALESCE(t.description, t.title) AS notes
      FROM crm_tasks t
      LEFT JOIN crm_leads_v2 l ON l.lead_id = t.lead_id AND l.is_deleted = FALSE
      WHERE t.status != 'done'
        AND DATE_TRUNC('month', t.due_at) = DATE_TRUNC('month', ${monthDate}::date)
        ${isManager ? sql`` : sql`AND (t.assigned_to = ${user.name} OR (t.assigned_to = '' AND l.assigned_rm = ${user.name}))`}
      ORDER BY t.due_at ASC
    `,

    // Site visits scheduled this month
    sql`
      SELECT
        e.enquiry_id                     AS id,
        'site_visit'                     AS type,
        e.lead_id,
        l.name                           AS lead_name,
        COALESCE(l.country_code, '+91') || l.phone AS lead_phone,
        e.stage,
        e.scheduled_at,
        NULL::text                       AS notes
      FROM crm_enquiries e
      LEFT JOIN crm_leads_v2 l ON l.lead_id = e.lead_id AND l.is_deleted = FALSE
      WHERE e.stage = 'Schedule Site Visit'
        AND e.status = 'active'
        AND e.scheduled_at IS NOT NULL
        AND DATE_TRUNC('month', e.scheduled_at) = DATE_TRUNC('month', ${monthDate}::date)
        ${isManager ? sql`` : sql`AND l.assigned_rm = ${user.name}`}
      ORDER BY e.scheduled_at ASC
    `,

    // Meetings scheduled this month
    sql`
      SELECT
        e.enquiry_id                     AS id,
        'meeting'                        AS type,
        e.lead_id,
        l.name                           AS lead_name,
        COALESCE(l.country_code, '+91') || l.phone AS lead_phone,
        e.stage,
        e.scheduled_at,
        NULL::text                       AS notes
      FROM crm_enquiries e
      LEFT JOIN crm_leads_v2 l ON l.lead_id = e.lead_id AND l.is_deleted = FALSE
      WHERE e.stage = 'Schedule Meeting'
        AND e.status = 'active'
        AND e.scheduled_at IS NOT NULL
        AND DATE_TRUNC('month', e.scheduled_at) = DATE_TRUNC('month', ${monthDate}::date)
        ${isManager ? sql`` : sql`AND l.assigned_rm = ${user.name}`}
      ORDER BY e.scheduled_at ASC
    `,
  ])

  const events = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<any[]>).value)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  return NextResponse.json({ success: true, events })
}
