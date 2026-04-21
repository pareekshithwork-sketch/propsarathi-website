import { type NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getClientSession()
  if (!user) return NextResponse.json({ verified: false, reason: 'not_logged_in' })

  const { fingerprint } = await req.json()
  if (!fingerprint) return NextResponse.json({ verified: false, reason: 'no_fingerprint' })

  const rows = await sql`
    SELECT verified_at FROM client_devices
    WHERE client_id = ${user.clientId} AND fingerprint = ${fingerprint}
    LIMIT 1
  `
  if (rows.length > 0 && rows[0].verified_at) {
    return NextResponse.json({ verified: true })
  }

  // Also check if user themselves have phone_verified (any device passes after first)
  const [u] = await sql`SELECT phone_verified FROM client_users WHERE id = ${user.clientId}`
  if (u?.phone_verified) {
    // Register this device as verified too (convenience — they already proved identity)
    await sql`
      INSERT INTO client_devices (client_id, fingerprint, verified_at)
      VALUES (${user.clientId}, ${fingerprint}, NOW())
      ON CONFLICT (client_id, fingerprint) DO UPDATE SET verified_at = NOW()
    `
    return NextResponse.json({ verified: true })
  }

  return NextResponse.json({ verified: false, reason: 'unverified_device' })
}
