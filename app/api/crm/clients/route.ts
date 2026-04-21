import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const clients = await sql`
    SELECT
      cu.id, cu.name, cu.email, cu.phone, cu.phone_verified, cu.created_at,
      COUNT(DISTINCT ce.id) AS enquiry_count
    FROM client_users cu
    LEFT JOIN client_enquiries ce ON ce.client_id = cu.id
    GROUP BY cu.id
    ORDER BY cu.created_at DESC
    LIMIT 500
  `
  return NextResponse.json({ clients })
}
