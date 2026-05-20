import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const enquiries = await sql`
      SELECT
        id,
        enquiry_id,
        lead_id,
        project_name,
        property_type,
        min_budget   AS budget_min,
        max_budget   AS budget_max,
        bedrooms,
        stage,
        sub_stage,
        scheduled_at,
        status,
        created_at,
        updated_at
      FROM crm_enquiries
      WHERE lead_id = ${id}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, enquiries })
  } catch (e: any) {
    console.error('[lead enquiries GET]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
