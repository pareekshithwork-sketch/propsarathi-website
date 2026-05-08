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
    const { partnerId = '', partnerName = '' } = body

    const [ls] = await sql`SELECT listing_id, lead_id, partner_id, partner_name FROM crm_listings WHERE listing_id = ${id}`
    if (!ls) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })

    await sql`
      UPDATE crm_listings
      SET partner_id   = ${partnerId},
          partner_name = ${partnerName},
          updated_at   = NOW()
      WHERE listing_id = ${id}
    `

    const isTagging = !!partnerId

    if (isTagging) {
      await sql`
        INSERT INTO crm_activity_log
          (lead_id, listing_id, activity_type, title, description, performed_by)
        VALUES
          (${ls.lead_id}, ${id}, 'partner_tagged',
           ${'Partner tagged: ' + partnerName},
           ${'Listing ' + id + ' tagged to partner ' + partnerName},
           ${user.name})
      `
      await sql`
        INSERT INTO crm_partner_activity_log
          (partner_id, activity_type, title, description, enquiry_id, lead_id, performed_by)
        VALUES
          (${partnerId}, 'listing_referred', 'Listing tagged',
           ${id}, ${id}, ${ls.lead_id}, ${user.name})
      `
    } else {
      const prevName = ls.partner_name || 'partner'
      await sql`
        INSERT INTO crm_activity_log
          (lead_id, listing_id, activity_type, title, performed_by)
        VALUES
          (${ls.lead_id}, ${id}, 'partner_removed',
           ${'Partner removed: ' + prevName}, ${user.name})
      `
    }

    const [updated] = await sql`SELECT * FROM crm_listings WHERE listing_id = ${id}`
    return NextResponse.json({ success: true, listing: updated })
  } catch (err) {
    console.error('[Listing Partner PATCH]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
