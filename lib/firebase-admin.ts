// firebase-admin is loaded lazily via require() so Next.js never tries to
// bundle it at build time — it has native Node.js deps that break bundling.

import sql from '@/lib/db'

let _app: any = null
let _tableReady = false

// ── Device token table ────────────────────────────────────────────────────────

async function ensureDeviceTokensTable() {
  if (_tableReady) return
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
    _tableReady = true
  } catch (e: any) {
    console.error('[firebase-admin] ensureDeviceTokensTable failed:', e.message)
  }
}

/** Fetch all FCM tokens for a given CRM user name. Creates the table on first call. */
export async function getDeviceTokensForUser(userName: string): Promise<string[]> {
  console.log('[FCM] looking up device tokens for user:', userName)
  await ensureDeviceTokensTable()
  try {
    const rows = await sql`SELECT fcm_token FROM crm_device_tokens WHERE user_id = ${userName}`
    const tokens = rows.map((r: any) => r.fcm_token).filter(Boolean)
    console.log('[FCM] device tokens found for', userName + ':', tokens.length)
    return tokens
  } catch (e: any) {
    console.error('[FCM] getDeviceTokensForUser error:', e.message)
    return []
  }
}

/** Fetch all FCM tokens for users with a given role. */
export async function getDeviceTokensForRole(role: string): Promise<string[]> {
  console.log('[FCM] looking up device tokens for role:', role)
  await ensureDeviceTokensTable()
  try {
    const rows = await sql`
      SELECT dt.fcm_token
      FROM crm_device_tokens dt
      JOIN crm_users u ON u.name = dt.user_id
      WHERE u.role = ${role} AND u.is_active = TRUE
    `
    const tokens = rows.map((r: any) => r.fcm_token).filter(Boolean)
    console.log('[FCM] device tokens found for role', role + ':', tokens.length)
    return tokens
  } catch (e: any) {
    console.error('[FCM] getDeviceTokensForRole error:', e.message)
    return []
  }
}

// ── Firebase Admin init ───────────────────────────────────────────────────────

function getApp() {
  if (_app) return _app

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  console.log('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON present:', !!raw)

  if (!raw) {
    console.warn('[FCM] env var not set — push notifications disabled')
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin')
    if (admin.apps.length) {
      console.log('[FCM] reusing existing Firebase app')
      _app = admin.apps[0]
      return _app
    }

    const serviceAccount = JSON.parse(raw)
    // Vercel stores \n as literal \\n — normalise before passing to Firebase
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
    }

    _app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    console.log('[FCM] Firebase Admin initialised successfully, project:', serviceAccount.project_id)
    return _app
  } catch (e: any) {
    console.error('[FCM] init failed:', e.message)
    return null
  }
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

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

// ── Send ──────────────────────────────────────────────────────────────────────

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ sent: number; failed: number; error?: string }> {
  if (!tokens.length) {
    console.log('[FCM] sendPushNotification called with 0 tokens — skipping')
    return { sent: 0, failed: 0 }
  }

  const app = getApp()
  if (!app) {
    console.warn('[FCM] SDK not initialised — notification not sent')
    return { sent: 0, failed: 0, error: 'SDK not initialised — check FIREBASE_SERVICE_ACCOUNT_JSON' }
  }

  console.log('[FCM] sending to', tokens.length, 'token(s), title:', title)

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
        console.error(`[FCM] token[${i}] failed:`, r.error?.code, r.error?.message)
      }
    })

    console.log('[FCM] result — sent:', response.successCount, 'failed:', response.failureCount)
    return { sent: response.successCount, failed: response.failureCount }
  } catch (e: any) {
    console.error('[FCM] sendPushNotification error:', e.code, e.message)
    return { sent: 0, failed: tokens.length, error: `${e.code ?? ''}: ${e.message}` }
  }
}
