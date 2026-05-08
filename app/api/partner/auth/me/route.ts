import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function GET(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, partner: null })

  try {
    const [p] = await sql`
      SELECT partner_id, name, email, phone, country_code, status, tier,
             assigned_rm_name, profile_image, agreement_accepted, agreement_accepted_at,
             training_done, training_done_at, kyc_status, pan_number, aadhaar_number,
             gst_number, bank_account, bank_ifsc, bank_name, kyc_documents,
             profession_type, company_name, designation, experience_years,
             city, locality, areas_covered, referral_code, created_at
      FROM crm_partners
      WHERE partner_id = ${session.partnerId}
    `
    if (!p) return NextResponse.json({ success: false, partner: null })

    return NextResponse.json({ success: true, partner: p })
  } catch (err) {
    console.error('[Partner Me]', err)
    return NextResponse.json({ success: false, partner: null })
  }
}
