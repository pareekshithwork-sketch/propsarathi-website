import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function PATCH(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { company_name, rera_number, city, experience_years } = await request.json()

    await sql`
      UPDATE crm_partners SET
        company_name    = COALESCE(${company_name ?? null}, company_name),
        rera_number     = COALESCE(${rera_number ?? null}, rera_number),
        city            = COALESCE(${city ?? null}, city),
        experience_years = COALESCE(${experience_years ?? null}, experience_years),
        updated_at      = NOW()
      WHERE partner_id = ${session.partnerId}
    `
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Partner Profile PATCH]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
