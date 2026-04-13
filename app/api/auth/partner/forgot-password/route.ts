import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { findPartnerByEmail, updatePartnerResetToken } from '@/lib/partnerSheets'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 })

    const partner = await findPartnerByEmail(email)
    if (!partner) {
      return NextResponse.json({ success: true, message: 'If this email is registered, a reset link has been sent.' })
    }

    const token = randomBytes(32).toString('hex')
    const expiry = Date.now() + 3600000
    await updatePartnerResetToken(email, token, expiry)

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
      resetToken: token
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 })
  }
}
