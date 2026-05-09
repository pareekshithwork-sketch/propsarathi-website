import { type NextRequest, NextResponse } from 'next/server'
import { addCRMLead, addCRMHistory } from '@/lib/crmSheets'
import { getPartnerSession } from '@/lib/partnerAuth'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = getPartnerSession(request)
    if (!session) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { clientName, phone, countryCode, email, city, propertyType, budget, notes } = body

    if (!clientName || !phone) {
      return NextResponse.json({ success: false, message: 'Client name and phone required' }, { status: 400 })
    }

    const partnerName = session.name || 'Partner'
    const partnerId = session.partnerId || ''

    // Insert into crm_leads_v2 (primary store)
    const [lead] = await sql`
      INSERT INTO crm_leads_v2 (
        name, phone, country_code, email, source, sub_source,
        customer_location, partner_id, partner_name,
        lead_type, created_by
      ) VALUES (
        ${clientName}, ${phone}, ${countryCode || '+91'}, ${email || ''},
        'Partner Portal', ${propertyType || ''},
        ${city || ''}, ${partnerId}, ${partnerName},
        'Buyer', 'partner_portal'
      )
      RETURNING *
    `

    // Log creation + context to activity log
    const activityNote = [
      notes,
      propertyType ? `Property type: ${propertyType}` : '',
      budget ? `Budget: ${budget}` : '',
    ].filter(Boolean).join(' | ')

    await sql`
      INSERT INTO crm_activity_log (lead_id, activity_type, description, created_by)
      VALUES (${lead.lead_id}, 'lead_created', ${activityNote || 'Lead submitted via partner portal'}, ${partnerName})
    `.catch(() => {})

    // Supplementary Sheets write (non-fatal)
    await addCRMLead({
      leadId: lead.lead_id,
      source: 'Partner Portal',
      partnerName,
      partnerId,
      affiliatePartner: partnerName,
      clientName,
      phone,
      countryCode: countryCode || '+91',
      email: email || '',
      city: city || '',
      propertyType: propertyType || '',
      budget: budget || '',
      notes: notes || '',
      status: 'New',
      assignedRM: '',
    }).catch(() => {})

    await addCRMHistory({
      recordId: lead.lead_id, recordType: 'lead',
      action: 'Lead Created via Partner Portal',
      changedBy: partnerName,
      oldStatus: '', newStatus: 'New', notes: notes || '',
    }).catch(() => {})

    return NextResponse.json({ success: true, leadId: lead.lead_id, message: 'Lead submitted successfully' })
  } catch (error) {
    console.error('[Partner Submit Lead]', error)
    return NextResponse.json({ success: false, message: 'Failed to submit lead' }, { status: 500 })
  }
}
