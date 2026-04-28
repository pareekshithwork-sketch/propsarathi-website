import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  return verifyCRMToken(token || '')
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || 'All'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = parseInt(searchParams.get('offset') || '0')

  const showDeleted = type === 'Deleted'
  const showDuplicate = type === 'Duplicate'
  const showUnassigned = type === 'Unassigned'
  // RM role always sees only own leads; admin can use "My Leads" filter
  const rmFilter = (user.role === 'rm' || type === 'My Leads') ? user.name : ''

  try {
    const leads = await sql`
      SELECT
        l.*,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS active_enquiry_count,
        COUNT(DISTINCT ls.id) AS listing_count
      FROM crm_leads_v2 l
      LEFT JOIN crm_enquiries e ON e.lead_id = l.lead_id
      LEFT JOIN crm_listings ls ON ls.lead_id = l.lead_id
      WHERE
        (l.is_deleted = FALSE OR ${showDeleted} = TRUE)
        AND (l.is_deleted = TRUE  OR ${showDeleted} = FALSE)
        AND (l.is_duplicate = TRUE OR ${showDuplicate} = FALSE)
        AND (l.assigned_rm = '' OR ${showUnassigned} = FALSE)
        AND (l.assigned_rm = ${rmFilter} OR ${rmFilter} = '')
        AND (
          ${search} = ''
          OR l.name  ILIKE ${'%' + search + '%'}
          OR l.phone LIKE  ${'%' + search + '%'}
        )
      GROUP BY l.id
      ORDER BY l.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ total }] = await sql`
      SELECT COUNT(*) AS total
      FROM crm_leads_v2 l
      WHERE
        (l.is_deleted = FALSE OR ${showDeleted} = TRUE)
        AND (l.is_deleted = TRUE  OR ${showDeleted} = FALSE)
        AND (l.is_duplicate = TRUE OR ${showDuplicate} = FALSE)
        AND (l.assigned_rm = '' OR ${showUnassigned} = FALSE)
        AND (l.assigned_rm = ${rmFilter} OR ${rmFilter} = '')
        AND (
          ${search} = ''
          OR l.name  ILIKE ${'%' + search + '%'}
          OR l.phone LIKE  ${'%' + search + '%'}
        )
    `

    return NextResponse.json({ success: true, leads, total: Number(total) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      name, phone,
      alternatePhone = '', email = '', countryCode = '+91',
      source = 'Direct', subSource = '',
      referralName = '', referralPhone = '',
      customerLocation = '', assignedRm = '',
      leadType = 'Buyer', tags = '',
      forceInsert = false,
    } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }

    // Duplicate check — compare last 10 digits
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const existing = await sql`
      SELECT lead_id, name, assigned_rm
      FROM crm_leads_v2
      WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = ${cleanPhone}
        AND is_deleted = FALSE
      LIMIT 1
    `
    if (existing.length > 0 && !forceInsert) {
      return NextResponse.json({ duplicate: true, existingLead: existing[0] })
    }

    // Resolve assigned_rm_id
    let assignedRmId: number | null = null
    if (assignedRm) {
      const [rmRow] = await sql`SELECT id FROM crm_users WHERE name = ${assignedRm} AND is_active = TRUE LIMIT 1`
      if (rmRow) assignedRmId = rmRow.id
    }

    const [lead] = await sql`
      INSERT INTO crm_leads_v2
        (name, phone, alternate_phone, email, country_code,
         source, sub_source, referral_name, referral_phone,
         customer_location, assigned_rm, assigned_rm_id,
         lead_type, tags, created_by)
      VALUES
        (${name}, ${phone}, ${alternatePhone}, ${email}, ${countryCode},
         ${source}, ${subSource}, ${referralName}, ${referralPhone},
         ${customerLocation}, ${assignedRm}, ${assignedRmId},
         ${leadType}, ${tags}, ${user.name})
      RETURNING *
    `

    await sql`
      INSERT INTO crm_activity_log
        (lead_id, activity_type, title, description, performed_by)
      VALUES
        (${lead.lead_id}, 'lead_created', 'Lead created', ${'Source: ' + source}, ${user.name})
    `

    return NextResponse.json({ success: true, leadId: lead.lead_id, lead })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
