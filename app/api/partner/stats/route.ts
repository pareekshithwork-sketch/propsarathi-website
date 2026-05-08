import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function GET(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [p] = await sql`SELECT tier, last_login FROM crm_partners WHERE partner_id = ${session.partnerId}`

    const [enquiryStats] = await sql`
      SELECT
        COUNT(*) AS total_enquiries,
        SUM(CASE WHEN stage = 'Book' THEN 1 ELSE 0 END) AS total_bookings,
        MAX(created_at) AS last_enquiry_date
      FROM crm_enquiries WHERE partner_id = ${session.partnerId}
    `

    const [listingStats] = await sql`
      SELECT COUNT(*) AS total_listings FROM crm_listings WHERE partner_id = ${session.partnerId}
    `

    const [commStats] = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN commission_amount ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'Approved' THEN commission_amount ELSE 0 END), 0) AS approved,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN commission_amount ELSE 0 END), 0) AS paid
      FROM crm_partner_commissions WHERE partner_id = ${session.partnerId}
    `

    const activity = await sql`
      SELECT id, activity_type, title, description, created_at
      FROM crm_partner_activity_log
      WHERE partner_id = ${session.partnerId}
      ORDER BY created_at DESC LIMIT 5
    `

    const totalEnq = Number(enquiryStats.total_enquiries || 0)
    const totalBook = Number(enquiryStats.total_bookings || 0)
    const totalList = Number(listingStats.total_listings || 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalReferred: totalEnq + totalList,
        totalEnquiries: totalEnq,
        totalListings: totalList,
        totalBookings: totalBook,
        conversionRate: totalEnq > 0 ? Math.round(totalBook / totalEnq * 100) : 0,
        commissionPending: Number(commStats.pending || 0),
        commissionApproved: Number(commStats.approved || 0),
        commissionPaid: Number(commStats.paid || 0),
        lastReferralDate: enquiryStats.last_enquiry_date || null,
        tier: p?.tier || 'Bronze',
        recentActivity: activity,
      },
    })
  } catch (err) {
    console.error('[Partner Stats]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
