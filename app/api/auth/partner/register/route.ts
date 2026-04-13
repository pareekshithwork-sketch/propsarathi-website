import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findPartnerByEmail, appendPartnerRow } from '@/lib/partnerSheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, countryCode, panNumber, aadharNumber, occupation, assignedRM, password } = body

    if (!fullName || !email || !phone || !panNumber || !aadharNumber || !occupation || !assignedRM || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    const existing = await findPartnerByEmail(email)
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const partnerId = `PS-${Date.now()}`

    await appendPartnerRow({ partnerId, fullName, email, phone, countryCode, panNumber, aadharNumber, occupation, assignedRM, passwordHash })

    return NextResponse.json({ success: true, message: 'Registration submitted successfully', partnerId })
  } catch (error) {
    console.error('[Partner Register]', error)
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
