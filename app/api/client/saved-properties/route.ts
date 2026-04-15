import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

// GET /api/client/saved-properties — list all saved property slugs for logged-in client
export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const rows = await sql`
    SELECT slug, saved_at FROM saved_properties WHERE client_id = ${session.clientId} ORDER BY saved_at DESC
  `
  return NextResponse.json({ saved: rows.map(r => ({ slug: r.slug, savedAt: r.saved_at })) })
}

// POST /api/client/saved-properties — save a property { slug }
export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  await sql`
    INSERT INTO saved_properties (client_id, slug) VALUES (${session.clientId}, ${slug})
    ON CONFLICT (client_id, slug) DO NOTHING
  `
  return NextResponse.json({ success: true })
}
