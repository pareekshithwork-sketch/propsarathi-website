import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getPartnerSession } from '@/lib/partnerAuth'

export async function GET(request: NextRequest) {
  const session = getPartnerSession(request)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const projects = await sql`
      SELECT id, slug, name, developer, city, location, project_type, status,
             min_price, max_price, currency, cover_image, highlights, amenities,
             possession_date, rera_number, description, is_featured
      FROM projects
      WHERE is_active = TRUE
      ORDER BY is_featured DESC, created_at DESC
    `
    return NextResponse.json({ success: true, projects })
  } catch (err) {
    console.error('[Partner Projects]', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
