import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMin < 2) return 'Just now'
  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { leadId } = await params
  try {
    const rows = await sql`
      SELECT
        id, activity_type, title, description,
        old_value, new_value, performed_by,
        enquiry_id, listing_id, created_at
      FROM crm_activity_log
      WHERE lead_id = ${leadId}
      ORDER BY created_at DESC
      LIMIT 100
    `

    const activity = rows.map(row => ({
      ...row,
      timeAgo: timeAgo(new Date(row.created_at)),
    }))

    return NextResponse.json({ success: true, activity })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { leadId } = await params
  try {
    const body = await request.json()
    const { note } = body
    if (!note || !String(note).trim()) {
      return NextResponse.json({ success: false, error: 'Note is required' }, { status: 400 })
    }

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, activity_type, title, description, performed_by)
      VALUES
        (${leadId}, 'note_added', 'Note added', ${String(note).trim()}, ${user.name})
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
