import { type NextRequest, NextResponse } from 'next/server'
import { sendPushNotification, getInitStatus } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const testKey = request.headers.get('x-test-key') || request.nextUrl.searchParams.get('key')
  if (testKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized — pass ?key=<ADMIN_SECRET_KEY>' }, { status: 401 })
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const envCheck = {
    serviceAccountJson: !!raw,
    projectId: !!process.env.FIREBASE_PROJECT_ID,
    clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  }

  const initStatus = getInitStatus()

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

  return NextResponse.json({ envCheck, initStatus, sendResult })
}
