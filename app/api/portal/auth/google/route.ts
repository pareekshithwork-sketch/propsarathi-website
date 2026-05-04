import { NextRequest, NextResponse } from 'next/server'
import { getViewerByGoogleId, getViewerByEmail, createViewer, updateViewerLastSeen } from '@/lib/projectsDb'
import { generatePortalToken } from '@/lib/portalAuth'

export async function POST(req: NextRequest) {
  try {
    const { googleId, email, name, avatarUrl, firstName, lastName, purpose } = await req.json()
    if (!googleId) return NextResponse.json({ success: false, message: 'Missing googleId' }, { status: 400 })

    let viewer = await getViewerByGoogleId(googleId)
    if (!viewer) {
      viewer = await getViewerByEmail(email)
    }

    let viewerId: number
    if (!viewer) {
      viewerId = await createViewer({
        email,
        name: name || `${firstName || ''} ${lastName || ''}`.trim(),
        firstName,
        lastName,
        purpose,
        loginMethod: 'google',
        googleId,
        avatarUrl,
      })
    } else {
      viewerId = typeof viewer === 'number' ? viewer : viewer.id
      await updateViewerLastSeen(viewerId)
    }

    const token = generatePortalToken({
      id: viewerId,
      phone: viewer?.phone || '',
      countryCode: '+91',
      name: name || '',
    })

    const response = NextResponse.json({
      success: true,
      viewer: { id: viewerId, email, name, firstName, lastName, purpose, avatarUrl },
      needsProfile: !viewer?.purpose,
    })
    response.cookies.set('portal_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return response
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}
