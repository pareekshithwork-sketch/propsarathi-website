import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

async function ensureDeviceTokensTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_device_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    TEXT NOT NULL DEFAULT '',
        fcm_token  TEXT NOT NULL DEFAULT '',
        device_id  TEXT NOT NULL DEFAULT '',
        platform   TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (device_id)
      )
    `
  } catch {}
}

let tableReady = false

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (!tableReady) {
    await ensureDeviceTokensTable()
    tableReady = true
  }

  try {
    const body = await request.json()
    const { fcm_token, device_id, platform = 'unknown' } = body

    if (!fcm_token || !device_id) {
      return NextResponse.json({ success: false, error: 'fcm_token and device_id are required' }, { status: 400 })
    }

    await sql`
      INSERT INTO crm_device_tokens (user_id, fcm_token, device_id, platform, updated_at)
      VALUES (${user.name}, ${fcm_token}, ${device_id}, ${platform}, NOW())
      ON CONFLICT (device_id) DO UPDATE
        SET fcm_token = EXCLUDED.fcm_token,
            user_id   = EXCLUDED.user_id,
            platform  = EXCLUDED.platform,
            updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[notifications register POST]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
