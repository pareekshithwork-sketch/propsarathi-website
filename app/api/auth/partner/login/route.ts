import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findPartnerByEmail } from '@/lib/partnerSheets'

const SECRET = process.env.JWT_SECRET || 'propsarathi-secret-2026'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const partner = await findPartnerByEmail(email)
    if (!partner) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, partner.password_hash)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = jwt.sign(
      { partnerId: partner.partner_id, email: partner.email, name: partner.full_name, status: partner.status, assignedRM: partner.assigned_rm },
      SECRET, { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      partner: { name: partner.full_name, email: partner.email, status: partner.status, partnerId: partner.partner_id, assignedRM: partner.assigned_rm }
    })
    response.cookies.set('partner_token', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800 })
    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 })
  }
}
