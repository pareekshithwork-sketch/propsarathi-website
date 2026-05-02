import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  return verifyCRMToken(token || '')
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { records } = await request.json()
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided' }, { status: 400 })
    }

    // Ensure table exists
    await sql`CREATE SEQUENCE IF NOT EXISTS crm_data_seq START 1`
    await sql`
      CREATE TABLE IF NOT EXISTS crm_data (
        id SERIAL PRIMARY KEY,
        data_id TEXT UNIQUE NOT NULL DEFAULT ('PS-D-' || LPAD(nextval('crm_data_seq')::TEXT, 3, '0')),
        name TEXT DEFAULT '',
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        country_code TEXT DEFAULT '+91',
        source TEXT DEFAULT '',
        status TEXT DEFAULT 'New',
        notes TEXT DEFAULT '',
        assigned_to TEXT DEFAULT '',
        converted BOOLEAN DEFAULT FALSE,
        converted_lead_id TEXT DEFAULT '',
        created_by TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const rec of records) {
      const phone = (rec.phone || '').trim()
      if (!phone) { skipped++; continue }

      try {
        const result = await sql`
          INSERT INTO crm_data (name, phone, email, country_code, source, status, notes, created_by)
          VALUES (
            ${(rec.name || '').trim()},
            ${phone},
            ${(rec.email || '').trim()},
            ${rec.countryCode || '+91'},
            ${rec.source || ''},
            ${rec.status || 'New'},
            ${rec.notes || ''},
            ${user.name}
          )
          ON CONFLICT (phone) DO NOTHING
          RETURNING data_id
        `
        if (result.length > 0) {
          imported++
        } else {
          skipped++
        }
      } catch (e: any) {
        errors.push(`${phone}: ${e.message}`)
      }
    }

    return NextResponse.json({ success: true, imported, skipped, errors })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
