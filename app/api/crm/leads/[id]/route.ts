import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMLeads, updateCRMLead, addCRMHistory, getRecordHistory } from '@/lib/crmSheets'

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
    const leads = await getCRMLeads()
    const lead = leads.find(l => l.leadId === id)
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
    const history = await getRecordHistory(id)
    return NextResponse.json({ success: true, lead, history })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()

    // Get current lead for history
    const leads = await getCRMLeads()
    const current = leads.find(l => l.leadId === id)
    const oldStatus = current?.status || ''

    await updateCRMLead(id, body)

    if (body.status && body.status !== oldStatus) {
      await addCRMHistory({
        recordId: id, recordType: 'lead',
        action: body.action || `Status changed to ${body.status}`,
        changedBy: user.name,
        oldStatus, newStatus: body.status,
        notes: body.notes || '',
      })
    } else if (body.lastNote) {
      await addCRMHistory({
        recordId: id, recordType: 'lead',
        action: 'Note added', changedBy: user.name,
        oldStatus, newStatus: body.status || oldStatus,
        notes: body.lastNote,
      })
    } else if (body.notes && !body.status) {
      await addCRMHistory({
        recordId: id, recordType: 'lead',
        action: 'Note added', changedBy: user.name,
        oldStatus, newStatus: oldStatus,
        notes: body.notes,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await updateCRMLead(id, { isDeleted: true })
    await addCRMHistory({
      recordId: id, recordType: 'lead',
      action: 'Lead Deleted', changedBy: user.name,
      oldStatus: '', newStatus: 'Deleted', notes: '',
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete lead' }, { status: 500 })
  }
}
