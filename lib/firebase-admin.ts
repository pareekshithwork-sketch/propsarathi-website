import admin from 'firebase-admin'

// Initialise once per process — serverless safe
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } catch (e) {
      console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e)
    }
  }
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ sent: number; failed: number }> {
  if (!tokens.length || !admin.apps.length) return { sent: 0, failed: 0 }

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    })
    return { sent: response.successCount, failed: response.failureCount }
  } catch (e) {
    console.error('[firebase-admin] sendPushNotification error:', e)
    return { sent: 0, failed: tokens.length }
  }
}
