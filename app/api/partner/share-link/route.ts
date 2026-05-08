import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function POST(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 })

    // Get partner's assigned RM id for the link
    const [p] = await sql`SELECT partner_id, assigned_rm_id FROM crm_partners WHERE partner_id = ${session.partnerId}`
    if (!p) return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 })

    const ref = p.partner_id
    const rmParam = p.assigned_rm_id ? `&rm=${p.assigned_rm_id}` : ''
    const shareUrl = `/properties/${slug}?ref=${ref}${rmParam}`
    const fullUrl = `https://www.propsarathi.com/properties/${slug}?ref=${ref}${rmParam}`

    return NextResponse.json({ success: true, shareUrl, fullUrl })
  } catch (err) {
    console.error('[Partner Share Link]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
