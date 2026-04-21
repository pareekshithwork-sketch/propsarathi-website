import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'

function generateCode(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase()
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://propsarathi.com'
}

export async function POST(req: NextRequest) {
  const { projectSlug } = await req.json()
  if (!projectSlug) return NextResponse.json({ error: 'projectSlug required' }, { status: 400 })

  const cookieStore = await cookies()

  // Try client auth first
  const client = await getClientSession()
  if (client) {
    // Check if link already exists
    const [existing] = await sql`
      SELECT code FROM share_links
      WHERE sharer_type = 'client' AND sharer_id = ${client.clientId} AND project_slug = ${projectSlug}
      LIMIT 1
    `
    if (existing) {
      return NextResponse.json({ url: `${getBaseUrl()}/properties/${projectSlug}?ref=${existing.code}` })
    }

    // Check for ps_ref cookie to detect chain
    const psRef = cookieStore.get('ps_ref')?.value ?? null
    let rmId: number | null = null
    if (psRef) {
      const [refLink] = await sql`SELECT rm_id FROM share_links WHERE code = ${psRef} LIMIT 1`
      if (refLink) rmId = refLink.rm_id
    }

    const code = generateCode()
    await sql`
      INSERT INTO share_links (code, project_slug, sharer_type, sharer_id, sharer_name, rm_id)
      VALUES (${code}, ${projectSlug}, 'client', ${client.clientId}, ${client.name ?? ''}, ${rmId})
    `
    return NextResponse.json({ url: `${getBaseUrl()}/properties/${projectSlug}?ref=${code}` })
  }

  // Try partner/affiliate auth
  const partnerToken = cookieStore.get('partner_token')?.value
  if (partnerToken) {
    let partner: any = null
    try {
      partner = jwt.verify(partnerToken, process.env.JWT_SECRET || 'propsarathi-secret')
    } catch { /* ignore */ }

    if (partner?.id) {
      const [existing] = await sql`
        SELECT code FROM share_links
        WHERE sharer_type = 'affiliate' AND sharer_id = ${partner.id} AND project_slug = ${projectSlug}
        LIMIT 1
      `
      if (existing) {
        return NextResponse.json({ url: `${getBaseUrl()}/properties/${projectSlug}?ref=${existing.code}` })
      }

      const code = generateCode()
      await sql`
        INSERT INTO share_links (code, project_slug, sharer_type, sharer_id, sharer_name)
        VALUES (${code}, ${projectSlug}, 'affiliate', ${partner.id}, ${partner.name ?? ''})
      `
      return NextResponse.json({ url: `${getBaseUrl()}/properties/${projectSlug}?ref=${code}` })
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}
