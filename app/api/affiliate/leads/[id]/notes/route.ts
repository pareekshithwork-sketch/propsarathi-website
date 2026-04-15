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
    CREATE TABLE IF NOT EXISTS affiliate_lead_notes (
      id SERIAL PRIMARY KEY,
      lead_id TEXT NOT NULL,
      affiliate_name TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

// GET /api/affiliate/leads/[id]/notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const partner = await getPartner(req)
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const partnerName = partner.name || ''

  // Verify this lead belongs to the affiliate
  const check = await sql`
    SELECT lead_id FROM crm_leads WHERE lead_id = ${id} AND affiliate_partner = ${partnerName} AND is_deleted = FALSE
  `
  if (!check.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await ensureTable()
  const notes = await sql`
    SELECT id, lead_id, affiliate_name, note, created_at
    FROM affiliate_lead_notes WHERE lead_id = ${id} ORDER BY created_at DESC
  `
  return NextResponse.json({ success: true, notes })
}

// POST /api/affiliate/leads/[id]/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const partner = await getPartner(req)
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const partnerName = partner.name || ''

  // Verify ownership
  const check = await sql`
    SELECT lead_id FROM crm_leads WHERE lead_id = ${id} AND affiliate_partner = ${partnerName} AND is_deleted = FALSE
  `
  if (!check.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { note } = await req.json()
  if (!note?.trim()) return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 })

  await ensureTable()
  const [row] = await sql`
    INSERT INTO affiliate_lead_notes (lead_id, affiliate_name, note)
    VALUES (${id}, ${partnerName}, ${note.trim()})
    RETURNING id, created_at
  `
  return NextResponse.json({ success: true, id: row.id, createdAt: row.created_at })
}
