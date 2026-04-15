import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
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

// GET /api/admin/materials — list all (including inactive)
export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await ensureTable()
  const rows = await sql`SELECT * FROM marketing_materials ORDER BY created_at DESC`
  return NextResponse.json({ success: true, materials: rows })
}

// POST /api/admin/materials — add a material
export async function POST(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, file_url, file_type, city } = await req.json()
  if (!title || !file_url) return NextResponse.json({ error: 'title and file_url required' }, { status: 400 })

  await ensureTable()
  const [row] = await sql`
    INSERT INTO marketing_materials (title, description, file_url, file_type, city)
    VALUES (${title}, ${description || ''}, ${file_url}, ${file_type || 'pdf'}, ${city || 'All'})
    RETURNING id
  `
  return NextResponse.json({ success: true, id: row.id })
}

// DELETE /api/admin/materials?id=123 — deactivate
export async function DELETE(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await sql`UPDATE marketing_materials SET is_active = FALSE WHERE id = ${Number(id)}`
  return NextResponse.json({ success: true })
}
