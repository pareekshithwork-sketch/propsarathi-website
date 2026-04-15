import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet } from '@/lib/googleSheets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, country, phone, interest, message } = body
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    const ts = new Date().toISOString()
    // Log to NRI Leads sheet
    await appendToSheet('NRI Leads', [[ts, name, country || '', phone, interest || 'Both', message || '']])
    // Also create a lead entry in main Leads sheet for CRM visibility
    await appendToSheet('Leads', [[
      `LEAD-${Date.now()}`, '', ts, '', '', name, '', phone,
      '', '', '', 'New', '', `NRI Enquiry – Interest: ${interest || 'Both'}. Country: ${country}. ${message || ''}`, ts, '', ''
    ]])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[NRI Enquiry]', e)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
