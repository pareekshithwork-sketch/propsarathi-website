import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// Simple in-memory rate limiter for this serverless fn instance
// (per-session deduplication is also done client-side)
const sessionLog = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const { partnerId, pageUrl, sessionId, type } = await request.json()
    if (!partnerId || !sessionId) {
      return NextResponse.json({ success: true }) // silent ignore
    }

    const key = `${sessionId}:${type}`
    const count = sessionLog.get(key) || 0
    if (count >= 2) return NextResponse.json({ success: true }) // rate limit
    sessionLog.set(key, count + 1)

    await sql`
      INSERT INTO crm_partner_activity_log
        (partner_id, activity_type, title, description, performed_by)
      VALUES
        (${partnerId}, 'link_clicked',
         ${'Share link visited'}, ${(pageUrl || '') + ' (' + (type || 'soft') + ')'},
         'visitor')
    `

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true }) // always silent
  }
}
