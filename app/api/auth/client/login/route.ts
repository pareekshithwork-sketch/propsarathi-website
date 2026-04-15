import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const rows = await sql`SELECT * FROM client_users WHERE email = ${email.toLowerCase().trim()}`
    const user = rows[0]
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await sql`UPDATE client_users SET last_login = NOW() WHERE id = ${user.id}`

    const token = generateClientToken({ clientId: user.id, email: user.email, name: user.name })
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
    res.cookies.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch (e) {
    console.error('[Client Login]', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
