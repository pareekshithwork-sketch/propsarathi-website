import { type NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (!raw.startsWith('+')) return `+${digits}`
  return raw.trim()
}

export async function POST(req: NextRequest) {
  const user = await getClientSession()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { phone, otp, fingerprint } = await req.json()
  if (!phone || !otp || !fingerprint) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)

  // Check OTP
  const [row] = await sql`
    SELECT id, attempts, expires_at FROM whatsapp_otps
    WHERE phone = ${normalized}
    ORDER BY id DESC LIMIT 1
  `
  if (!row) return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
  }
  if (row.attempts >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 429 })
  }

  const [otpRow] = await sql`
    SELECT otp FROM whatsapp_otps WHERE id = ${row.id}
  `
  if (otpRow.otp !== otp) {
    await sql`UPDATE whatsapp_otps SET attempts = attempts + 1 WHERE id = ${row.id}`
    return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 })
  }

  // Valid — delete OTP, mark device + user verified
  await sql`DELETE FROM whatsapp_otps WHERE id = ${row.id}`

  await sql`
    INSERT INTO client_devices (client_id, fingerprint, phone, verified_at)
    VALUES (${user.clientId}, ${fingerprint}, ${normalized}, NOW())
    ON CONFLICT (client_id, fingerprint) DO UPDATE SET phone = ${normalized}, verified_at = NOW()
  `

  await sql`
    UPDATE client_users
    SET phone_verified = TRUE, phone_verified_at = NOW(), phone = COALESCE(NULLIF(phone,''), ${normalized})
    WHERE id = ${user.clientId}
  `

  return NextResponse.json({ success: true })
}
