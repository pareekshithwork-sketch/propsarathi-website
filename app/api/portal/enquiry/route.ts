import { type NextRequest, NextResponse } from 'next/server'
import { verifyPortalToken } from '@/lib/portalAuth'
import { getViewerByPhone, logPageView, updateViewerCRMLead } from '@/lib/projectsDb'
import { addCRMLead, addCRMHistory, getCRMLeads } from '@/lib/crmSheets'
import sql from '@/lib/db'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const rows = await sql`SELECT * FROM portal_enquiries ORDER BY created_at DESC LIMIT 200`
    return NextResponse.json({ success: true, enquiries: rows })
  } catch (e) {
    return NextResponse.json({ success: true, enquiries: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      projectSlug, projectName, type = 'enquiry',
      durationSeconds = 0, name, phone, countryCode = '+91', email, notes
    } = body

    let viewerId: number | null = null
    let viewerPhone = phone
    let viewerName = name
    let viewerCountryCode = countryCode

    // Check if portal token exists
    const token = request.cookies.get('portal_token')?.value
    if (token) {
      const viewer = verifyPortalToken(token)
      if (viewer) {
        viewerId = viewer.id
        viewerPhone = viewer.phone
        viewerName = viewer.name
        viewerCountryCode = viewer.countryCode
      }
    }

    if (!viewerPhone) {
      return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 })
    }

    // Log page view if duration provided
    if (viewerId && durationSeconds > 0) {
      await logPageView(viewerId, projectSlug, durationSeconds, true)
    }

    // Determine lead intent label
    // type = 'enquiry'       → filled enquiry form = "Enquired"
    // type = 'browsing'      → spent 1min on page, logged in, no form = "Browsing"
    // type = 'auto_recheck'  → legacy, treat as browsing
    const isBrowsing = type === 'browsing' || type === 'auto_recheck'
    const intentLabel = isBrowsing ? 'Browsing' : 'Enquired'
    const intentTag = isBrowsing ? 'Warm' : 'Hot'

    // Check if lead already exists in CRM (same phone)
    const existingLeads = await getCRMLeads()
    const existing = existingLeads.find(l => l.phone === viewerPhone)

    if (existing) {
      // Add activity to existing lead's history
      await addCRMHistory({
        recordId: existing.leadId,
        recordType: 'lead',
        action: `${intentLabel}: ${projectName}${isBrowsing ? ` (browsed ~${durationSeconds}s)` : ' (submitted enquiry form)'}`,
        changedBy: 'Portal (Auto)',
        oldStatus: existing.status,
        newStatus: existing.status,
        notes: `Project: ${projectName} | Intent: ${intentLabel}`,
      })
      return NextResponse.json({ success: true, type: 're-activity', leadId: existing.leadId, intent: intentLabel })
    }

    // Create new CRM lead
    const leadId = `LEAD-${Date.now()}`
    const sourceLabel = isBrowsing ? 'Website (Browsing)' : 'Website (Enquiry)'
    await addCRMLead({
      leadId,
      clientName: viewerName || viewerPhone,
      phone: viewerPhone,
      countryCode: viewerCountryCode,
      email: email || '',
      source: sourceLabel,
      status: 'New',
      city: '',
      propertyType: '',
      budget: '',
      assignedRM: '',
      notes: `${intentLabel} on: ${projectName}${notes ? ' | ' + notes : ''}`,
      tags: intentTag,
      projectEnquired: projectName,
    })

    await addCRMHistory({
      recordId: leadId,
      recordType: 'lead',
      action: `${intentLabel}: ${projectName}`,
      changedBy: 'Portal (Auto)',
      oldStatus: '',
      newStatus: 'New',
      notes: `Project: ${projectName} | Intent: ${intentLabel} | Source: ${sourceLabel}`,
    })

    // Link lead to viewer
    if (viewerId) {
      await updateViewerCRMLead(viewerId, leadId)
    }

    return NextResponse.json({ success: true, type: 'new-lead', leadId, intent: intentLabel })
  } catch (e) {
    console.error('[Portal Enquiry]', e)
    return NextResponse.json({ success: false, message: 'Failed to submit enquiry' }, { status: 500 })
  }
}
