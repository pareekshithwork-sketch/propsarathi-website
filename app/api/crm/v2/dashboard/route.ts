import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'
import { validateScope, buildEnquiriesScopeWhere, buildLeadsScopeWhere } from '@/lib/scopeFilter'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const scope = validateScope(searchParams.get('scope'), user.role)
  const eScope = buildEnquiriesScopeWhere(scope, user.name, user.teamId)
  const lScope = buildLeadsScopeWhere(scope, user.name, user.teamId)

  try {
    const results = await Promise.allSettled([
      // Overdue: scheduled_at < NOW(), still active, not in terminal stages
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.country_code AS lead_country_code, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE e.scheduled_at < NOW()
          AND e.scheduled_at IS NOT NULL
          AND e.status = 'active'
          AND e.stage NOT IN ('Book', 'Not Interested', 'Drop')
          AND l.is_deleted = FALSE
          ${eScope}
        ORDER BY e.scheduled_at ASC
        LIMIT 20
      `,

      // Due today
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.country_code AS lead_country_code, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE DATE(e.scheduled_at) = CURRENT_DATE
          AND e.status = 'active'
          AND l.is_deleted = FALSE
          ${eScope}
        ORDER BY e.scheduled_at ASC
        LIMIT 20
      `,

      // Site visits today
      sql`
        SELECT
          e.enquiry_id, e.stage, e.sub_stage, e.scheduled_at, e.lead_id,
          l.name AS lead_name, l.phone AS lead_phone, l.country_code AS lead_country_code, l.assigned_rm
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE e.stage = 'Schedule Site Visit'
          AND DATE(e.scheduled_at) = CURRENT_DATE
          AND l.is_deleted = FALSE
          ${eScope}
        ORDER BY e.scheduled_at ASC
        LIMIT 10
      `,

      // Stats (scope-aware)
      sql`
        SELECT
          (SELECT COUNT(*) FROM crm_leads_v2 l
           WHERE l.is_deleted = FALSE
             ${lScope}
          ) AS total_leads,
          (SELECT COUNT(*) FROM crm_leads_v2 l
           WHERE l.is_deleted = FALSE
             AND (l.assigned_rm IS NULL OR l.assigned_rm = '')
             ${lScope}
          ) AS unassigned_leads,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.status = 'active'
             AND l.is_deleted = FALSE
             ${eScope}
          ) AS active_enquiries,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.stage = 'Book'
             AND DATE_TRUNC('month', e.updated_at) = DATE_TRUNC('month', NOW())
             AND l.is_deleted = FALSE
             ${eScope}
          ) AS booked_this_month,
          (SELECT COUNT(*) FROM crm_enquiries e
           JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
           WHERE e.stage = 'Schedule Site Visit'
             AND DATE_TRUNC('month', e.scheduled_at) = DATE_TRUNC('month', NOW())
             AND l.is_deleted = FALSE
             ${eScope}
          ) AS site_visits_this_month
      `,

      // Recent activity
      sql`
        SELECT a.id, a.activity_type, a.title, a.description,
               a.performed_by, a.created_at, a.lead_id
        FROM crm_activity_log a
        ${scope === 'org'
          ? sql`WHERE TRUE`
          : sql`JOIN crm_leads_v2 l ON l.lead_id = a.lead_id WHERE l.is_deleted = FALSE ${eScope}`
        }
        ORDER BY a.created_at DESC
        LIMIT 10
      `,

      // Partner activity feed
      sql`
        SELECT pal.id, pal.activity_type, pal.title, pal.description,
               pal.enquiry_id, pal.lead_id, pal.created_at,
               p.name AS partner_name, p.tier AS partner_tier
        FROM crm_partner_activity_log pal
        JOIN crm_partners p ON p.partner_id = pal.partner_id
        WHERE pal.activity_type IN ('enquiry_referred', 'listing_referred', 'note_added')
          ${scope === 'my'
            ? sql`AND p.assigned_rm_name = ${user.name}`
            : scope === 'org'
              ? sql``
              : user.teamId
                ? sql`AND p.assigned_rm_id IN (SELECT id FROM crm_users WHERE team_id = ${user.teamId} AND is_active = TRUE)`
                : sql`AND p.assigned_rm_name = ${user.name}`
          }
        ORDER BY pal.created_at DESC
        LIMIT 5
      `,

      // Pipeline stage counts from active enquiries (scope-aware)
      sql`
        SELECT e.stage, COUNT(*)::int AS count
        FROM crm_enquiries e
        JOIN crm_leads_v2 l ON l.lead_id = e.lead_id
        WHERE e.status = 'active'
          AND l.is_deleted = FALSE
          ${eScope}
        GROUP BY e.stage
      `,

      // Source breakdown from leads (scope-aware)
      sql`
        SELECT source, COUNT(*)::int AS count
        FROM crm_leads_v2 l
        WHERE l.is_deleted = FALSE
          ${lScope}
        GROUP BY source
        ORDER BY count DESC
        LIMIT 20
      `,

      // RM breakdown — lead count + booked this month per RM
      sql`
        SELECT
          l.assigned_rm AS name,
          COUNT(DISTINCT l.lead_id)::int AS total,
          COUNT(DISTINCT CASE WHEN e.stage = 'New' AND e.status = 'active' THEN e.enquiry_id END)::int AS new_count,
          COUNT(DISTINCT CASE WHEN e.stage = 'Callback' AND e.status = 'active' THEN e.enquiry_id END)::int AS callbacks,
          COUNT(DISTINCT CASE WHEN e.stage = 'Schedule Meeting' AND e.status = 'active' THEN e.enquiry_id END)::int AS meetings,
          COUNT(DISTINCT CASE WHEN e.stage = 'Schedule Site Visit' AND e.status = 'active' THEN e.enquiry_id END)::int AS site_visits,
          COUNT(DISTINCT CASE WHEN e.stage = 'Expression Of Interest' AND e.status = 'active' THEN e.enquiry_id END)::int AS eoi,
          COUNT(DISTINCT CASE WHEN e.stage = 'Book' AND DATE_TRUNC('month', e.updated_at) = DATE_TRUNC('month', NOW()) THEN e.enquiry_id END)::int AS booked
        FROM crm_leads_v2 l
        LEFT JOIN crm_enquiries e ON e.lead_id = l.lead_id
        WHERE l.is_deleted = FALSE
          AND l.assigned_rm IS NOT NULL AND l.assigned_rm != ''
          ${lScope}
        GROUP BY l.assigned_rm
        ORDER BY total DESC
      `,
    ])

    const overdueEnquiries = results[0].status === 'fulfilled' ? results[0].value : []
    const dueTodayEnquiries = results[1].status === 'fulfilled' ? results[1].value : []
    const siteVisitsToday = results[2].status === 'fulfilled' ? results[2].value : []
    const statsRows = results[3].status === 'fulfilled' ? results[3].value : []
    const recentActivity = results[4].status === 'fulfilled' ? results[4].value : []
    const partnerActivity = results[5].status === 'fulfilled' ? results[5].value : []
    const pipelineRows = results[6].status === 'fulfilled' ? results[6].value : []
    const sourceRows = results[7].status === 'fulfilled' ? results[7].value : []
    const byRMRows = results[8].status === 'fulfilled' ? results[8].value : []

    const s = statsRows[0] || {}

    // Build pipeline stage map
    const pipelineStats: Record<string, number> = {}
    for (const r of pipelineRows) pipelineStats[r.stage] = r.count

    return NextResponse.json({
      success: true,
      overdueEnquiries,
      dueTodayEnquiries,
      siteVisitsToday,
      myStats: {
        totalLeads: Number(s.total_leads ?? 0),
        unassignedLeads: Number(s.unassigned_leads ?? 0),
        activeEnquiries: Number(s.active_enquiries ?? 0),
        bookedThisMonth: Number(s.booked_this_month ?? 0),
        siteVisitsThisMonth: Number(s.site_visits_this_month ?? 0),
      },
      pipelineStats,
      sourceStats: sourceRows,
      byRM: byRMRows,
      recentActivity,
      partnerActivity,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
