import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMLeads, updateCRMLead, addCRMHistory, getRecordHistory } from '@/lib/crmSheets'
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

      // Auto-create commission when lead reaches Booked and has an affiliate
      if (body.status === 'Booked' && current?.affiliatePartner) {
        try {
          await sql`
            CREATE TABLE IF NOT EXISTS affiliate_commissions (
              id SERIAL PRIMARY KEY, affiliate_name TEXT NOT NULL,
              affiliate_id TEXT NOT NULL DEFAULT '', lead_id TEXT NOT NULL,
              property_slug TEXT NOT NULL DEFAULT '', property_name TEXT NOT NULL DEFAULT '',
              commission_amount NUMERIC(12,2) DEFAULT 0, status TEXT NOT NULL DEFAULT 'Pending',
              notes TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW(),
              approved_at TIMESTAMPTZ, paid_at TIMESTAMPTZ
            )
          `
          const existing = await sql`SELECT id FROM affiliate_commissions WHERE lead_id = ${id}`
          if (!existing.length) {
            await sql`
              INSERT INTO affiliate_commissions (affiliate_name, lead_id, property_name, status)
              VALUES (${current.affiliatePartner}, ${id}, ${current.projectEnquired || current.propertyType || ''}, 'Pending')
            `
          }
        } catch (e) {
          console.warn('[Commission auto-create]', e)
        }
      }
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
  if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Only admins can delete leads' }, { status: 403 })

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
