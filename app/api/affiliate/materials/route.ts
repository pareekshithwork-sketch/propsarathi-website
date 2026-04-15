import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import sql from '@/lib/db'

async function getPartner(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'propsarathi-secret') as any
  } catch { return null }
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS marketing_materials (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'pdf',
      city TEXT DEFAULT 'All',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

// GET /api/affiliate/materials — list active materials for affiliates
export async function GET(req: NextRequest) {
  const partner = await getPartner(req)
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureTable()
  const rows = await sql`
    SELECT id, title, description, file_url, file_type, city, created_at
    FROM marketing_materials WHERE is_active = TRUE ORDER BY created_at DESC
  `
  return NextResponse.json({ success: true, materials: rows })
}
