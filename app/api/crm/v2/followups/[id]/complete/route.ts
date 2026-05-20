import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

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

  try {
    const result = await sql`
      UPDATE crm_tasks
      SET status = 'done', completed_at = NOW()
      WHERE task_id = ${id}
      RETURNING task_id AS id, lead_id, status
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Follow-up not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, followup: result[0] })
  } catch (e: any) {
    console.error('[followups complete PATCH]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
