import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'
import { getRecentHistory, getLeadsBySource } from '@/lib/crmSheets'
import { runCRMMigration } from '@/lib/crmMigration'

let migrationRun = false

const STAGE_PROBABILITY: Record<string, number> = {
  'Expression of Interest': 0.30,
  'Site Visit': 0.15,
  'Meeting': 0.08,
  'Callback': 0.05,
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = token ? verifyCRMToken(token) : null
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  if (!migrationRun) {
    await runCRMMigration()
    migrationRun = true
  }

  try {
    const [leadRows, dataRows, history, sourceCounts] = await Promise.all([
      sql`SELECT *, last_updated FROM crm_leads WHERE is_deleted = FALSE`,
      sql`SELECT converted FROM crm_data`,
      getRecentHistory(15),
      getLeadsBySource(),
    ])

    const leads = leadRows
    const data = dataRows

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const overdueLeads = leads.filter((l: any) =>
      ['Callback', 'Meeting', 'Site Visit'].includes(l.status) &&
      new Date(l.last_updated) < twoDaysAgo
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayVisits = leads.filter((l: any) => {
      if (l.status !== 'Site Visit' || !l.scheduled_at) return false
      const d = new Date(l.scheduled_at)
      return d >= today && d < tomorrow
    })

    const dueToday = leads.filter((l: any) => {
      if (!['Callback', 'Meeting'].includes(l.status) || !l.scheduled_at) return false
      const d = new Date(l.scheduled_at)
      return d >= today && d < tomorrow
    })

    // Revenue forecast (admin only)
    const revenueForecast = user.role === 'admin' ? (() => {
      const stages = Object.entries(STAGE_PROBABILITY).map(([stage, prob]) => {
        const stageLeads = leads.filter((l: any) => l.status === stage)
        const totalValue = stageLeads.reduce((sum: number, l: any) => {
          const val = parseFloat(l.max_budget || l.agreement_value || '0')
          return sum + (isNaN(val) ? 0 : val)
        }, 0)
        return {
          stage,
          count: stageLeads.length,
          totalValue,
          probability: prob,
          forecastValue: Math.round(totalValue * prob),
        }
      })
      return {
        stages,
        totalForecast: stages.reduce((s, r) => s + r.forecastValue, 0),
      }
    })() : null

    // RM breakdown + leaderboard (admin only)
    const rmList = ['Pareekshith Rawal', 'Kushal Rawal', 'Anil Kumar', 'Siva Kali']
    const byRM = rmList.map(rm => ({
      name: rm,
      total: leads.filter((l: any) => l.assigned_rm === rm).length,
      new: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'New').length,
      pending: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Callback').length,
      overdue: overdueLeads.filter((l: any) => l.assigned_rm === rm).length,
      eoi: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Expression of Interest').length,
      callbacks: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Callback').length,
      meetings: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Meeting').length,
      siteVisits: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Site Visit').length,
      booked: leads.filter((l: any) => l.assigned_rm === rm && l.status === 'Booked').length,
    }))

    const leaderboard = user.role === 'admin' ? rmList.map(rm => {
      const rmLeads = leads.filter((l: any) => l.assigned_rm === rm)
      const booked = rmLeads.filter((l: any) => l.status === 'Booked')
      const totalRevenue = booked.reduce((s: number, l: any) => {
        const v = parseFloat(l.agreement_value || '0')
        return s + (isNaN(v) ? 0 : v)
      }, 0)
      const active = rmLeads.filter((l: any) => !['Booked', 'Dropped', 'Not Interested'].includes(l.status))
      const conversionRate = rmLeads.length > 0 ? Math.round(booked.length / rmLeads.length * 100) : 0

      // This month
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
      const bookedThisMonth = booked.filter((l: any) => new Date(l.booked_date || l.last_updated) >= startOfMonth)
      const revenueThisMonth = bookedThisMonth.reduce((s: number, l: any) => {
        const v = parseFloat(l.agreement_value || '0')
        return s + (isNaN(v) ? 0 : v)
      }, 0)

      return {
        rmName: rm,
        totalEnquiries: rmLeads.length,
        activeEnquiries: active.length,
        bookedCount: booked.length,
        totalRevenue,
        conversionRate,
        thisMonth: { booked: bookedThisMonth.length, revenue: revenueThisMonth },
      }
    }).sort((a, b) => b.bookedCount - a.bookedCount).slice(0, 10) : []

    const stats = {
      totalLeads: leads.length,
      newLeads: leads.filter((l: any) => l.status === 'New').length,
      activeLeads: leads.filter((l: any) => !['Booked', 'Dropped', 'Not Interested'].includes(l.status)).length,
      unassigned: leads.filter((l: any) => !l.assigned_rm).length,
      deletedLeads: 0,
      callbackLeads: leads.filter((l: any) => l.status === 'Callback').length,
      siteVisits: leads.filter((l: any) => l.status === 'Site Visit').length,
      meetings: leads.filter((l: any) => l.status === 'Meeting').length,
      booked: leads.filter((l: any) => l.status === 'Booked').length,
      bookingCancel: 0,
      dropped: leads.filter((l: any) => l.status === 'Dropped').length,
      notInterested: leads.filter((l: any) => l.status === 'Not Interested').length,
      eoi: leads.filter((l: any) => l.status === 'Expression of Interest').length,
      overdue: overdueLeads.length,
      overdueLeads: overdueLeads.slice(0, 10),
      todaySiteVisits: todayVisits.slice(0, 10),
      dueToday: dueToday.slice(0, 10),
      totalData: data.length,
      convertedData: data.filter((d: any) => d.converted).length,
      byStatus: [
        { name: 'New', value: leads.filter((l: any) => l.status === 'New').length },
        { name: 'Callback', value: leads.filter((l: any) => l.status === 'Callback').length },
        { name: 'Meeting', value: leads.filter((l: any) => l.status === 'Meeting').length },
        { name: 'Site Visit', value: leads.filter((l: any) => l.status === 'Site Visit').length },
        { name: 'EOI', value: leads.filter((l: any) => l.status === 'Expression of Interest').length },
        { name: 'Booked', value: leads.filter((l: any) => l.status === 'Booked').length },
        { name: 'NI', value: leads.filter((l: any) => l.status === 'Not Interested').length },
        { name: 'Dropped', value: leads.filter((l: any) => l.status === 'Dropped').length },
      ],
      sourceCounts,
      byRM,
      recentActivity: history,
      revenueForecast,
      leaderboard,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('[CRM Stats]', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
  }
}
