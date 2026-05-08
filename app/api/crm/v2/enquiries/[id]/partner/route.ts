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
    const body = await request.json()
    const { partnerId = '', partnerName = '', note } = body

    // Fetch the enquiry to get lead_id
    const [enq] = await sql`SELECT enquiry_id, lead_id, partner_id, partner_name FROM crm_enquiries WHERE enquiry_id = ${id}`
    if (!enq) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })

    // Build the update — note is optional; only update if provided
    if (note !== undefined) {
      await sql`
        UPDATE crm_enquiries
        SET partner_link_note = ${note},
            updated_at = NOW()
        WHERE enquiry_id = ${id}
      `
      // Log RM note activity
      await sql`
        INSERT INTO crm_activity_log (lead_id, enquiry_id, activity_type, title, description, performed_by)
        VALUES (${enq.lead_id}, ${id}, 'partner_note', 'RM note on partner referral', ${note}, ${user.name})
      `
      return NextResponse.json({ success: true })
    }

    // Tag / un-tag partner
    await sql`
      UPDATE crm_enquiries
      SET partner_id   = ${partnerId},
          partner_name = ${partnerName},
          updated_at   = NOW()
      WHERE enquiry_id = ${id}
    `

    const isTagging = !!partnerId

    if (isTagging) {
      // Log to crm_activity_log
      await sql`
        INSERT INTO crm_activity_log
          (lead_id, enquiry_id, activity_type, title, description, performed_by)
        VALUES
          (${enq.lead_id}, ${id}, 'partner_tagged',
           ${'Partner tagged: ' + partnerName},
           ${'Enquiry ' + id + ' tagged to partner ' + partnerName},
           ${user.name})
      `
      // Log to crm_partner_activity_log
      await sql`
        INSERT INTO crm_partner_activity_log
          (partner_id, activity_type, title, description, enquiry_id, lead_id, performed_by)
        VALUES
          (${partnerId}, 'enquiry_referred', 'Enquiry tagged',
           ${id}, ${id}, ${enq.lead_id}, ${user.name})
      `
    } else {
      // Removing partner — log removal
      const prevName = enq.partner_name || 'partner'
      await sql`
        INSERT INTO crm_activity_log
          (lead_id, enquiry_id, activity_type, title, performed_by)
        VALUES
          (${enq.lead_id}, ${id}, 'partner_removed',
           ${'Partner removed: ' + prevName}, ${user.name})
      `
    }

    const [updated] = await sql`SELECT * FROM crm_enquiries WHERE enquiry_id = ${id}`
    return NextResponse.json({ success: true, enquiry: updated })
  } catch (err) {
    console.error('[Enquiry Partner PATCH]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
