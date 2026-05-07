import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { phone, countryCode, email } = await req.json()

    if (!phone || !countryCode || !email) {
      return NextResponse.json({ success: false, error: 'phone, countryCode and email are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const dialCode = countryCode.replace(/[^\d+]/g, '').startsWith('+')
      ? countryCode.replace(/[^\d+]/g, '')
      : `+${countryCode.replace(/\D/g, '')}`
    const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

    // Verify WhatsApp OTP was verified recently
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

    // Verify Email OTP was verified recently
    const emailRows = await sql`
      SELECT id FROM client_otps
      WHERE identifier = ${normalizedEmail}
        AND type = 'email'
        AND verified = true
        AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `
    if (emailRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email not verified. Please complete Email OTP step.' },
        { status: 400 }
      )
    }

    // Find or create client_users record
    let clientId: number
    let clientName: string

    const existingByEmail = await sql`
      SELECT id, name FROM client_users WHERE email = ${normalizedEmail}
    `
    if (existingByEmail.length > 0) {
      clientId = existingByEmail[0].id
      clientName = existingByEmail[0].name || normalizedEmail.split('@')[0]
      // Update phone if changed
      await sql`UPDATE client_users SET phone = ${fullPhone}, last_login = NOW() WHERE id = ${clientId}`
    } else {
      const existingByPhone = await sql`
        SELECT id, name FROM client_users WHERE phone = ${fullPhone}
      `
      if (existingByPhone.length > 0) {
        clientId = existingByPhone[0].id
        clientName = existingByPhone[0].name || fullPhone
        await sql`UPDATE client_users SET email = ${normalizedEmail}, last_login = NOW() WHERE id = ${clientId}`
      } else {
        // Create new user — no password needed (OTP-verified)
        const newUser = await sql`
          INSERT INTO client_users (name, email, phone, last_login)
          VALUES (${normalizedEmail.split('@')[0]}, ${normalizedEmail}, ${fullPhone}, NOW())
          RETURNING id, name
        `
        clientId = newUser[0].id
        clientName = newUser[0].name
      }
    }

    // Consume the verified OTPs so they can't be replayed
    await sql`DELETE FROM client_otps WHERE id = ${waRows[0].id}`
    await sql`DELETE FROM client_otps WHERE id = ${emailRows[0].id}`

    // Issue JWT cookie
    const token = generateClientToken({ clientId, email: normalizedEmail, name: clientName })
    const cookieStore = await cookies()
    cookieStore.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({ success: true, redirectTo: '/client' })
  } catch (err: any) {
    console.error('[OTP Complete]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
