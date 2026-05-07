import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

interface TempGooglePayload {
  googleTemp: true
  email: string
  name: string
  googleId: string
  picture: string
}

export async function POST(req: NextRequest) {
  try {
    const { token: tempToken, phone, countryCode } = await req.json()

    if (!tempToken || !phone || !countryCode) {
      return NextResponse.json({ success: false, error: 'token, phone and countryCode are required' }, { status: 400 })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    // Verify temp JWT
    let payload: TempGooglePayload
    try {
      payload = jwt.verify(tempToken, jwtSecret) as TempGooglePayload
    } catch {
      return NextResponse.json({ success: false, error: 'Session expired. Please sign in with Google again.' }, { status: 401 })
    }

    if (!payload.googleTemp) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Normalize phone
    const dialCode = countryCode.replace(/[^\d+]/g, '').startsWith('+')
      ? countryCode.replace(/[^\d+]/g, '')
      : `+${countryCode.replace(/\D/g, '')}`
    const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

    // Verify WhatsApp OTP was verified for this phone
    const waRows = await sql`
      SELECT id FROM client_otps
      WHERE identifier = ${fullPhone}
        AND type = 'whatsapp'
        AND verified = true
        AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `
    if (waRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Phone not verified. Please complete WhatsApp OTP step.' },
        { status: 400 }
      )
    }

    // Ensure columns exist
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ALTER COLUMN password_hash DROP NOT NULL`

    // Create new user with both email + phone
    const normalEmail = payload.email.toLowerCase().trim()

    // Check if email was registered since token was issued
    const existing = await sql`SELECT id, name FROM client_users WHERE email = ${normalEmail} LIMIT 1`
    let clientId: number
    let clientName: string

    if (existing.length > 0) {
      clientId = existing[0].id
      clientName = existing[0].name
      await sql`
        UPDATE client_users
        SET phone = ${fullPhone}, google_id = ${payload.googleId}, last_login = NOW()
        WHERE id = ${clientId}
      `
    } else {
      const [newUser] = await sql`
        INSERT INTO client_users (name, email, phone, password_hash, google_id, profile_image, is_verified, last_login)
        VALUES (${payload.name}, ${normalEmail}, ${fullPhone}, '', ${payload.googleId}, ${payload.picture}, TRUE, NOW())
        RETURNING id, name
      `
      clientId = newUser.id
      clientName = newUser.name
    }

    // Consume WhatsApp OTP
    await sql`DELETE FROM client_otps WHERE id = ${waRows[0].id}`

    // Issue session cookie
    const sessionToken = generateClientToken({ clientId, email: normalEmail, name: clientName })
    const cookieStore = await cookies()
    cookieStore.set(CLIENT_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({ success: true, redirectTo: '/client' })
  } catch (err: any) {
    console.error('[Google Complete]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
