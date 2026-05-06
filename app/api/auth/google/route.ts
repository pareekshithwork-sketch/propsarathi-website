import { type NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/google
 * Builds the Google OAuth URL and redirects the user to it.
 * Passes the ?redirect= param as OAuth `state` so we can restore it after callback.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 })
  }

  // Derive the base URL from the incoming request so it works locally and in prod
  const origin = req.nextUrl.origin
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`

  // Pass through any ?redirect= param as OAuth state
  const redirectAfter = req.nextUrl.searchParams.get('redirect') || '/client'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: encodeURIComponent(redirectAfter),
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
