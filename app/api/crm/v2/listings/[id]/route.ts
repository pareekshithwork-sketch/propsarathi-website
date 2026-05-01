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

    await sql`
      UPDATE crm_listings SET
        status             = COALESCE(${b.status            ?? null}, status),
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
        updated_at         = NOW()
      WHERE listing_id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
