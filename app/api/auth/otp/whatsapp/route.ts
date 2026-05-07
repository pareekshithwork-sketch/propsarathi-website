import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// ── OTP table (idempotent, same DDL as email route) ────────────────────────────
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS client_otps (
      id SERIAL PRIMARY KEY,
      identifier TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
      otp TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_client_otps_identifier ON client_otps(identifier, type)
  `
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── Swappable WhatsApp send function ──────────────────────────────────────────
// To swap from Twilio to Meta Cloud API, replace only this function.
async function sendWhatsAppOTP(fullPhone: string, otp: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require('twilio')
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  const messageBody = `Your PropSarathi verification code is: *${otp}*\n\nValid for 10 minutes. Do not share this code.`

  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${fullPhone}`,
      body: messageBody,
    })
  } catch (waError) {
    // SMS fallback if WhatsApp fails and SMS from number is configured
    if (process.env.TWILIO_SMS_FROM) {
      await client.messages.create({
        from: process.env.TWILIO_SMS_FROM,
        to: fullPhone,
        body: messageBody,
      })
    } else {
      throw waError
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, countryCode, action, otp: inputOtp } = await req.json()

    if (!phone || !countryCode) {
      return NextResponse.json({ success: false, error: 'Phone and country code are required' }, { status: 400 })
    }

    // Normalise: strip non-digits from each part, combine
    const dialCode = countryCode.replace(/[^\d+]/g, '').startsWith('+')
      ? countryCode.replace(/[^\d+]/g, '')
      : `+${countryCode.replace(/\D/g, '')}`
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 })
    }
    const fullPhone = `${dialCode}${phoneDigits}`

    await ensureTable()

    // ── SEND ──────────────────────────────────────────────────────────────────
    if (action === 'send') {
      // Rate limit: max 3 sends per hour
      const recentCount = await sql`
        SELECT COUNT(*)::int AS cnt FROM client_otps
        WHERE identifier = ${fullPhone}
          AND type = 'whatsapp'
          AND created_at > NOW() - INTERVAL '1 hour'
      `
      if (recentCount[0].cnt >= 3) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Try again in 1 hour.' },
          { status: 429 }
        )
      }

      const otp = generateOTP()

      // Delete old OTPs for this phone
      await sql`DELETE FROM client_otps WHERE identifier = ${fullPhone} AND type = 'whatsapp'`

      // Insert new OTP
      await sql`
        INSERT INTO client_otps (identifier, type, otp, expires_at)
        VALUES (${fullPhone}, 'whatsapp', ${otp}, NOW() + INTERVAL '10 minutes')
      `

      await sendWhatsAppOTP(fullPhone, otp)
      return NextResponse.json({ success: true })
    }

    // ── VERIFY ────────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!inputOtp) {
        return NextResponse.json({ success: false, error: 'OTP required' }, { status: 400 })
      }

      const rows = await sql`
        SELECT id, otp, attempts, expires_at FROM client_otps
        WHERE identifier = ${fullPhone}
          AND type = 'whatsapp'
          AND verified = false
        ORDER BY created_at DESC LIMIT 1
      `

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'No OTP found. Please request a new one.' }, { status: 400 })
      }

      const record = rows[0]

      if (new Date(record.expires_at) < new Date()) {
        return NextResponse.json({ success: false, error: 'OTP expired. Please request a new one.' }, { status: 400 })
      }

      await sql`UPDATE client_otps SET attempts = attempts + 1 WHERE id = ${record.id}`

      if (record.attempts + 1 > 3) {
        return NextResponse.json({ success: false, error: 'Too many attempts. Please request a new OTP.' }, { status: 400 })
      }

      if (record.otp !== inputOtp.trim()) {
        return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 })
      }

      await sql`UPDATE client_otps SET verified = true WHERE id = ${record.id}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('[OTP WhatsApp]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
