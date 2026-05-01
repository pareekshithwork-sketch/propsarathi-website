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
    const [enquiry] = await sql`SELECT * FROM crm_enquiries WHERE enquiry_id = ${id}`
    if (!enquiry) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })

    const history = await sql`
      SELECT * FROM crm_stage_history
      WHERE enquiry_id = ${id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ success: true, enquiry, history })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const b = body

    await sql`
      UPDATE crm_enquiries SET
        project_slug  = COALESCE(${(b.projectSlug  ?? b.project_slug)  ?? null}, project_slug),
        project_name  = COALESCE(${(b.projectName  ?? b.project_name)  ?? null}, project_name),
        property_type = COALESCE(${(b.propertyType ?? b.property_type) ?? null}, property_type),
        min_budget    = COALESCE(${b.minBudget     ?? null}, min_budget),
        max_budget    = COALESCE(${b.maxBudget     ?? null}, max_budget),
        currency      = COALESCE(${b.currency      ?? null}, currency),
        bedrooms      = COALESCE(${b.bedrooms      ?? null}, bedrooms),
        location_pref = COALESCE(${(b.locationPref ?? b.location_pref) ?? null}, location_pref),
        purpose       = COALESCE(${b.purpose       ?? null}, purpose),
        buyer_type    = COALESCE(${(b.buyerType    ?? b.buyer_type)    ?? null}, buyer_type),
        updated_at    = NOW()
      WHERE enquiry_id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
