import { type NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

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

    const { email, name, sub: googleId, picture } = tokenInfo
    if (!email) {
      return NextResponse.json({ success: false, error: 'No email in token' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()

    // Ensure extra columns exist (idempotent)
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ALTER COLUMN password_hash DROP NOT NULL`

    // Look up existing user by email or google_id
    const existing = await sql`
      SELECT id, name, email FROM client_users
      WHERE email = ${normalEmail} OR (google_id != '' AND google_id = ${googleId || ''})
      LIMIT 1
    `

    if (existing.length > 0) {
      // Returning user — refresh login and issue session
      const u = existing[0]
      await sql`
        UPDATE client_users
        SET google_id     = COALESCE(NULLIF(${googleId || ''}, ''), google_id),
            profile_image = COALESCE(NULLIF(${picture || ''}, ''), profile_image),
            last_login    = NOW()
        WHERE id = ${u.id}
      `

      const sessionToken = generateClientToken({
        clientId: u.id,
        email: u.email,
        name: u.name,
      })

      const response = NextResponse.json({ success: true, isNew: false, redirectTo: '/client' })
      response.cookies.set(CLIENT_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
      return response
    }

    // New user — issue temp JWT and redirect to verify-phone
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const tempToken = jwt.sign(
      {
        googleTemp: true,
        email: normalEmail,
        name: name || normalEmail.split('@')[0],
        googleId: googleId || '',
        picture: picture || '',
      },
      jwtSecret,
      { expiresIn: '15m' }
    )

    return NextResponse.json({
      success: true,
      isNew: true,
      redirectTo: `/client/verify-phone?token=${encodeURIComponent(tempToken)}`,
    })
  } catch (err) {
    console.error('[One Tap Client]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
