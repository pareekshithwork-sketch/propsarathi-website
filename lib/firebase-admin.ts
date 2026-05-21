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

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY

  console.log('[FCM] FIREBASE_PROJECT_ID present:',    !!projectId)
  console.log('[FCM] FIREBASE_CLIENT_EMAIL present:',  !!clientEmail)
  console.log('[FCM] FIREBASE_PRIVATE_KEY present:',   !!privateKey)

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM] Firebase env vars not set — push notifications disabled')
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

    _app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Vercel stores \n as literal \\n — normalise so RSA key parses correctly
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
    console.log('[FCM] Firebase Admin initialised successfully, project:', projectId)
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
  const missing = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']
    .filter(k => !process.env[k])
  if (missing.length) return { ok: false, reason: 'env_missing', detail: `missing: ${missing.join(', ')}` }
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
