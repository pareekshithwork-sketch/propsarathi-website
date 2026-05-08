import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generatePartnerToken, PARTNER_COOKIE, PARTNER_COOKIE_OPTIONS } from '@/lib/partnerAuth'

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode, otp } = await request.json()
    if (!phone || !countryCode || !otp) {
      return NextResponse.json({ success: false, error: 'Phone, country code and OTP are required' }, { status: 400 })
    }

    const dialCode = countryCode.replace(/[^\d+]/g, '').startsWith('+')
      ? countryCode.replace(/[^\d+]/g, '')
      : `+${countryCode.replace(/\D/g, '')}`
    const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

    // Verify OTP from client_otps table
    const otpRows = await sql`
      SELECT id, otp, attempts, expires_at FROM client_otps
      WHERE identifier = ${fullPhone}
        AND type = 'whatsapp'
        AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `
    if (otpRows.length === 0) {
      return NextResponse.json({ success: false, error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    const record = otpRows[0]
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP expired. Please request a new one.' }, { status: 400 })
    }
    if (record.attempts + 1 > 3) {
      return NextResponse.json({ success: false, error: 'Too many attempts.' }, { status: 400 })
    }
    await sql`UPDATE client_otps SET attempts = attempts + 1 WHERE id = ${record.id}`
    if (record.otp !== otp.trim()) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 })
    }
    await sql`UPDATE client_otps SET verified = true WHERE id = ${record.id}`

    // Look up partner by phone (last 10 digits match)
    const digits = fullPhone.replace(/\D/g, '')
    const last10 = digits.slice(-10)
    const partners = await sql`
      SELECT partner_id, name, email, phone, status, assigned_rm_name
      FROM crm_partners
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${last10}
      LIMIT 1
    `
    if (partners.length === 0) {
      return NextResponse.json({ success: false, error: 'No partner account found for this number. Contact your RM.' }, { status: 404 })
    }

    const p = partners[0]
    await sql`UPDATE crm_partners SET last_login = NOW(), updated_at = NOW() WHERE partner_id = ${p.partner_id}`
    await sql`DELETE FROM client_otps WHERE id = ${record.id}`

    const token = generatePartnerToken({
      partnerId: p.partner_id,
      email: p.email || '',
      name: p.name || '',
      status: p.status || '',
      assignedRM: p.assigned_rm_name || '',
    })

    const response = NextResponse.json({ success: true, redirectTo: '/partner' })
    response.cookies.set(PARTNER_COOKIE, token, PARTNER_COOKIE_OPTIONS)
    return response
  } catch (err) {
    console.error('[Partner Login OTP]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
