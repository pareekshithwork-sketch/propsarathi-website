import { type NextRequest, NextResponse } from 'next/server'
import { createOTP, getViewerByPhone, createViewer } from '@/lib/projectsDb'
import { generateOTP } from '@/lib/portalAuth'

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode = '+91' } = await request.json()
    if (!phone) return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 })

    const otp = generateOTP()
    await createOTP(phone, countryCode, otp)

    // Send via WhatsApp (using existing WA gateway if available, else log for now)
    const waMessage = `Your PropSarathi verification code is: *${otp}*\n\nValid for 10 minutes. Do not share this code.`

    // Try to send via WhatsApp API if configured
    try {
      const waUrl = process.env.WHATSAPP_API_URL
      const waToken = process.env.WHATSAPP_TOKEN
      if (waUrl && waToken) {
        await fetch(`${waUrl}/send`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${waToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `${countryCode}${phone}`.replace('+', ''), message: waMessage })
        })
      }
    } catch (waErr) {
      console.error('[WA OTP]', waErr)
    }

    // For dev — log OTP
    console.log(`[OTP] ${countryCode}${phone} → ${otp}`)

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (e) {
    console.error('[Send OTP]', e)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}
