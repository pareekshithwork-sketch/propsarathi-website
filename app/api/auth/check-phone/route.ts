import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.reset < now) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ exists: false }, { status: 429 })
  }

  try {
    const { phone, context } = await request.json()
    if (!phone) return NextResponse.json({ exists: false })

    const last10 = phone.replace(/\D/g, '').slice(-10)
    if (last10.length < 7) return NextResponse.json({ exists: false })

    if (context === 'partner' || context === 'crm_partner') {
      const [row] = await sql`
        SELECT partner_id, name, assigned_rm_name
        FROM crm_partners
        WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${last10}
        LIMIT 1
      `
      if (row) {
        return NextResponse.json({
          exists: true, type: 'partner',
          name: row.name, assignedRM: row.assigned_rm_name, partnerId: row.partner_id,
        })
      }
      if (context === 'crm_partner') return NextResponse.json({ exists: false })
    }

    // client / default
    const [row] = await sql`
      SELECT id, name FROM client_users
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${last10}
      LIMIT 1
    `
    if (row) {
      return NextResponse.json({ exists: true, type: 'client', name: row.name })
    }

    return NextResponse.json({ exists: false })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
