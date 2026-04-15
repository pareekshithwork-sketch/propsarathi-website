import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

// DELETE /api/client/saved-properties/[slug] — unsave a property
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { slug } = await params
  await sql`DELETE FROM saved_properties WHERE client_id = ${session.clientId} AND slug = ${slug}`
  return NextResponse.json({ success: true })
}
