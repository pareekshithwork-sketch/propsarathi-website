import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

const OTP_EXPIRY_MINUTES = 5
const MAX_RESENDS_PER_HOUR = 5

// Normalise to E.164 (India +91 default if 10 digits)
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length === 13 && digits.startsWith('91')) return `+${digits.slice(1)}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone: rawPhone } = body

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const phone = normalisePhone(rawPhone)
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Ensure table exists (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_otps (
        id          SERIAL PRIMARY KEY,
        phone       TEXT NOT NULL,
        otp         TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        attempts    INT NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS whatsapp_otps_phone_idx ON whatsapp_otps (phone)`

    // Rate-limit: max MAX_RESENDS_PER_HOUR OTP requests per phone in the last hour
    const recentRows = await sql`
      SELECT COUNT(*) AS cnt
      FROM whatsapp_otps
      WHERE phone = ${phone}
        AND created_at > NOW() - INTERVAL '1 hour'
    `
    const recentCount = Number(recentRows[0]?.cnt ?? 0)
    if (recentCount >= MAX_RESENDS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait an hour before trying again.' },
        { status: 429 }
      )
    }

    // Delete any previous unexpired OTPs for this phone (only one valid at a time)
    await sql`DELETE FROM whatsapp_otps WHERE phone = ${phone}`

    // Generate and store new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    await sql`
      INSERT INTO whatsapp_otps (phone, otp, expires_at)
      VALUES (${phone}, ${otp}, ${expiresAt.toISOString()})
    `

    // TODO: Replace console.log with actual WhatsApp Business API send
    // e.g. Meta Cloud API: POST https://graph.facebook.com/v18.0/<PHONE_NUMBER_ID>/messages
    // body: { to: phone, type: 'template', template: { name: 'otp', ... } }
    console.log(`[WhatsApp OTP] Phone: ${phone} | OTP: ${otp} | Expires: ${expiresAt.toISOString()}`)

    return NextResponse.json({ success: true, message: 'OTP sent to your WhatsApp number' })

  } catch (err) {
    console.error('[WhatsApp send-otp]', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
