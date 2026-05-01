import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const city = searchParams.get('city') || ''
  const propertyType = searchParams.get('propertyType') || ''
  const isRm = user.role === 'rm'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

  try {
    const listings = await sql`
      SELECT ls.*, l.name AS lead_name, l.phone AS lead_phone,
             l.country_code AS lead_country_code, l.assigned_rm
      FROM crm_listings ls
      JOIN crm_leads_v2 l ON l.lead_id = ls.lead_id
      WHERE l.is_deleted = FALSE
        AND (${search} = '' OR ls.title ILIKE ${'%' + search + '%'} OR l.name ILIKE ${'%' + search + '%'} OR ls.locality ILIKE ${'%' + search + '%'})
        AND (${status} = '' OR ls.status = ${status})
        AND (${city} = '' OR ls.city ILIKE ${'%' + city + '%'})
        AND (${propertyType} = '' OR ls.property_type = ${propertyType})
        AND (${isRm} = FALSE OR l.assigned_rm = ${user.name})
      ORDER BY ls.updated_at DESC
      LIMIT ${limit}
    `
    return NextResponse.json({ success: true, listings })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

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
