import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

async function ensureTable() {
  await sql`
    CREATE SEQUENCE IF NOT EXISTS crm_data_seq START 1
  `
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
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'All'

    const records = await sql`
      SELECT * FROM crm_data
      WHERE
        (${filter} = 'All'
          OR (${filter} = 'Converted' AND converted = TRUE)
          OR (${filter} = 'Not Converted' AND converted = FALSE))
        AND (
          ${search} = ''
          OR name ILIKE ${'%' + search + '%'}
          OR phone LIKE ${'%' + search + '%'}
          OR email ILIKE ${'%' + search + '%'}
        )
      ORDER BY created_at DESC
      LIMIT 500
    `

    const mapped = records.map((r: any) => ({
      dataId: r.data_id,
      name: r.name,
      phone: r.phone,
      countryCode: r.country_code || '+91',
      email: r.email,
      source: r.source,
      status: r.status,
      notes: r.notes,
      assignedTo: r.assigned_to,
      converted: r.converted ? 'Yes' : 'No',
      convertedLeadId: r.converted_lead_id,
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      dob: '',
      gender: '',
      subSource: '',
      carpetArea: '',
      lastUpdated: r.updated_at,
    }))

    return NextResponse.json({ success: true, records: mapped })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    await ensureTable()
    const body = await request.json()
    const { name = '', phone, email = '', countryCode = '+91', source = '', notes = '' } = body

    if (!phone) return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })

    const [row] = await sql`
      INSERT INTO crm_data (name, phone, email, country_code, source, notes, created_by)
      VALUES (${name}, ${phone}, ${email}, ${countryCode}, ${source}, ${notes}, ${user.name})
      RETURNING data_id
    `

    return NextResponse.json({ success: true, dataId: row.data_id })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
