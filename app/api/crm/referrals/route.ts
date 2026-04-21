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

  // Share links — sharer_name stored at creation time
  const referrals = await sql`
    SELECT code, project_slug, sharer_type, sharer_id, sharer_name,
           clicks, leads_count, created_at
    FROM share_links
    ORDER BY created_at DESC
    LIMIT 200
  `

  // Recent document views
  const docViews = await sql`
    SELECT
      dvl.viewed_at, pd.doc_type, pd.project_slug,
      cu.name AS client_name
    FROM document_view_logs dvl
    JOIN protected_documents pd ON pd.id = dvl.document_id
    LEFT JOIN client_users cu ON cu.id = dvl.client_id
    ORDER BY dvl.viewed_at DESC
    LIMIT 100
  `

  return NextResponse.json({ referrals, docViews })
}
