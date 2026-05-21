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

/** Fetch all FCM tokens for a given CRM user name or numeric user_id.
 *  Matches against crm_device_tokens.user_id regardless of whether it
 *  stores a name string, a numeric crm_users.id, or any other format. */
export async function getDeviceTokensForUser(userName: string): Promise<string[]> {
  console.log('[FCM] looking up device tokens for user:', userName)
  await ensureDeviceTokensTable()
  try {
    // Resolve to canonical crm_users row first (handles name OR numeric id)
    const [crm_user] = await sql`
      SELECT id, name FROM crm_users
      WHERE name = ${userName} OR id::text = ${userName}
      LIMIT 1
    `.catch(() => [])

    console.log('[FCM] resolved crm_user:', crm_user ? `id=${crm_user.id} name=${crm_user.name}` : 'not found')

    // Match tokens stored by name, by numeric id, or by the raw input
    const rows = await sql`
      SELECT DISTINCT fcm_token
      FROM crm_device_tokens
      WHERE user_id = ${userName}
         OR user_id = ${crm_user?.name ?? ''}
         OR user_id = ${crm_user?.id?.toString() ?? ''}
    `
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
      SELECT DISTINCT dt.fcm_token
      FROM crm_device_tokens dt
      JOIN crm_users u
        ON u.name = dt.user_id OR u.id::text = dt.user_id
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

  // Normalize the private key: handle Vercel's \\n escaping, strip surrounding
  // quotes that some copy-paste flows add, and trim whitespace
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\n/g, '\n')
    ?.replace(/^"/, '')
    ?.replace(/"$/, '')
    ?.trim()

  console.log('[FCM] FIREBASE_PROJECT_ID present:',    !!projectId)
  console.log('[FCM] FIREBASE_CLIENT_EMAIL present:',  !!clientEmail)
  console.log('[FCM] FIREBASE_PRIVATE_KEY present:',   !!privateKey)
  console.log('[FCM] init attempt, key length:', privateKey?.length, 'starts:', privateKey?.substring(0, 30))

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM] Firebase env vars not set — push notifications disabled')
    return null
  }

  console.log('[FCM] privateKey has real newlines:', privateKey.includes('\n'))
  console.log('[FCM] privateKey starts with BEGIN:', privateKey.trimStart().startsWith('-----BEGIN'))

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin')
    if (admin.apps.length) {
      console.log('[FCM] reusing existing Firebase app')
      _app = admin.apps[0]
      return _app
    }

    console.log('[FCM] calling initializeApp for project:', projectId)
    _app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    console.log('[FCM] Firebase Admin initialised successfully')
    return _app
  } catch (e: any) {
    console.error('[FCM] *** INIT FAILED ***')
    console.error('[FCM] error name:', e.name)
    console.error('[FCM] error message:', e.message)
    console.error('[FCM] error code:', e.code)
    console.error('[FCM] error stack:', e.stack)
    return null
  }
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

export type InitStatus =
  | { ok: true }
  | { ok: false; reason: 'env_missing' | 'json_invalid' | 'init_failed'; detail?: string }

export function getInitStatus(): InitStatus {
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING')
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING')
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'MISSING')

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
