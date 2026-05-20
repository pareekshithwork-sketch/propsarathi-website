import { type NextRequest, NextResponse } from 'next/server'
import { sendPushNotification, getInitStatus } from '@/lib/firebase-admin'

// Diagnostic endpoint — only usable with the internal test key to prevent abuse
export async function GET(request: NextRequest) {
  const testKey = request.headers.get('x-test-key') || request.nextUrl.searchParams.get('key')
  if (testKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized — pass ?key=<ADMIN_SECRET_KEY>' }, { status: 401 })
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  // 1. Env var presence check
  const envCheck = {
    present: !!raw,
    length: raw?.length ?? 0,
    // Show first 40 chars so you can confirm it starts with { "type": "service_account"
    preview: raw ? raw.slice(0, 60) + '…' : null,
  }

  // 2. JSON parse check
  let parseCheck: { ok: boolean; error?: string; fields?: string[] } = { ok: false }
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      parseCheck = {
        ok: true,
        fields: Object.keys(parsed),
      }
    } catch (e: any) {
      parseCheck = { ok: false, error: e.message }
    }
  }

  // 3. SDK init status
  const initStatus = getInitStatus()

  // 4. Optional: send a test notification to a token passed as ?token=xxx
  const testToken = request.nextUrl.searchParams.get('token')
  let sendResult: object = { skipped: 'pass ?token=<fcm_token> to test actual send' }
  if (testToken) {
    sendResult = await sendPushNotification(
      [testToken],
      'Test Notification 🔔',
      'PropSarathi FCM test — if you see this, it works!',
      { type: 'test' }
    )
  }

  return NextResponse.json({
    envCheck,
    parseCheck,
    initStatus,
    sendResult,
  })
}
