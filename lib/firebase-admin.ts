// firebase-admin is loaded lazily via require() so Next.js never tries to
// bundle it at build time — it has native Node.js deps that break bundling.

let _app: any = null

function getApp() {
  if (_app) return _app

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is not set — push notifications disabled')
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin')
    if (admin.apps.length) {
      _app = admin.apps[0]
      return _app
    }

    const serviceAccount = JSON.parse(raw)
    // Vercel stores \n as literal \\n in env vars — normalise before passing to Firebase
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
    }

    _app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    return _app
  } catch (e: any) {
    console.error('[firebase-admin] init failed:', e.message)
    return null
  }
}

export type InitStatus =
  | { ok: true }
  | { ok: false; reason: 'env_missing' | 'json_invalid' | 'init_failed'; detail?: string }

export function getInitStatus(): InitStatus {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) return { ok: false, reason: 'env_missing' }
  try {
    JSON.parse(raw)
  } catch (e: any) {
    return { ok: false, reason: 'json_invalid', detail: e.message }
  }
  const app = getApp()
  if (!app) return { ok: false, reason: 'init_failed', detail: 'getApp() returned null' }
  return { ok: true }
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ sent: number; failed: number; error?: string }> {
  if (!tokens.length) return { sent: 0, failed: 0 }

  const app = getApp()
  if (!app) {
    return { sent: 0, failed: 0, error: 'SDK not initialised — check FIREBASE_SERVICE_ACCOUNT_JSON' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin')
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    })

    response.responses.forEach((r: any, i: number) => {
      if (!r.success) {
        console.error(`[firebase-admin] token[${i}] failed:`, r.error?.code, r.error?.message)
      }
    })

    return { sent: response.successCount, failed: response.failureCount }
  } catch (e: any) {
    console.error('[firebase-admin] sendPushNotification error:', e.code, e.message)
    return { sent: 0, failed: tokens.length, error: `${e.code ?? ''}: ${e.message}` }
  }
}
