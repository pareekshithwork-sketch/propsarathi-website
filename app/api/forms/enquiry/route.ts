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
    const leadSource = source || (propertySlug ? 'Property Enquiry' : 'Website')
    const activityNote = [
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
          await sql`UPDATE share_links SET leads_count = leads_count + 1 WHERE code = ${shareCode}`
        }
      } catch { /* non-fatal */ }
    }

    // Auto-assign to RM with fewest open leads
    const assignedRM = await getAutoAssignRM()

    // Insert into crm_leads_v2 (primary store)
    let newLead: { id: number; lead_id: string } | null = null
    try {
      const [inserted] = await sql`
        INSERT INTO crm_leads_v2 (
          name, phone, email, source, sub_source,
          assigned_rm, lead_type, created_by
        ) VALUES (
          ${name}, ${phone}, ${email || ''}, ${leadSource},
          ${propertySlug || ''},
          ${assignedRM}, 'Buyer', 'website'
        )
        RETURNING id, lead_id
      `
      newLead = (inserted as any) ?? null
    } catch (dbErr) {
      console.error('[Enquiry] DB insert failed:', dbErr)
    }

    // Log notes to activity log (non-fatal)
    if (newLead && activityNote) {
      await sql`
        INSERT INTO crm_activity_log (lead_id, activity_type, description, created_by)
        VALUES (${newLead.lead_id}, 'lead_created', ${activityNote}, 'website')
      `.catch(() => {})
    }

    // Write to Google Sheets (non-fatal secondary)
    await appendToSheet('Leads', [[
      newLead?.lead_id ?? '', '', ts, '', '', name, '', phone,
      email || '', '', '', 'New', assignedRM, activityNote, ts, '', '',
    ]]).catch(err => console.error('[Enquiry] Sheets write failed (non-fatal):', err))

    // Record referral chain (uses serial integer id as FK)
    if (newLead && shareCode && referrerType) {
      await sql`
        INSERT INTO referral_chain (lead_id, share_code, sharer_type, sharer_id, rm_id)
        VALUES (${newLead.id}, ${shareCode}, ${referrerType}, ${referrerId}, ${resolvedRmId})
      `.catch(() => {})

      if (referrerType === 'affiliate' && referrerId) {
        await sql`
          INSERT INTO affiliate_commissions (affiliate_id, lead_id, status, created_at)
          VALUES (${referrerId}, ${newLead.id}, 'pending', NOW())
          ON CONFLICT DO NOTHING
        `.catch(() => {})
      }
    }

    // If user is logged in, log to client_enquiries
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

    return NextResponse.json({ success: true, leadId: newLead?.lead_id })
  } catch (e) {
    console.error('[Enquiry]', e)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
