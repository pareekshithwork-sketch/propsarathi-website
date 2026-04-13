import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMLeads, addCRMLead, addCRMHistory } from '@/lib/crmSheets'

function auth(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    let leads = await getCRMLeads()
    if (user.role === 'rm') {
      leads = leads.filter(l => l.assignedRM === user.name)
    }
    return NextResponse.json({ success: true, leads })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const leadId = `LEAD-${Date.now()}`
    // Auto-set source from partner name
    let source = body.source || 'Manual'
    if (body.partnerName && !source.startsWith('Partner:')) {
      source = `Partner: ${body.partnerName}`
    }
    const lead = { ...body, leadId, source, status: body.status || 'New' }
    await addCRMLead(lead)
    await addCRMHistory({
      recordId: leadId, recordType: 'lead',
      action: 'Lead Created', changedBy: user.name,
      oldStatus: '', newStatus: lead.status, notes: body.notes || '',
    })
    return NextResponse.json({ success: true, leadId })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create lead' }, { status: 500 })
  }
}
