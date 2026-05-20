import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const leadId = body.lead_id || body.leadId
    const scheduledAt = body.scheduled_at || body.due_at || body.scheduledAt
    const notes = body.notes || body.description || ''

    if (!leadId || !scheduledAt) {
      return NextResponse.json({ success: false, error: 'lead_id and scheduled_at are required' }, { status: 400 })
    }

    const title = notes || 'Follow Up'

    const [task] = await sql`
      INSERT INTO crm_tasks (lead_id, due_at, title, description, status, assigned_to, created_by)
      VALUES (${leadId}, ${scheduledAt}, ${title}, ${notes}, 'pending', ${user.name}, ${user.name})
      RETURNING task_id AS id, lead_id, due_at AS scheduled_at, title, status
    `

    return NextResponse.json({ success: true, followup: task })
  } catch (e: any) {
    console.error('[followups POST]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
