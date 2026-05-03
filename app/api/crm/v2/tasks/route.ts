import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('id')
  if (!taskId) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

  try {
    await sql`
      UPDATE crm_tasks
      SET status = 'done', completed_at = NOW(), completed_by = ${user.name}
      WHERE id = ${taskId}
    `
    return NextResponse.json({ success: true })
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
