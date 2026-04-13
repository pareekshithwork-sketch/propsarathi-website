import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'
import { getRecentHistory, getLeadsBySource } from '@/lib/crmSheets'
import { runCRMMigration } from '@/lib/crmMigration'

let migrationRun = false

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  if (!token || !verifyCRMToken(token)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

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

    // Overdue: Callback/Meeting/SiteVisit leads not updated in 2+ days
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const overdueLeads = leads.filter((l: any) =>
      ['Callback', 'Meeting', 'Site Visit'].includes(l.status) &&
      new Date(l.last_updated) < twoDaysAgo
    )

    // RM breakdown
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
      totalData: data.length,
      convertedData: data.filter((d: any) => d.converted).length,
      byStatus: [
        { name: 'New', value: leads.filter((l: any) => l.status === 'New').length },
        { name: 'Callback', value: leads.filter((l: any) => l.status === 'Callback').length },
        { name: 'Meeting', value: leads.filter((l: any) => l.status === 'Meeting').length },
        { name: 'Site Visit', value: leads.filter((l: any) => l.status === 'Site Visit').length },
        { name: 'EOI', value: leads.filter((l: any) => l.status === 'Expression of Interest').length },
        { name: 'Booked', value: leads.filter((l: any) => l.status === 'Booked').length },
        { name: 'Not Interested', value: leads.filter((l: any) => l.status === 'Not Interested').length },
        { name: 'Dropped', value: leads.filter((l: any) => l.status === 'Dropped').length },
      ],
      sourceCounts,
      byRM,
      recentActivity: history,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('[CRM Stats]', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
  }
}
