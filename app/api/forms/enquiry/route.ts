import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet } from '@/lib/googleSheets'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

// Public endpoint — no auth required
// Called by all website enquiry forms (homepage, property pages, NRI page, etc.)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message, propertySlug, source } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const ts = new Date().toISOString()
    const leadId = `LEAD-${Date.now()}`
    const leadSource = source || (propertySlug ? 'Property Enquiry' : 'Website')
    const notes = [
      propertySlug ? `Property: ${propertySlug}` : '',
      message || '',
    ].filter(Boolean).join('. ')

    // Write to Google Sheets Leads tab
    await appendToSheet('Leads', [[
      leadId, '', ts, '', '', name, '', phone,
      email || '', '', '', 'New', '', notes, ts, '', '',
    ]])

    // Write to CRM DB leads table
    try {
      await sql`
        INSERT INTO crm_leads (
          lead_id, source, client_name, phone, email, notes, last_note, status, created_at, last_updated
        ) VALUES (
          ${leadId}, ${leadSource}, ${name}, ${phone}, ${email || ''},
          ${notes}, ${notes}, 'New', NOW(), NOW()
        )
      `
    } catch (dbErr) {
      console.error('[Enquiry] DB insert failed (non-fatal):', dbErr)
    }

    // If user is logged in, also log to client_enquiries
    try {
      const session = await getClientSession()
      if (session) {
        await sql`
          INSERT INTO client_enquiries (client_id, property_slug, message, status)
          VALUES (${session.clientId}, ${propertySlug || ''}, ${message || ''}, 'Pending')
        `
      }
    } catch {}

    // WhatsApp notification (fire-and-forget)
    try {
      const waUrl = process.env.WHATSAPP_API_URL
      const waToken = process.env.WHATSAPP_TOKEN
      if (waUrl && waToken) {
        const waMessage = `*New Lead — PropSarathi*\nName: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ''}${propertySlug ? `\nProperty: ${propertySlug}` : ''}\nSource: ${leadSource}${message ? `\nMessage: ${message}` : ''}`
        fetch(waUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${waToken}` },
          body: JSON.stringify({ message: waMessage }),
        }).catch(err => console.error('[WhatsApp]', err))
      }
    } catch {}

    return NextResponse.json({ success: true, leadId })
  } catch (e) {
    console.error('[Enquiry]', e)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
