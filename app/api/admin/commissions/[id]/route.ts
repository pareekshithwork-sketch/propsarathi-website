import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// PATCH /api/admin/commissions/[id] — update commission status (approve/pay)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { status, notes } = await req.json()

  if (!['Pending', 'Approved', 'Paid', 'Rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const approvedAt = status === 'Approved' ? new Date().toISOString() : null
  const paidAt = status === 'Paid' ? new Date().toISOString() : null

  await sql`
    UPDATE affiliate_commissions SET
      status = ${status},
      notes = COALESCE(${notes || null}, notes),
      approved_at = COALESCE(${approvedAt}, approved_at),
      paid_at = COALESCE(${paidAt}, paid_at)
    WHERE id = ${Number(id)}
  `
  return NextResponse.json({ success: true })
}
