import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generateCRMToken, CRM_COOKIE } from '@/lib/crmAuth'
import type { CRMRole } from '@/lib/crmAuth'

const REDIRECT_URI = 'https://www.propsarathi.com/api/crm/auth/google/callback'

export async function GET(req: NextRequest) {
  const origin = 'https://www.propsarathi.com'
  const code = req.nextUrl.searchParams.get('code')
  const errorParam = req.nextUrl.searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(`${origin}/crm?error=google_denied`)
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/crm?error=google_failed`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/crm?error=google_not_configured`)
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('[CRM Google] Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${origin}/crm?error=google_token_failed`)
    }

    const { access_token } = await tokenRes.json()
    if (!access_token) {
      return NextResponse.redirect(`${origin}/crm?error=google_token_failed`)
    }

    // Fetch Google profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/crm?error=google_profile_failed`)
    }

    const profile = await profileRes.json()
    const { email, name, id: googleId } = profile

    if (!email) {
      return NextResponse.redirect(`${origin}/crm?error=google_no_email`)
    }

    const normalEmail = email.toLowerCase().trim()

    // Check crm_users whitelist — must have matching email AND be active
    const rows = await sql`
      SELECT id, user_id, name, email, role, is_active, team_id, manager_id, department
      FROM crm_users
      WHERE LOWER(email) = ${normalEmail}
      LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.redirect(`${origin}/crm?error=not_authorized`)
    }

    const dbUser = rows[0]

    if (dbUser.is_active === false) {
      return NextResponse.redirect(`${origin}/crm?error=not_authorized`)
    }

    // Update google_id and last_login
    await sql`
      UPDATE crm_users
      SET google_id = ${googleId || ''},
          last_login = NOW()
      WHERE id = ${dbUser.id}
    `

    // Generate CRM JWT
    const crmUser = {
      id: dbUser.user_id || String(dbUser.id),
      userId: dbUser.user_id || String(dbUser.id),
      name: dbUser.name,
      email: normalEmail,
      role: (dbUser.role || 'rm') as CRMRole,
      teamId: dbUser.team_id || null,
      managerId: dbUser.manager_id ? String(dbUser.manager_id) : null,
      department: dbUser.department || '',
    }

    const token = generateCRMToken(crmUser)

    const response = NextResponse.redirect(`${origin}/crm`)
    response.cookies.set(CRM_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 43200, // 12h
    })

    return response
  } catch (err) {
    console.error('[CRM Google Callback]', err)
    return NextResponse.redirect(`${origin}/crm?error=google_server_error`)
  }
}
