import admin from 'firebase-admin'

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
  if (!admin.apps.length) return { ok: false, reason: 'init_failed', detail: 'admin.apps is empty after init attempt' }
  return { ok: true }
}

// Initialise once per process — serverless safe
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (raw) {
    try {
      const serviceAccount = JSON.parse(raw)
      // Vercel sometimes stores \n as the literal two characters \\n in the private key.
      // Normalise so the RSA key has real newlines.
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } catch (e: any) {
      console.error('[firebase-admin] init failed:', e.message)
    }
  } else {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is not set — push notifications disabled')
  }
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ sent: number; failed: number; error?: string }> {
  if (!tokens.length) return { sent: 0, failed: 0 }
  if (!admin.apps.length) {
    console.warn('[firebase-admin] sendPushNotification called but SDK is not initialised')
    return { sent: 0, failed: 0, error: 'SDK not initialised — check FIREBASE_SERVICE_ACCOUNT_JSON' }
  }

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    })

    // Log per-token failures so they appear in Vercel function logs
    response.responses.forEach((r, i) => {
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
