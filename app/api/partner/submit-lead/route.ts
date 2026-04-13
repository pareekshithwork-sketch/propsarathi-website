import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { addCRMLead, addCRMHistory } from '@/lib/crmSheets'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

    const secret = process.env.JWT_SECRET || 'propsarathi-secret'
    let partnerData: any
    try {
      partnerData = jwt.verify(token, secret)
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { clientName, phone, countryCode, email, city, propertyType, budget, notes } = body

    if (!clientName || !phone) {
      return NextResponse.json({ success: false, message: 'Client name and phone required' }, { status: 400 })
    }

    const leadId = `LEAD-${Date.now()}`
    const partnerName = partnerData.name || partnerData.fullName || 'Partner'
    await addCRMLead({
      leadId,
      source: `Partner: ${partnerName}`,
      partnerName,
      partnerId: partnerData.partnerId || '',
      clientName,
      phone,
      countryCode: countryCode || '+91',
      email: email || '',
      city: city || '',
      propertyType: propertyType || '',
      budget: budget || '',
      notes: notes || '',
      status: 'New',
      assignedRM: '',
    })
    await addCRMHistory({
      recordId: leadId, recordType: 'lead',
      action: 'Lead Created via Partner Portal',
      changedBy: partnerName,
      oldStatus: '', newStatus: 'New', notes: notes || '',
    })

    return NextResponse.json({ success: true, leadId, message: 'Lead submitted successfully' })
  } catch (error) {
    console.error('[Partner Submit Lead]', error)
    return NextResponse.json({ success: false, message: 'Failed to submit lead' }, { status: 500 })
  }
}
