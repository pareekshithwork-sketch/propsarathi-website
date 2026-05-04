import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet } from '@/lib/googleSheets'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'
import { getAutoAssignRM } from '@/lib/leadAssignment'

// Public endpoint — no auth required
// Called by all website enquiry forms (homepage, property pages, NRI page, etc.)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message, propertySlug, source, shareCode, rmOverride } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const ts = new Date().toISOString()
    const leadId = `LEAD-${Date.now()}`
    const leadSource = source || (propertySlug ? 'Property Enquiry' : 'Website')
    const notes = [
      propertySlug ? `Property: ${propertySlug}` : '',
      shareCode ? `Referred via: ${shareCode}` : '',
      message || '',
    ].filter(Boolean).join('. ')

    // Resolve referral info
    let referrerType: string | null = null
    let referrerId: number | null = null
    let resolvedRmId: number | null = rmOverride ?? null

    if (shareCode) {
      try {
        const [link] = await sql`
          SELECT sharer_type, sharer_id, rm_id FROM share_links WHERE code = ${shareCode} LIMIT 1
        `
        if (link) {
          referrerType = link.sharer_type
          referrerId = link.sharer_id
          if (!resolvedRmId && link.rm_id) resolvedRmId = link.rm_id
          // Increment leads_count
          await sql`UPDATE share_links SET leads_count = leads_count + 1 WHERE code = ${shareCode}`
        }
      } catch { /* non-fatal */ }
    }

    // Auto-assign to RM with fewest open leads (unless overridden by referral chain)
    const assignedRM = await getAutoAssignRM()

    // Write to CRM DB leads table (primary)
    let newLeadId: number | null = null
    try {
      const [inserted] = await sql`
        INSERT INTO crm_leads (
          lead_id, source, client_name, phone, email, notes, last_note, status, assigned_rm,
          project, share_code, referrer_type, referrer_id, rm_override, created_at, last_updated
        ) VALUES (
          ${leadId}, ${leadSource}, ${name}, ${phone}, ${email || ''},
          ${notes}, ${notes}, 'New', ${assignedRM},
          ${propertySlug || ''}, ${shareCode || null}, ${referrerType}, ${referrerId}, ${resolvedRmId},
          NOW(), NOW()
        )
        RETURNING id
      `
      newLeadId = inserted?.id ?? null
    } catch (dbErr) {
      console.error('[Enquiry] DB insert failed:', dbErr)
    }

    // Write to Google Sheets (non-fatal secondary)
    try {
      await appendToSheet('Leads', [[
        leadId, '', ts, '', '', name, '', phone,
        email || '', '', '', 'New', assignedRM, notes, ts, '', '',
      ]])
    } catch (sheetsErr) {
      console.error('[Enquiry] Sheets write failed (non-fatal):', sheetsErr)
    }

    // Record referral chain
    if (newLeadId && shareCode && referrerType) {
      try {
        await sql`
          INSERT INTO referral_chain (lead_id, share_code, sharer_type, sharer_id, rm_id)
          VALUES (${newLeadId}, ${shareCode}, ${referrerType}, ${referrerId}, ${resolvedRmId})
        `
        // If affiliate referral, create commission record
        if (referrerType === 'affiliate' && referrerId) {
          await sql`
            INSERT INTO affiliate_commissions (affiliate_id, lead_id, status, created_at)
            VALUES (${referrerId}, ${newLeadId}, 'pending', NOW())
            ON CONFLICT DO NOTHING
          `
        }
      } catch { /* non-fatal */ }
    }

    // If user is logged in, also log to client_enquiries
    try {
      const session = await getClientSession()
      if (session) {
        await sql`
          INSERT INTO client_enquiries (client_id, property_slug, message, status, share_code, referrer_id)
          VALUES (${session.clientId}, ${propertySlug || ''}, ${message || ''}, 'Pending', ${shareCode || null}, ${referrerId})
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
