import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const [listing] = await sql`SELECT lead_id FROM crm_listings WHERE listing_id = ${id}`
    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })

    await sql`
      UPDATE crm_listings
      SET rm_verified    = TRUE,
          rm_verified_by = ${user.name},
          rm_verified_at = NOW(),
          status         = 'rm_verified',
          updated_at     = NOW()
      WHERE listing_id = ${id}
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, listing_id, activity_type, title, performed_by)
      VALUES
        (${listing.lead_id}, ${id}, 'listing_verified', 'Listing verified by RM', ${user.name})
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
