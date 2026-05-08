import { type NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import sql from '@/lib/db'

const PARTNER_COOKIE = 'partner_token'
const JWT_SECRET = () => process.env.JWT_SECRET || 'propsarathi-secret-2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const credential: string = body.credential

    if (!credential) {
      return NextResponse.json({ success: false, error: 'Missing credential' }, { status: 400 })
    }

    // Verify the Google ID token
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    )
    if (!tokenInfoRes.ok) {
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 401 })
    }

    const tokenInfo = await tokenInfoRes.json()
    if (tokenInfo.error) {
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 401 })
    }

    const { email, name, sub: googleId } = tokenInfo
    if (!email) {
      return NextResponse.json({ success: false, error: 'No email in token' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()

    // Look up partner by email or google_id
    const existing = await sql`
      SELECT partner_id, email, name, google_id, status, assigned_rm_name
      FROM crm_partners
      WHERE email = ${normalEmail} OR (google_id != '' AND google_id = ${googleId || ''})
      LIMIT 1
    `

    if (existing.length > 0) {
      const p = existing[0]

      // Update google_id if not set, and last_login
      await sql`
        UPDATE crm_partners
        SET google_id  = COALESCE(NULLIF(${googleId || ''}, ''), google_id),
            last_login = NOW(),
            updated_at = NOW()
        WHERE partner_id = ${p.partner_id}
      `

      const partnerName = p.name || name || normalEmail.split('@')[0]
      const token = jwt.sign(
        {
          partnerId: p.partner_id,
          email: p.email,
          name: partnerName,
          status: p.status,
          assignedRM: p.assigned_rm_name || '',
        },
        JWT_SECRET(),
        { expiresIn: '7d' }
      )

      const response = NextResponse.json({
        success: true,
        isNew: false,
        redirectTo: '/partner',
      })
      response.cookies.set(PARTNER_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return response
    }

    // Not a registered partner — redirect to registration with prefilled name/email
    const prefill = encodeURIComponent(
      JSON.stringify({ name: name || '', email: normalEmail })
    )

    return NextResponse.json({
      success: true,
      isNew: true,
      redirectTo: `/partner/register?prefill=${prefill}`,
    })
  } catch (err) {
    console.error('[One Tap Partner]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
