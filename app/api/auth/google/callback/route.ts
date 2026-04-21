import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generateClientToken, CLIENT_COOKIE_NAME } from '@/lib/clientAuth'

/**
 * GET /api/auth/google/callback
 * Handles the Google OAuth redirect:
 *   1. Exchange code for access_token
 *   2. Fetch user profile from Google
 *   3. Find or create the user in client_users
 *   4. Generate JWT, set ps_client_token cookie
 *   5. Redirect to /client (or the original ?redirect= destination)
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code   = req.nextUrl.searchParams.get('code')
  const state  = req.nextUrl.searchParams.get('state')
  const errorParam = req.nextUrl.searchParams.get('error')

  // User denied Google access
  if (errorParam) {
    return NextResponse.redirect(`${origin}/client/login?error=google_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/client/login?error=google_failed`)
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/client/login?error=google_not_configured`)
  }

  const redirectUri   = `${origin}/api/auth/google/callback`
  const redirectAfter = state ? decodeURIComponent(state) : '/client'

  try {
    // ── Step 1: Exchange code for tokens ─────────────────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('[Google OAuth] Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${origin}/client/login?error=google_token_failed`)
    }

    const { access_token } = await tokenRes.json()
    if (!access_token) {
      return NextResponse.redirect(`${origin}/client/login?error=google_token_empty`)
    }

    // ── Step 2: Fetch Google user profile ─────────────────────────────────────
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/client/login?error=google_profile_failed`)
    }

    const profile = await profileRes.json()
    const { email, name, picture, id: googleId } = profile

    if (!email) {
      return NextResponse.redirect(`${origin}/client/login?error=google_no_email`)
    }

    // ── Step 3: Ensure extra columns exist (idempotent) ───────────────────────
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT ''`
    await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT ''`
    // Allow password_hash to be nullable for OAuth-only users
    await sql`ALTER TABLE client_users ALTER COLUMN password_hash DROP NOT NULL`

    // ── Step 4: Find or create user ───────────────────────────────────────────
    const normalEmail = email.toLowerCase().trim()
    const existing = await sql`SELECT * FROM client_users WHERE email = ${normalEmail}`

    let userId: number
    let userName: string

    if (existing.length > 0) {
      // User already exists — update their Google info and last login
      const u = existing[0]
      userId   = u.id
      userName = u.name
      await sql`
        UPDATE client_users
        SET google_id      = ${googleId || ''},
            profile_image  = COALESCE(NULLIF(${picture || ''}, ''), profile_image),
            last_login     = NOW()
        WHERE id = ${u.id}
      `
    } else {
      // New user — create account (no password; google_id links them)
      const [newUser] = await sql`
        INSERT INTO client_users (name, email, phone, password_hash, google_id, profile_image, is_verified, last_login)
        VALUES (
          ${name || email.split('@')[0]},
          ${normalEmail},
          '',
          '',
          ${googleId || ''},
          ${picture || ''},
          TRUE,
          NOW()
        )
        RETURNING id, name
      `
      userId   = newUser.id
      userName = newUser.name
    }

    // ── Step 5: Generate JWT and set cookie ───────────────────────────────────
    const token = generateClientToken({ clientId: userId, email: normalEmail, name: userName })

    const response = NextResponse.redirect(`${origin}${redirectAfter}`)
    response.cookies.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30, // 30 days
      path:     '/',
    })

    return response

  } catch (err) {
    console.error('[Google OAuth Callback]', err)
    return NextResponse.redirect(`${origin}/client/login?error=google_server_error`)
  }
}
