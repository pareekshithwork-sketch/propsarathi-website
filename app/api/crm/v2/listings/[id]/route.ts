import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  return verifyCRMToken(token || '')
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const [listing] = await sql`SELECT * FROM crm_listings WHERE listing_id = ${id}`
    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    return NextResponse.json({ success: true, listing })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const b = await request.json()

    const imagesJson = (b.images !== undefined && b.images !== null)
      ? JSON.stringify(b.images)
      : null
    const newStatus = b.status ?? null
    const newIsLive = (b.isLive ?? b.is_live) ?? null

    await sql`
      UPDATE crm_listings SET
        status             = COALESCE(${newStatus}, status),
        title              = COALESCE(${b.title             ?? null}, title),
        property_type      = COALESCE(${(b.propertyType ?? b.property_type) ?? null}, property_type),
        address            = COALESCE(${b.address           ?? null}, address),
        city               = COALESCE(${b.city              ?? null}, city),
        locality           = COALESCE(${b.locality          ?? null}, locality),
        bedrooms           = COALESCE(${b.bedrooms          ?? null}, bedrooms),
        bathrooms          = COALESCE(${b.bathrooms         ?? null}, bathrooms),
        area_sqft          = COALESCE(${(b.areaSqft ?? b.area_sqft) ?? null}, area_sqft),
        asking_price       = COALESCE(${(b.askingPrice ?? b.asking_price) ?? null}, asking_price),
        currency           = COALESCE(${b.currency          ?? null}, currency),
        seller_notes       = COALESCE(${(b.sellerNotes ?? b.seller_notes) ?? null}, seller_notes),
        possession_status  = COALESCE(${(b.possessionStatus ?? b.possession_status) ?? null}, possession_status),
        floor_number       = COALESCE(${(b.floorNumber ?? b.floor_number) ?? null}, floor_number),
        total_floors       = COALESCE(${(b.totalFloors ?? b.total_floors) ?? null}, total_floors),
        rm_visit_date      = COALESCE(${(b.rmVisitDate ?? b.rm_visit_date) ? new Date(b.rmVisitDate ?? b.rm_visit_date) : null}, rm_visit_date),
        rm_visit_notes     = COALESCE(${(b.rmVisitNotes ?? b.rm_visit_notes) ?? null}, rm_visit_notes),
        images             = CASE WHEN ${imagesJson}::jsonb IS NOT NULL THEN ${imagesJson}::jsonb ELSE images END,
        is_live            = COALESCE(${newIsLive}, is_live),
        slug               = COALESCE(${b.slug              ?? null}, slug),
        seo_title          = COALESCE(${(b.seoTitle ?? b.seo_title)         ?? null}, seo_title),
        seo_description    = COALESCE(${(b.seoDescription ?? b.seo_description) ?? null}, seo_description),
        rm_verified        = CASE WHEN ${newStatus} = 'rm_verified' THEN TRUE ELSE rm_verified END,
        rm_verified_by     = CASE WHEN ${newStatus} = 'rm_verified' THEN ${user.name} ELSE rm_verified_by END,
        rm_verified_at     = CASE WHEN ${newStatus} = 'rm_verified' THEN NOW() ELSE rm_verified_at END,
        admin_approved     = CASE WHEN ${newStatus} = 'admin_approved' THEN TRUE ELSE admin_approved END,
        admin_approved_by  = CASE WHEN ${newStatus} = 'admin_approved' THEN ${user.name} ELSE admin_approved_by END,
        admin_approved_at  = CASE WHEN ${newStatus} = 'admin_approved' THEN NOW() ELSE admin_approved_at END,
        published_at       = CASE WHEN ${newIsLive} = TRUE AND is_live = FALSE THEN NOW() ELSE published_at END,
        updated_at         = NOW()
      WHERE listing_id = ${id}
    `

    if (newStatus) {
      const [ls] = await sql`SELECT lead_id FROM crm_listings WHERE listing_id = ${id}`
      if (ls) {
        await sql`
          INSERT INTO crm_activity_log
            (lead_id, listing_id, activity_type, title, performed_by)
          VALUES
            (${ls.lead_id}, ${id}, 'listing_status_changed',
             ${'Listing status → ' + newStatus}, ${user.name})
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
