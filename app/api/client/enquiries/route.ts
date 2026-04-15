import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const rows = await sql`
    SELECT id, property_slug, message, status, created_at
    FROM client_enquiries
    WHERE client_id = ${session.clientId}
    ORDER BY created_at DESC
  `
  return NextResponse.json({
    enquiries: rows.map(r => ({
      id: r.id,
      propertySlug: r.property_slug,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    })),
  })
}
