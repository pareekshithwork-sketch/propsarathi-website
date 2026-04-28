import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      leadId, title = '', propertyType = '', address = '',
      city = '', locality = '',
      bedrooms = 0, bathrooms = 0, areaSqft = 0,
      askingPrice = 0, currency = 'INR', sellerNotes = '',
    } = body

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 })
    }

    const [listing] = await sql`
      INSERT INTO crm_listings
        (lead_id, title, property_type, address,
         city, locality, bedrooms, bathrooms,
         area_sqft, asking_price, currency,
         seller_notes, created_by)
      VALUES
        (${leadId}, ${title}, ${propertyType}, ${address},
         ${city}, ${locality}, ${bedrooms}, ${bathrooms},
         ${areaSqft}, ${askingPrice}, ${currency},
         ${sellerNotes}, ${user.name})
      RETURNING *
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, listing_id, activity_type, title, performed_by)
      VALUES
        (${leadId}, ${listing.listing_id}, 'listing_added',
         ${'New listing added: ' + (title || 'Untitled')}, ${user.name})
    `

    return NextResponse.json({ success: true, listingId: listing.listing_id, listing })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
