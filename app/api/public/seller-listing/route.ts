import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, phone, email = '',
      propertyType = '', bedrooms = 0, areaSqft = 0,
      city = '', locality = '', address = '',
      askingPrice = 0, currency = 'INR', notes = '',
    } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }

    // Match existing lead by last 10 digits of phone
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const existing = await sql`
      SELECT lead_id FROM crm_leads_v2
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${cleanPhone}
        AND is_deleted = FALSE
      LIMIT 1
    `

    let leadId: string
    if (existing.length > 0) {
      leadId = existing[0].lead_id
    } else {
      const [newLead] = await sql`
        INSERT INTO crm_leads_v2
          (name, phone, email, source, lead_type, created_by)
        VALUES
          (${name.trim()}, ${phone.trim()}, ${email.trim()},
           'Website Listing', 'Seller', 'public')
        RETURNING lead_id
      `
      leadId = newLead.lead_id
      await sql`
        INSERT INTO crm_activity_log
          (lead_id, activity_type, title, performed_by)
        VALUES
          (${leadId}, 'lead_created', 'Lead created via website listing form', 'system')
      `
    }

    // Auto-generate a title from the details
    const bedsStr = bedrooms > 0 && !['Plot', 'Commercial', 'Office'].includes(propertyType)
      ? `${bedrooms} BHK `
      : ''
    const title = `${bedsStr}${propertyType || 'Property'}${locality ? ', ' + locality : ''}${city ? ', ' + city : ''}`

    const [listing] = await sql`
      INSERT INTO crm_listings
        (lead_id, title, property_type, city, locality, address,
         bedrooms, area_sqft, asking_price, currency,
         seller_notes, status, created_by)
      VALUES
        (${leadId}, ${title}, ${propertyType}, ${city}, ${locality}, ${address},
         ${Number(bedrooms) || 0}, ${Number(areaSqft) || 0},
         ${Number(askingPrice) || 0}, ${currency},
         ${notes}, 'pending', 'public')
      RETURNING listing_id
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, listing_id, activity_type, title, performed_by)
      VALUES
        (${leadId}, ${listing.listing_id}, 'listing_added',
         ${'Seller listing submitted via website: ' + title}, 'system')
    `

    return NextResponse.json({ success: true, listingId: listing.listing_id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
