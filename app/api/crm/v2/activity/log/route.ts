import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  return verifyCRMToken(token || '')
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    // Accept both camelCase (web) and snake_case (Flutter)
    const leadId = body.leadId || body.lead_id
    const enquiryId = body.enquiryId || body.enquiry_id
    const listingId = body.listingId || body.listing_id
    const activityType = body.activityType || body.activity_type
    const notes = body.notes
    const duration = body.duration || body.duration_minutes

    if (!leadId || !activityType) {
      return NextResponse.json({ success: false, error: 'lead_id and activity_type required' }, { status: 400 })
    }

    const durationStr = duration ? ` · ${duration} min` : ''
    const titleMap: Record<string, string> = {
      call: `Call logged${durationStr}`,
      whatsapp: 'WhatsApp message sent',
      note: 'Note added',
    }
    const title = titleMap[activityType] || activityType
    const metadata = activityType === 'call' && duration ? JSON.stringify({ duration }) : null

    const [row] = await sql`
      INSERT INTO crm_activity_log
        (lead_id, enquiry_id, listing_id, activity_type, title, description, metadata, performed_by)
      VALUES (
        ${leadId},
        ${enquiryId || null},
        ${listingId || null},
        ${activityType},
        ${title},
        ${notes || null},
        ${metadata},
        ${user.name}
      )
      RETURNING id, lead_id, activity_type
    `

    return NextResponse.json({ success: true, activity: row })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
