import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await sql`SELECT id FROM client_users WHERE email = ${email.toLowerCase().trim()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    const rows = await sql`
      INSERT INTO client_users (name, email, phone, password_hash)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${phone || ''}, ${hash})
      RETURNING id, name, email
    `
    const user = rows[0]
    const token = generateClientToken({ clientId: user.id, email: user.email, name: user.name })

    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
    res.cookies.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return res
  } catch (e) {
    console.error('[Client Register]', e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
