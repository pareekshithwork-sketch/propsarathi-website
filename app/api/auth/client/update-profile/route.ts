import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { name, phone } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  await sql`UPDATE client_users SET name = ${name.trim()}, phone = ${phone || ''} WHERE id = ${session.clientId}`
  return NextResponse.json({ success: true })
}
