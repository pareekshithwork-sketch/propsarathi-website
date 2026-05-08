import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function POST(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { pan_number, aadhaar_number, gst_number, bank_account_number, bank_ifsc, bank_name } = await request.json()

    await sql`
      UPDATE crm_partners SET
        pan_number          = ${pan_number || null},
        aadhaar_number      = ${aadhaar_number || null},
        gst_number          = ${gst_number || null},
        bank_account_number = ${bank_account_number || null},
        bank_ifsc           = ${bank_ifsc || null},
        bank_name           = ${bank_name || null},
        kyc_status          = 'Pending',
        updated_at          = NOW()
      WHERE partner_id = ${session.partnerId}
    `

    await sql`
      INSERT INTO crm_partner_activity_log
        (partner_id, activity_type, title, description, performed_by)
      VALUES
        (${session.partnerId}, 'kyc_submitted', 'KYC Submitted', 'KYC documents submitted for verification', 'partner')
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Partner KYC]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
