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
    const { leadId, enquiryId, listingId, activityType, notes, duration } = body

    if (!leadId || !activityType) {
      return NextResponse.json({ success: false, error: 'leadId and activityType required' }, { status: 400 })
    }

    const durationStr = duration ? ` · ${duration} min` : ''
    const titleMap: Record<string, string> = {
      call: `Call logged${durationStr}`,
      whatsapp: 'WhatsApp message sent',
      note: 'Note added',
    }
    const title = titleMap[activityType] || activityType
    const metadata = activityType === 'call' && duration ? JSON.stringify({ duration }) : null

    await sql`
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
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
