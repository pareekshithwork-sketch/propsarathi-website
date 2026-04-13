import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findPartnerByResetToken, updatePartnerPassword } from '@/lib/partnerSheets'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) return NextResponse.json({ success: false, message: 'Token and password required' }, { status: 400 })

    const partner = await findPartnerByResetToken(token)
    if (!partner) return NextResponse.json({ success: false, message: 'Invalid or expired reset token' }, { status: 400 })
    if (partner.reset_token_expiry < Date.now()) return NextResponse.json({ success: false, message: 'Reset token expired' }, { status: 400 })

    const hash = await bcrypt.hash(newPassword, 10)
    await updatePartnerPassword(partner.email, hash)

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 })
  }
}
