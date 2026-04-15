import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const rows = await sql`SELECT id FROM client_users WHERE email = ${email.toLowerCase().trim()}`
    // Always return success to prevent email enumeration
    if (rows.length === 0) return NextResponse.json({ success: true })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
    await sql`UPDATE client_users SET reset_token = ${token}, reset_expires = ${expires} WHERE id = ${rows[0].id}`

    // TODO: send email with reset link — /client/reset-password?token=${token}
    console.log('[ForgotPassword] Reset token for', email, ':', token)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[Forgot Password]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
