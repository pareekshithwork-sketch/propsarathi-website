import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const { reason = '', notes = '' } = body

    const [enquiry] = await sql`SELECT lead_id, status FROM crm_enquiries WHERE enquiry_id = ${id}`
    if (!enquiry) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    if (enquiry.status === 'closed') return NextResponse.json({ success: true, alreadyClosed: true })

    await sql`
      UPDATE crm_enquiries
      SET status     = 'closed',
          closed_at  = NOW(),
          closed_by  = ${user.name},
          lost_reason = ${reason},
          lost_notes  = ${notes},
          updated_at  = NOW()
      WHERE enquiry_id = ${id}
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, enquiry_id, activity_type, title, description, performed_by)
      VALUES
        (${enquiry.lead_id}, ${id}, 'enquiry_closed', 'Enquiry closed',
         ${reason || notes}, ${user.name})
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
