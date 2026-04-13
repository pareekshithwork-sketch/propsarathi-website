import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`SELECT * FROM portal_viewers ORDER BY last_seen DESC LIMIT 500`
    return NextResponse.json({ success: true, viewers: rows })
  } catch (e) {
    return NextResponse.json({ success: true, viewers: [] })
  }
}
