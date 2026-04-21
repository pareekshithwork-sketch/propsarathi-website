import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

const MAX_ATTEMPTS = 5

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length === 13 && digits.startsWith('91')) return `+${digits.slice(1)}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone: rawPhone, otp } = body

    if (!rawPhone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 })
    }

    const phone = normalisePhone(rawPhone)
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Look up the latest OTP record for this phone
    const rows = await sql`
      SELECT * FROM whatsapp_otps
      WHERE phone = ${phone}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    const record = rows[0]

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      await sql`DELETE FROM whatsapp_otps WHERE phone = ${phone}`
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    // Check max attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      await sql`DELETE FROM whatsapp_otps WHERE phone = ${phone}`
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 400 })
    }

    // Verify OTP
    if (record.otp !== otp) {
      await sql`UPDATE whatsapp_otps SET attempts = attempts + 1 WHERE id = ${record.id}`
      const remaining = MAX_ATTEMPTS - record.attempts - 1
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 401 }
      )
    }

    // OTP is correct — delete it (single-use)
    await sql`DELETE FROM whatsapp_otps WHERE phone = ${phone}`

    // Ensure client_users has phone + whatsapp_verified columns (idempotent)
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE`
    await sql`ALTER TABLE client_users ALTER COLUMN password_hash DROP NOT NULL`

    // Find or create user by phone
    const existing = await sql`
      SELECT * FROM client_users WHERE phone = ${phone} LIMIT 1
    `

    let userId: number
    let userName: string
    let userEmail: string

    if (existing.length > 0) {
      const u = existing[0]
      userId    = u.id
      userName  = u.name
      userEmail = u.email
      await sql`
        UPDATE client_users
        SET whatsapp_verified = TRUE, last_login = NOW()
        WHERE id = ${u.id}
      `
    } else {
      // New user: create a minimal account linked to this phone
      const [newUser] = await sql`
        INSERT INTO client_users (name, email, phone, password_hash, whatsapp_verified, is_verified, last_login)
        VALUES (
          ${phone},
          ${''},
          ${phone},
          ${''},
          TRUE,
          TRUE,
          NOW()
        )
        RETURNING id, name, email
      `
      userId    = newUser.id
      userName  = newUser.name
      userEmail = newUser.email
    }

    // Generate JWT and set cookie
    const token = generateClientToken({ clientId: userId, email: userEmail, name: userName })

    const response = NextResponse.json({
      success: true,
      user: { id: userId, name: userName, email: userEmail, phone },
    })
    response.cookies.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response

  } catch (err) {
    console.error('[WhatsApp verify-otp]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
