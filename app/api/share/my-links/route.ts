import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://propsarathi.com'
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  // Client auth
  const client = await getClientSession()
  if (client) {
    const links = await sql`
      SELECT code, project_slug, clicks, leads_count, created_at
      FROM share_links
      WHERE sharer_type = 'client' AND sharer_id = ${client.clientId}
      ORDER BY created_at DESC
    `
    return NextResponse.json({
      links: links.map(l => ({
        ...l,
        url: `${getBaseUrl()}/properties/${l.project_slug}?ref=${l.code}`,
      })),
    })
  }

  // Partner auth
  const partnerToken = cookieStore.get('partner_token')?.value
  if (partnerToken) {
    let partner: any = null
    try {
      partner = jwt.verify(partnerToken, process.env.JWT_SECRET || 'propsarathi-secret')
    } catch { /* ignore */ }

    if (partner?.id) {
      const links = await sql`
        SELECT code, project_slug, clicks, leads_count, created_at
        FROM share_links
        WHERE sharer_type = 'affiliate' AND sharer_id = ${partner.id}
        ORDER BY created_at DESC
      `
      return NextResponse.json({
        links: links.map(l => ({
          ...l,
          url: `${getBaseUrl()}/properties/${l.project_slug}?ref=${l.code}`,
        })),
      })
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}
