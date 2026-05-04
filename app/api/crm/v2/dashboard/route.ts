import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const isRm = user.role === 'rm'
  const rmName = user.name

  try {
    const results = await Promise.allSettled([
      // Overdue: scheduled_at < NOW(), still active, not in terminal stages
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE e.scheduled_at < NOW()
          AND e.scheduled_at IS NOT NULL
          AND e.status = 'active'
          AND e.stage NOT IN ('Book', 'Not Interested', 'Drop')
          AND l.is_deleted = FALSE
          AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
        ORDER BY e.scheduled_at ASC
        LIMIT 20
      `,

      // Due today
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE DATE(e.scheduled_at) = CURRENT_DATE
          AND e.status = 'active'
          AND l.is_deleted = FALSE
          AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
        ORDER BY e.scheduled_at ASC
        LIMIT 20
      `,

      // Site visits today
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE e.stage = 'Schedule Site Visit'
          AND DATE(e.scheduled_at) = CURRENT_DATE
          AND l.is_deleted = FALSE
          AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
        ORDER BY e.scheduled_at ASC
        LIMIT 10
      `,

      // Stats
      sql`
        SELECT
          (SELECT COUNT(*) FROM crm_leads_v2
           WHERE is_deleted = FALSE
             AND (${isRm} = FALSE OR assigned_rm = ${rmName})
          ) AS total_leads,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.status = 'active'
             AND l.is_deleted = FALSE
             AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
          ) AS active_enquiries,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.stage = 'Book'
             AND DATE_TRUNC('month', e.updated_at) = DATE_TRUNC('month', NOW())
             AND l.is_deleted = FALSE
             AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
          ) AS booked_this_month,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.stage = 'Schedule Site Visit'
             AND DATE_TRUNC('month', e.scheduled_at) = DATE_TRUNC('month', NOW())
             AND l.is_deleted = FALSE
             AND (${isRm} = FALSE OR l.assigned_rm = ${rmName})
          ) AS site_visits_this_month
      `,

      // Recent activity
      sql`
        SELECT a.id, a.activity_type, a.title, a.description,
               a.performed_by, a.created_at, a.lead_id
        FROM crm_activity_log a
        ${isRm
          ? sql`JOIN crm_leads_v2 l ON l.lead_id = a.lead_id WHERE l.assigned_rm = ${rmName}`
          : sql`WHERE TRUE`
        }
        ORDER BY a.created_at DESC
        LIMIT 10
      `,
    ])

    const overdueEnquiries = results[0].status === 'fulfilled' ? results[0].value : []
    const dueTodayEnquiries = results[1].status === 'fulfilled' ? results[1].value : []
    const siteVisitsToday = results[2].status === 'fulfilled' ? results[2].value : []
    const statsRows = results[3].status === 'fulfilled' ? results[3].value : []
    const recentActivity = results[4].status === 'fulfilled' ? results[4].value : []

    const s = statsRows[0] || {}
    return NextResponse.json({
      success: true,
      overdueEnquiries,
      dueTodayEnquiries,
      siteVisitsToday,
      myStats: {
        totalLeads: Number(s.total_leads ?? 0),
        activeEnquiries: Number(s.active_enquiries ?? 0),
        bookedThisMonth: Number(s.booked_this_month ?? 0),
        siteVisitsThisMonth: Number(s.site_visits_this_month ?? 0),
      },
      recentActivity,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
