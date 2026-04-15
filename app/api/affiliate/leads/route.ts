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

// GET /api/affiliate/leads — returns leads submitted by this affiliate
export async function GET(req: NextRequest) {
  const partner = await getPartner(req)
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partnerName = partner.name || ''
  try {
    const rows = await sql`
      SELECT lead_id, client_name, phone, email, city, property_type, budget, status,
             notes, last_note, created_at, last_updated
      FROM crm_leads
      WHERE affiliate_partner = ${partnerName} AND is_deleted = FALSE
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, leads: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
