import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function GET(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const commissions = await sql`
      SELECT
        commission_id, lead_name, deal_value, commission_amount,
        commission_type, split_percentage, milestone, status,
        created_at, approved_at, paid_at, payment_reference
      FROM crm_partner_commissions
      WHERE partner_id = ${session.partnerId}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, commissions })
  } catch (err) {
    console.error('[Partner Commissions]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
