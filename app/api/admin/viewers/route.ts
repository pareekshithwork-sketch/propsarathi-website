import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`SELECT * FROM portal_viewers ORDER BY last_seen DESC LIMIT 500`
    return NextResponse.json({ success: true, viewers: rows })
  } catch (e) {
    return NextResponse.json({ success: true, viewers: [] })
  }
}
