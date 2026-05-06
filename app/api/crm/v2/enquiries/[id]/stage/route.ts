import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

const VALID_STAGES = new Set([
  'New', 'Callback', 'Schedule Meeting', 'Schedule Site Visit',
  'Expression Of Interest', 'Book', 'Not Interested', 'Drop',
])

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const { stage, subStage = '', notes, scheduledAt, lostReason = '', bookingName, bookingDate, agreementValue } = body

    if (!stage) return NextResponse.json({ success: false, error: 'stage is required' }, { status: 400 })
    if (!VALID_STAGES.has(stage)) return NextResponse.json({ success: false, error: 'Invalid stage value' }, { status: 400 })
    if (!notes || !String(notes).trim()) {
      return NextResponse.json({ success: false, error: 'Notes are required' }, { status: 400 })
    }
    if ((stage === 'Not Interested' || stage === 'Drop') && !lostReason) {
      return NextResponse.json({ success: false, error: 'lostReason is required for this stage' }, { status: 400 })
    }

    const [current] = await sql`SELECT stage, lead_id FROM crm_enquiries WHERE enquiry_id = ${id}`
    if (!current) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })

    const fromStage = current.stage
    const leadId = current.lead_id
    const isBooked = stage === 'Book'
    const isClosed = isBooked || stage === 'Not Interested' || stage === 'Drop'

    // Resolve user's numeric id in crm_users
    const [crmUser] = await sql`SELECT id FROM crm_users WHERE email = ${user.email} LIMIT 1`
    const changedById: number | null = crmUser?.id ?? null

    if (isBooked) {
      await sql`
        UPDATE crm_enquiries SET
          stage           = ${stage},
          sub_stage       = ${subStage},
          scheduled_at    = ${scheduledAt ? new Date(scheduledAt) : null},
          booking_name    = ${bookingName ?? ''},
          booking_date    = ${bookingDate ? new Date(bookingDate) : null},
          agreement_value = ${agreementValue ?? 0},
          status          = 'closed',
          closed_at       = NOW(),
          closed_by       = ${user.name},
          updated_at      = NOW()
        WHERE enquiry_id = ${id}
      `
    } else if (stage === 'Not Interested' || stage === 'Drop') {
      await sql`
        UPDATE crm_enquiries SET
          stage        = ${stage},
          sub_stage    = ${subStage},
          scheduled_at = ${scheduledAt ? new Date(scheduledAt) : null},
          lost_reason  = ${lostReason},
          lost_notes   = ${notes},
          status       = 'closed',
          closed_at    = NOW(),
          closed_by    = ${user.name},
          updated_at   = NOW()
        WHERE enquiry_id = ${id}
      `
    } else {
      await sql`
        UPDATE crm_enquiries SET
          stage        = ${stage},
          sub_stage    = ${subStage},
          scheduled_at = ${scheduledAt ? new Date(scheduledAt) : null},
          updated_at   = NOW()
        WHERE enquiry_id = ${id}
      `
    }

    await sql`
      INSERT INTO crm_stage_history
        (enquiry_id, lead_id, from_stage, to_stage, sub_stage,
         scheduled_at, notes, lost_reason, changed_by, changed_by_id)
      VALUES
        (${id}, ${leadId}, ${fromStage}, ${stage}, ${subStage},
         ${scheduledAt ? new Date(scheduledAt) : null},
         ${notes}, ${lostReason}, ${user.name}, ${changedById})
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, enquiry_id, activity_type, title, description,
         old_value, new_value, performed_by)
      VALUES
        (${leadId}, ${id}, 'stage_change',
         ${stage + (subStage ? ' — ' + subStage : '')},
         ${notes}, ${fromStage}, ${stage}, ${user.name})
    `

    const [enquiry] = await sql`SELECT * FROM crm_enquiries WHERE enquiry_id = ${id}`
    return NextResponse.json({ success: true, enquiry })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
