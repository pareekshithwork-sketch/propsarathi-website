import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT id, type, title, message, lead_id, is_read, created_at
      FROM crm_notifications
      WHERE (target_rm IS NULL OR target_rm = ${user.name})
      ORDER BY created_at DESC
      LIMIT 20
    `
    const unread = rows.filter((r: any) => !r.is_read).length
    return NextResponse.json({ notifications: rows, unread })
  } catch {
    return NextResponse.json({ notifications: [], unread: 0 })
  }
}

export async function POST(req: NextRequest) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ ok: true })

  try {
    await sql`UPDATE crm_notifications SET is_read = TRUE WHERE id = ANY(${ids})`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
