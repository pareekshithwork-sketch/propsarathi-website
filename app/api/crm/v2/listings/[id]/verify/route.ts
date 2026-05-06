import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const isRm = user.role === 'rm'
  if (!isRm && !isAdmin) {
    return NextResponse.json({ success: false, error: 'RM or admin access required' }, { status: 403 })
  }

  const { id } = await params
  try {
    const [listing] = await sql`
      SELECT ls.lead_id, l.assigned_rm
      FROM crm_listings ls
      JOIN crm_leads_v2 l ON l.lead_id = ls.lead_id
      WHERE ls.listing_id = ${id}
    `
    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })

    if (isRm && listing.assigned_rm !== user.name) {
      return NextResponse.json({ success: false, error: 'You can only verify listings for your own leads' }, { status: 403 })
    }

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
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
