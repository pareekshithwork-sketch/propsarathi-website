import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

const ADMIN_ROLES = ['admin', 'super_admin']

export async function GET(request: NextRequest) {
  const user = verifyCRMToken(request.cookies.get('crm_token')?.value || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const isAdmin = ADMIN_ROLES.includes(user.role)

    if (isAdmin) {
      // Admins can tag any active partner — all go in myPartners
      const partners = await sql`
        SELECT partner_id, name, assigned_rm_name, tier, phone
        FROM crm_partners
        WHERE status = 'Active'
        ORDER BY name ASC
      `
      return NextResponse.json({ success: true, myPartners: partners, otherPartners: [] })
    }

    // RM: split into my partners vs others
    const myPartners = await sql`
      SELECT partner_id, name, assigned_rm_name, tier, phone
      FROM crm_partners
      WHERE status = 'Active'
        AND assigned_rm_name = ${user.name}
      ORDER BY name ASC
    `

    const otherPartners = await sql`
      SELECT partner_id, name, assigned_rm_name, tier, phone
      FROM crm_partners
      WHERE status = 'Active'
        AND (assigned_rm_name IS NULL OR assigned_rm_name != ${user.name})
      ORDER BY name ASC
    `

    return NextResponse.json({ success: true, myPartners, otherPartners })
  } catch (err) {
    console.error('[Partners Dropdown]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
