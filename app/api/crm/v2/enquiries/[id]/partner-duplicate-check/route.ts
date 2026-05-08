import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone') || ''

  if (!phone) return NextResponse.json({ isDuplicate: false })

  try {
    // Normalise to last 10 digits for matching
    const digits = phone.replace(/\D/g, '')
    const last10 = digits.slice(-10)

    if (!last10) return NextResponse.json({ isDuplicate: false })

    // Find leads with a matching phone that already have a partner-tagged enquiry
    const rows = await sql`
      SELECT
        l.lead_id, l.name AS lead_name,
        e.enquiry_id, e.partner_id, e.partner_name, e.updated_at AS first_referral_date,
        p.assigned_rm_name AS existing_partner_rm
      FROM crm_leads_v2 l
      JOIN crm_enquiries e ON e.lead_id = l.lead_id
      LEFT JOIN crm_partners p ON p.partner_id = e.partner_id
      WHERE RIGHT(REGEXP_REPLACE(l.phone, '[^0-9]', '', 'g'), 10) = ${last10}
        AND e.partner_id != ''
        AND e.enquiry_id != ${id}
        AND l.is_deleted = FALSE
      ORDER BY e.updated_at ASC
      LIMIT 1
    `

    if (rows.length === 0) return NextResponse.json({ isDuplicate: false })

    const r = rows[0]
    return NextResponse.json({
      isDuplicate: true,
      existingLeadId: r.lead_id,
      existingLeadName: r.lead_name,
      existingPartnerId: r.partner_id,
      existingPartnerName: r.partner_name,
      existingPartnerRM: r.existing_partner_rm || '',
      firstReferralDate: r.first_referral_date,
    })
  } catch (err) {
    console.error('[Partner Duplicate Check]', err)
    return NextResponse.json({ isDuplicate: false })
  }
}
