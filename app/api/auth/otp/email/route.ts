import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import sql from '@/lib/db'

// Ensure OTP table exists (idempotent)
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

// Swappable WhatsApp send function (see whatsapp route)
// keeped here only for email; WhatsApp is in its own route

async function sendOTPEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"PropSarathi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your PropSarathi verification code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#422D83,#5a3fa8);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">PropSarathi</h1>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Premium Real Estate Advisory</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:#374151;font-size:15px;margin:0 0 24px;">Your verification code is:</p>
            <div style="background:#f5f3fd;border:2px solid #422D83;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
              <span style="font-size:42px;font-weight:800;color:#422D83;letter-spacing:12px;font-family:monospace;">${otp}</span>
            </div>
            <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">⏱ This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#6b7280;font-size:14px;margin:0;">If you didn&apos;t request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
              © ${new Date().getFullYear()} PropSarathi · Do not share this code with anyone.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, action, otp: inputOtp } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    await ensureTable()

    // ── SEND ──────────────────────────────────────────────────────────────────
    if (action === 'send') {
      // Rate limit: max 3 sends per hour
      const recentCount = await sql`
        SELECT COUNT(*)::int AS cnt FROM client_otps
        WHERE identifier = ${normalizedEmail}
          AND type = 'email'
          AND created_at > NOW() - INTERVAL '1 hour'
      `
      if (recentCount[0].cnt >= 3) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Try again in 1 hour.' },
          { status: 429 }
        )
      }

      const otp = generateOTP()

      // Delete old OTPs for this email
      await sql`DELETE FROM client_otps WHERE identifier = ${normalizedEmail} AND type = 'email'`

      // Insert new OTP
      await sql`
        INSERT INTO client_otps (identifier, type, otp, expires_at)
        VALUES (${normalizedEmail}, 'email', ${otp}, NOW() + INTERVAL '10 minutes')
      `

      await sendOTPEmail(normalizedEmail, otp)
      return NextResponse.json({ success: true })
    }

    // ── VERIFY ────────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!inputOtp) {
        return NextResponse.json({ success: false, error: 'OTP required' }, { status: 400 })
      }

      const rows = await sql`
        SELECT id, otp, attempts, expires_at FROM client_otps
        WHERE identifier = ${normalizedEmail}
          AND type = 'email'
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
    console.error('[OTP Email]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
