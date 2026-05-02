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

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const rec of records) {
      const phone = (rec.phone || '').trim()
      if (!phone) { skipped++; continue }

      try {
        const result = await sql`
          INSERT INTO crm_leads_v2 (
            name, phone, email, country_code, source, assigned_rm,
            lead_type, tags, notes, created_by
          )
          VALUES (
            ${(rec.name || '').trim()},
            ${phone},
            ${(rec.email || '').trim()},
            ${rec.countryCode || '+91'},
            ${rec.source || 'Direct'},
            ${rec.assignedRm || ''},
            ${rec.leadType || 'Buyer'},
            ${rec.tags || ''},
            ${rec.notes || ''},
            ${user.name}
          )
          ON CONFLICT (phone) DO NOTHING
          RETURNING lead_id
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
