import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

function maskPhone(phone: string): string {
  if (!phone) return '••••'
  const digits = phone.replace(/\D/g, '')
  return `••••${digits.slice(-4)}`
}

export async function GET(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const enquiries = await sql`
      SELECT
        e.enquiry_id, e.stage, e.created_at, e.partner_link_click, e.partner_link_note,
        l.name AS lead_name, l.phone AS lead_phone
      FROM crm_enquiries e
      LEFT JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
      WHERE e.partner_id = ${session.partnerId}
      ORDER BY e.created_at DESC
      LIMIT 100
    `

    const listings = await sql`
      SELECT ls.listing_id, ls.property_type, ls.status, ls.created_at,
             l.name AS lead_name
      FROM crm_listings ls
      LEFT JOIN crm_leads_v2 l ON l.lead_id = ls.lead_id
      WHERE ls.partner_id = ${session.partnerId}
      ORDER BY ls.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({
      success: true,
      enquiries: enquiries.map((e: any) => ({
        ...e,
        lead_phone: maskPhone(e.lead_phone || ''),
      })),
      listings,
    })
  } catch (err) {
    console.error('[Partner Referrals]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
