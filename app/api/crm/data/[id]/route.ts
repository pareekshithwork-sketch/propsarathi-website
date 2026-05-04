import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const [record] = await sql`SELECT * FROM crm_data WHERE data_id = ${id}`
    if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })
    return NextResponse.json({ success: true, record })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()

    // Convert to v2 lead
    if (body.action === 'convert' || (body.converted && body.convertedLeadId)) {
      if (body.converted && body.convertedLeadId) {
        await sql`
          UPDATE crm_data
          SET converted = TRUE, converted_lead_id = ${body.convertedLeadId}, updated_at = NOW()
          WHERE data_id = ${id}
        `
        return NextResponse.json({ success: true })
      }

      // Full convert flow — create v2 lead then mark converted
      const [record] = await sql`SELECT * FROM crm_data WHERE data_id = ${id}`
      if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })

      const leadRes = await fetch(new URL('/api/crm/v2/leads', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
        body: JSON.stringify({
          name: record.name,
          phone: record.phone,
          email: record.email,
          countryCode: record.country_code || '+91',
          source: record.source || 'Direct',
          assignedRm: body.assignedRM || '',
          leadType: 'Buyer',
          forceInsert: true,
        }),
      })
      const leadData = await leadRes.json()
      if (!leadData.success) return NextResponse.json({ success: false, message: leadData.error || 'Failed to create lead' }, { status: 500 })

      await sql`
        UPDATE crm_data
        SET converted = TRUE, converted_lead_id = ${leadData.leadId}, updated_at = NOW()
        WHERE data_id = ${id}
      `
      return NextResponse.json({ success: true, leadId: leadData.leadId })
    }

    // Regular update
    const b = body
    await sql`
      UPDATE crm_data SET
        status      = COALESCE(${b.status      ?? null}, status),
        notes       = COALESCE(${b.notes       ?? null}, notes),
        assigned_to = COALESCE(${b.assignedTo  ?? null}, assigned_to),
        updated_at  = NOW()
      WHERE data_id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}
