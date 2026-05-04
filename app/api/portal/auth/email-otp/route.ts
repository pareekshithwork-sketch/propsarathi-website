import { NextRequest, NextResponse } from 'next/server'
import { createOTP, verifyOTP, getViewerByEmail, createViewer, updateViewerLastSeen } from '@/lib/projectsDb'
import { generateOTP, generatePortalToken } from '@/lib/portalAuth'

export async function POST(req: NextRequest) {
  try {
    const { action, email, otp, name, firstName, lastName, purpose } = await req.json()

    if (action === 'send') {
      if (!email) return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 })
      const code = generateOTP()
      await createOTP(email, 'email', code)

      // TODO: send via email provider — for now log it
      console.log(`[Email OTP] ${email} → ${code}`)

      return NextResponse.json({ success: true, message: 'OTP sent to email' })
    }

    if (action === 'verify') {
      const valid = await verifyOTP(email, 'email', otp)
      if (!valid) return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 })

      let viewer = await getViewerByEmail(email)
      let viewerId: number
      if (!viewer) {
        viewerId = await createViewer({
          email,
          name: name || `${firstName || ''} ${lastName || ''}`.trim(),
          firstName,
          lastName,
          purpose,
          loginMethod: 'email',
        })
      } else {
        viewerId = viewer.id
        await updateViewerLastSeen(viewerId)
      }

      const token = generatePortalToken({
        id: viewerId,
        phone: viewer?.phone || '',
        countryCode: '+91',
        name: name || viewer?.name || '',
      })
      const response = NextResponse.json({
        success: true,
        viewer: { id: viewerId, email, name: name || viewer?.name, firstName, lastName, purpose },
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
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}
