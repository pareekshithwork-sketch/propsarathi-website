import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { leadId, title, dueAt, priority = 'Medium', assignedTo = '' } = body

    if (!leadId || !title?.trim()) {
      return NextResponse.json({ success: false, error: 'leadId and title are required' }, { status: 400 })
    }

    const [task] = await sql`
      INSERT INTO crm_tasks (lead_id, title, due_at, priority, assigned_to, created_by)
      VALUES (${leadId}, ${title}, ${dueAt ? new Date(dueAt) : null}, ${priority}, ${assignedTo}, ${user.name})
      RETURNING *
    `

    return NextResponse.json({ success: true, task })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
