import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// POST /api/share/track — record a click on a share link (no auth required)
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ ok: false })

    const [link] = await sql`
      UPDATE share_links SET clicks = clicks + 1
      WHERE code = ${code}
      RETURNING sharer_name, rm_id
    `
    if (!link) return NextResponse.json({ ok: true, sharerName: null, rmName: null })

    let rmName: string | null = null
    if (link.rm_id) {
      const [rm] = await sql`SELECT name FROM crm_users WHERE id = ${link.rm_id} LIMIT 1`
      rmName = rm?.name ?? null
    }

    return NextResponse.json({ ok: true, sharerName: link.sharer_name || null, rmName })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
