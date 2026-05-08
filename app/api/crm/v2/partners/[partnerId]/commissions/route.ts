import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { calculateTier } from '@/lib/partnerTier'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

const GM_ROLES = ['gm', 'admin', 'super_admin']

export async function GET(request: NextRequest, { params }: { params: { partnerId: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = params
  try {
    const commissions = await sql`
      SELECT * FROM crm_partner_commissions
      WHERE partner_id = ${partnerId}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, commissions })
  } catch {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { partnerId: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = params
  try {
    const body = await request.json()
    const {
      enquiryId = null, leadId = '', leadName = '',
      dealValue = 0, commissionType = 'percentage',
      commissionValue = 0, splitPercentage = 100,
      milestone = 'Booking',
    } = body

    const dv = Number(dealValue)
    const cv = Number(commissionValue)
    const sp = Number(splitPercentage)
    const commissionAmount = commissionType === 'percentage'
      ? dv * (cv / 100) * (sp / 100)
      : cv * (sp / 100)

    const [commission] = await sql`
      INSERT INTO crm_partner_commissions
        (partner_id, enquiry_id, lead_id, lead_name,
         deal_value, commission_type, commission_value,
         commission_amount, split_percentage, milestone, created_by)
      VALUES
        (${partnerId}, ${enquiryId}, ${leadId}, ${leadName},
         ${dv}, ${commissionType}, ${cv},
         ${commissionAmount}, ${sp}, ${milestone}, ${user.name})
      RETURNING *
    `

    await sql`
      INSERT INTO crm_partner_activity_log
        (partner_id, activity_type, title, description, enquiry_id, lead_id, performed_by)
      VALUES
        (${partnerId}, 'commission_created', 'Commission added',
         ${`${milestone}: ₹${commissionAmount.toFixed(0)}`},
         ${enquiryId || ''}, ${leadId}, ${user.name})
    `

    return NextResponse.json({ success: true, commission })
  } catch {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { partnerId: string } }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = params
  try {
    const body = await request.json()
    const { commissionId, action, paymentReference = '' } = body

    if (!commissionId || !action) {
      return NextResponse.json({ success: false, error: 'commissionId and action required' }, { status: 400 })
    }

    if ((action === 'approve' || action === 'paid') && !GM_ROLES.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'GM or admin required' }, { status: 403 })
    }

    let updated: any
    if (action === 'approve') {
      ;[updated] = await sql`
        UPDATE crm_partner_commissions
        SET status = 'Approved', approved_by = ${user.name}, approved_at = NOW(), updated_at = NOW()
        WHERE commission_id = ${commissionId} AND partner_id = ${partnerId}
        RETURNING *
      `
      await sql`
        INSERT INTO crm_partner_activity_log
          (partner_id, activity_type, title, performed_by)
        VALUES (${partnerId}, 'commission_approved', 'Commission approved', ${user.name})
      `
    } else if (action === 'paid') {
      ;[updated] = await sql`
        UPDATE crm_partner_commissions
        SET status = 'Paid', paid_at = NOW(), payment_reference = ${paymentReference}, updated_at = NOW()
        WHERE commission_id = ${commissionId} AND partner_id = ${partnerId}
        RETURNING *
      `
      await sql`
        INSERT INTO crm_partner_activity_log
          (partner_id, activity_type, title, performed_by)
        VALUES (${partnerId}, 'commission_paid', 'Commission paid', ${user.name})
      `

      // Recalculate tier after booking approval
      const bookings = await sql`
        SELECT COUNT(*) AS cnt FROM crm_partner_commissions
        WHERE partner_id = ${partnerId} AND milestone = 'Booking' AND status IN ('Approved','Paid')
      `
      const newTier = calculateTier(Number(bookings[0].cnt))
      await sql`UPDATE crm_partners SET tier = ${newTier}, updated_at = NOW() WHERE partner_id = ${partnerId}`
    } else {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, commission: updated })
  } catch {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
