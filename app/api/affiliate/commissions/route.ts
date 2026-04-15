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
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id SERIAL PRIMARY KEY,
      affiliate_name TEXT NOT NULL,
      affiliate_id TEXT NOT NULL DEFAULT '',
      lead_id TEXT NOT NULL,
      property_slug TEXT NOT NULL DEFAULT '',
      property_name TEXT NOT NULL DEFAULT '',
      commission_amount NUMERIC(12,2) DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pending',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ
    )
  `
}

// GET /api/affiliate/commissions — returns this affiliate's commission records
export async function GET(req: NextRequest) {
  const partner = await getPartner(req)
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partnerName = partner.name || ''
  await ensureTable()

  const rows = await sql`
    SELECT id, lead_id, property_slug, property_name, commission_amount, status,
           notes, created_at, approved_at, paid_at
    FROM affiliate_commissions WHERE affiliate_name = ${partnerName}
    ORDER BY created_at DESC
  `
  return NextResponse.json({ success: true, commissions: rows })
}
