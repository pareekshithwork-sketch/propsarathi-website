import { type NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, events } = await req.json()
    if (!Array.isArray(events) || events.length === 0) return NextResponse.json({ ok: true })

    const user = await getClientSession()
    const clientId = user?.clientId ?? null

    // Insert all events — silent if table doesn't exist yet
    for (const ev of events) {
      await sql`
        INSERT INTO client_activity_logs
          (client_id, session_id, event_type, project_slug, share_code, metadata)
        VALUES
          (${clientId}, ${sessionId ?? null}, ${ev.eventType}, ${ev.projectSlug ?? null}, ${ev.shareCode ?? null}, ${ev.metadata ? JSON.stringify(ev.metadata) : null})
      `
    }
    return NextResponse.json({ ok: true })
  } catch {
    // Non-critical — always 200
    return NextResponse.json({ ok: true })
  }
}
