import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

export async function GET() {
  try {
    const session = await getClientSession()
    if (!session) return NextResponse.json({ user: null })

    const rows = await sql`SELECT id, name, email, phone, created_at FROM client_users WHERE id = ${session.clientId}`
    const user = rows[0]
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.created_at } })
  } catch (e) {
    console.error('[Client Me]', e)
    return NextResponse.json({ user: null })
  }
}
