import { type NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getClientSession()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Rate limit: 3 per email per hour
  const [count] = await sql`
    SELECT COUNT(*) FROM whatsapp_otps
    WHERE phone = ${'email:' + email}
      AND created_at > NOW() - INTERVAL '1 hour'
  `
  if (Number(count.count) >= 3) {
    return NextResponse.json({ error: 'Too many requests. Try again in an hour.' }, { status: 429 })
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  await sql`DELETE FROM whatsapp_otps WHERE phone = ${'email:' + email}`
  await sql`
    INSERT INTO whatsapp_otps (phone, otp, expires_at)
    VALUES (${'email:' + email}, ${otp}, NOW() + INTERVAL '5 minutes')
  `

  // TODO: send via email provider (SendGrid, Resend, etc.)
  console.log(`[EMAIL OTP] ${email}: ${otp}`)

  return NextResponse.json({ success: true })
}
