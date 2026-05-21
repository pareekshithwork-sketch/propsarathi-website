import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getDeviceTokensForUser } from '@/lib/firebase-admin'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { fcm_token, device_id, platform = 'unknown' } = body

    if (!fcm_token || !device_id) {
      return NextResponse.json({ success: false, error: 'fcm_token and device_id are required' }, { status: 400 })
    }

    // Calling getDeviceTokensForUser ensures the table exists before we insert
    await getDeviceTokensForUser(user.name)

    await sql`
      INSERT INTO crm_device_tokens (user_id, fcm_token, device_id, platform, updated_at)
      VALUES (${user.name}, ${fcm_token}, ${device_id}, ${platform}, NOW())
      ON CONFLICT (device_id) DO UPDATE
        SET fcm_token  = EXCLUDED.fcm_token,
            user_id    = EXCLUDED.user_id,
            platform   = EXCLUDED.platform,
            updated_at = NOW()
    `

    console.log('[notifications] registered device token for', user.name, 'platform:', platform)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[notifications register POST]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
