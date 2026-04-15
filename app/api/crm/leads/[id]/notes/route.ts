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
    CREATE TABLE IF NOT EXISTS crm_lead_notes (
      id SERIAL PRIMARY KEY,
      lead_id TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT '',
      author_role TEXT NOT NULL DEFAULT '',
      note_text TEXT NOT NULL,
      note_type TEXT NOT NULL DEFAULT 'note',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_lead_notes_lead_id ON crm_lead_notes(lead_id)`
}

// GET /api/crm/leads/[id]/notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await ensureTable()

  const notes = await sql`
    SELECT id, lead_id, author_name, author_role, note_text, note_type, created_at
    FROM crm_lead_notes WHERE lead_id = ${id}
    ORDER BY created_at DESC
  `
  return NextResponse.json({ success: true, notes })
}

// POST /api/crm/leads/[id]/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { note_text, note_type } = await req.json()
  if (!note_text?.trim()) return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 })

  await ensureTable()

  const [row] = await sql`
    INSERT INTO crm_lead_notes (lead_id, author_name, author_role, note_text, note_type)
    VALUES (${id}, ${user.name}, ${user.role}, ${note_text.trim()}, ${note_type || 'note'})
    RETURNING id, created_at
  `

  // Also update last_note on crm_leads for quick display
  await sql`UPDATE crm_leads SET last_note = ${note_text.trim()}, last_updated = NOW() WHERE lead_id = ${id}`

  return NextResponse.json({ success: true, id: row.id, createdAt: row.created_at })
}
