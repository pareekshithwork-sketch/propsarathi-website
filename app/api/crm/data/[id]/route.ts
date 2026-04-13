import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMData, updateCRMData, addCRMLead, addCRMHistory, getRecordHistory } from '@/lib/crmSheets'

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
    const records = await getCRMData()
    const record = records.find(d => d.dataId === id)
    if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })
    const history = await getRecordHistory(id)
    return NextResponse.json({ success: true, record, history })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch record' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()

    // Convert to Lead
    if (body.action === 'convert') {
      const records = await getCRMData()
      const record = records.find(d => d.dataId === id)
      if (!record) return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })

      const leadId = `LEAD-${Date.now()}`
      await addCRMLead({
        leadId, source: 'Data Conversion',
        clientName: record.name, phone: record.phone,
        countryCode: record.countryCode, email: record.email,
        city: body.city || '', propertyType: body.propertyType || '',
        budget: body.budget || '', assignedRM: body.assignedRM || '',
        status: 'New', notes: record.notes || '',
      })
      await updateCRMData(id, { converted: 'Yes', convertedLeadId: leadId, status: 'Qualified' })
      await addCRMHistory({
        recordId: id, recordType: 'data',
        action: `Converted to Lead ${leadId}`, changedBy: user.name,
        oldStatus: record.status, newStatus: 'Qualified', notes: '',
      })
      return NextResponse.json({ success: true, leadId })
    }

    const records = await getCRMData()
    const current = records.find(d => d.dataId === id)
    const oldStatus = current?.status || ''
    await updateCRMData(id, body)
    if (body.status && body.status !== oldStatus) {
      await addCRMHistory({
        recordId: id, recordType: 'data',
        action: `Status changed to ${body.status}`, changedBy: user.name,
        oldStatus, newStatus: body.status, notes: body.notes || '',
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update record' }, { status: 500 })
  }
}
