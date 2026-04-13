import { type NextRequest, NextResponse } from 'next/server'
import { verifyOTP, getViewerByPhone, createViewer, updateViewerLastSeen } from '@/lib/projectsDb'
import { generatePortalToken } from '@/lib/portalAuth'

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode = '+91', otp, name, email } = await request.json()
    if (!phone || !otp) return NextResponse.json({ success: false, message: 'Phone and OTP required' }, { status: 400 })

    const valid = await verifyOTP(phone, countryCode, otp)
    if (!valid) return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 })

    // Get or create viewer
    let viewer = await getViewerByPhone(phone, countryCode)
    let viewerId: number
    if (!viewer) {
      viewerId = await createViewer({ phone, countryCode, name, email })
    } else {
      viewerId = viewer.id
      await updateViewerLastSeen(viewerId)
    }

    const token = generatePortalToken({ id: viewerId, phone, countryCode, name: name || viewer?.name })

    const response = NextResponse.json({
      success: true,
      viewer: { id: viewerId, phone, countryCode, name: name || viewer?.name || '' }
    })

    response.cookies.set('portal_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (e) {
    console.error('[Verify OTP]', e)
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 })
  }
}
