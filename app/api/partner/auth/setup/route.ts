import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import sql from '@/lib/db'
import { generatePartnerToken, PARTNER_COOKIE, PARTNER_COOKIE_OPTIONS } from '@/lib/partnerAuth'

function jwtSecret() {
  return process.env.JWT_SECRET || 'propsarathi-secret-2026'
}

interface InvitePayload { invite: true; partnerId: string }

function verifyInviteToken(token: string): InvitePayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as InvitePayload
  } catch { return null }
}

// GET — verify invite token and return partner name/email for the setup page
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const payload = verifyInviteToken(token)
  if (!payload?.invite) {
    return NextResponse.json({ success: false, error: 'Invalid or expired invite link' }, { status: 400 })
  }

  try {
    const [p] = await sql`
      SELECT partner_id, name, email, invite_token FROM crm_partners WHERE partner_id = ${payload.partnerId}
    `
    if (!p) return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 })
    if (p.invite_token !== token) {
      return NextResponse.json({ success: false, error: 'Invite link already used' }, { status: 400 })
    }
    return NextResponse.json({ success: true, partnerName: p.name, partnerEmail: p.email, partnerId: p.partner_id })
  } catch (err) {
    console.error('[Partner Setup GET]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST — complete account setup (Google or phone OTP)
export async function POST(request: NextRequest) {
  try {
    const { token, googleCredential, phone, otp, countryCode } = await request.json()

    const payload = verifyInviteToken(token)
    if (!payload?.invite) {
      return NextResponse.json({ success: false, error: 'Invalid or expired invite link' }, { status: 400 })
    }

    const [p] = await sql`SELECT * FROM crm_partners WHERE partner_id = ${payload.partnerId}`
    if (!p) return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 })
    if (p.invite_token !== token) {
      return NextResponse.json({ success: false, error: 'Invite link already used' }, { status: 400 })
    }

    if (googleCredential) {
      // Verify Google ID token
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleCredential)}`
      )
      const tokenInfo = await tokenInfoRes.json()
      if (tokenInfo.error || !tokenInfo.email) {
        return NextResponse.json({ success: false, error: 'Invalid Google credential' }, { status: 400 })
      }
      await sql`
        UPDATE crm_partners
        SET google_id = ${tokenInfo.sub || ''}, invite_token = '', status = 'Training Pending',
            updated_at = NOW()
        WHERE partner_id = ${payload.partnerId}
      `
    } else if (phone && otp && countryCode) {
      // Verify WhatsApp OTP
      const dialCode = countryCode.replace(/[^\d+]/g, '').startsWith('+')
        ? countryCode.replace(/[^\d+]/g, '')
        : `+${countryCode.replace(/\D/g, '')}`
      const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

      const otpRows = await sql`
        SELECT id, otp, attempts, expires_at FROM client_otps
        WHERE identifier = ${fullPhone} AND type = 'whatsapp' AND verified = false
        ORDER BY created_at DESC LIMIT 1
      `
      if (otpRows.length === 0) {
        return NextResponse.json({ success: false, error: 'OTP not found' }, { status: 400 })
      }
      const rec = otpRows[0]
      if (new Date(rec.expires_at) < new Date() || rec.otp !== otp.trim()) {
        return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 })
      }
      await sql`UPDATE client_otps SET verified = true WHERE id = ${rec.id}`
      await sql`
        UPDATE crm_partners
        SET phone = ${fullPhone}, invite_token = '', status = 'Training Pending', updated_at = NOW()
        WHERE partner_id = ${payload.partnerId}
      `
    } else {
      return NextResponse.json({ success: false, error: 'googleCredential or phone+otp required' }, { status: 400 })
    }

    const [updated] = await sql`SELECT * FROM crm_partners WHERE partner_id = ${payload.partnerId}`
    const sessionToken = generatePartnerToken({
      partnerId: updated.partner_id,
      email: updated.email || '',
      name: updated.name || '',
      status: updated.status || '',
      assignedRM: updated.assigned_rm_name || '',
    })

    const response = NextResponse.json({ success: true, redirectTo: '/partner' })
    response.cookies.set(PARTNER_COOKIE, sessionToken, PARTNER_COOKIE_OPTIONS)
    return response
  } catch (err) {
    console.error('[Partner Setup POST]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
