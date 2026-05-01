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

  // Date range params
  const dateType = searchParams.get('dateType') || ''
  const dateFrom = searchParams.get('from') || ''
  const dateTo = searchParams.get('to') || ''
  const applyDateFilter = dateFrom.length > 0 && dateTo.length > 0
  const ALLOWED_DATE_COLS: Record<string, string> = {
    created_at: 'l.created_at',
    updated_at: 'l.updated_at',
    deleted_at: 'l.deleted_at',
  }
  const dateCol = ALLOWED_DATE_COLS[dateType] || ''

  // Search fields
  const rawFields = (searchParams.get('searchFields') || 'name,phone').split(',').map(f => f.trim())
  const incName  = rawFields.includes('name')
  const incPhone = rawFields.includes('phone')
  const incEmail = rawFields.includes('email')
  const incAlt   = rawFields.includes('alternate_phone')
  const incSub   = rawFields.includes('sub_source')
  const incSrc   = rawFields.includes('source')
  const incLoc   = rawFields.includes('customer_location')
  const incRef   = rawFields.includes('referral_phone')

  const showDeleted = type === 'Deleted'
  const showDuplicate = type === 'Duplicate'
  const showUnassigned = type === 'Unassigned'
  const rmFilter = (user.role === 'rm' || type === 'My Leads') ? user.name : ''

  try {
    const leads = await sql`
      SELECT
        l.*,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS active_enquiry_count,
        COUNT(DISTINCT ls.id) AS listing_count,
        (SELECT COUNT(*)::int FROM crm_listings ls2
         WHERE ls2.lead_id = l.lead_id
         AND ls2.status NOT IN ('sold')) AS active_listings,
        (SELECT e2.stage FROM crm_enquiries e2
         WHERE e2.lead_id = l.lead_id AND e2.status = 'active'
         ORDER BY e2.updated_at DESC LIMIT 1) AS latest_enquiry_stage,
        (SELECT e2.enquiry_id FROM crm_enquiries e2
         WHERE e2.lead_id = l.lead_id AND e2.status = 'active'
         ORDER BY e2.updated_at DESC LIMIT 1) AS latest_enquiry_id,
        (SELECT e2.sub_stage FROM crm_enquiries e2
         WHERE e2.lead_id = l.lead_id AND e2.status = 'active'
         ORDER BY e2.updated_at DESC LIMIT 1) AS latest_enquiry_sub_stage,
        (SELECT e2.scheduled_at FROM crm_enquiries e2
         WHERE e2.lead_id = l.lead_id AND e2.status = 'active'
         ORDER BY e2.updated_at DESC LIMIT 1) AS latest_scheduled_at,
        (SELECT a.description FROM crm_activity_log a
         WHERE a.lead_id = l.lead_id AND a.activity_type = 'note_added'
         ORDER BY a.created_at DESC LIMIT 1) AS last_note
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
          OR (${incName}  AND l.name  ILIKE ${'%' + search + '%'})
          OR (${incPhone} AND l.phone LIKE  ${'%' + search + '%'})
          OR (${incEmail} AND l.email ILIKE ${'%' + search + '%'})
          OR (${incAlt}   AND l.alternate_phone LIKE ${'%' + search + '%'})
          OR (${incSub}   AND l.sub_source ILIKE ${'%' + search + '%'})
          OR (${incSrc}   AND l.source    ILIKE ${'%' + search + '%'})
          OR (${incLoc}   AND l.customer_location ILIKE ${'%' + search + '%'})
          OR (${incRef}   AND l.referral_phone LIKE ${'%' + search + '%'})
        )
        ${applyDateFilter ? sql`AND (${dateCol} = '' OR l.created_at >= ${dateFrom}::date OR l.updated_at >= ${dateFrom}::date OR l.deleted_at >= ${dateFrom}::date)
        AND (${dateCol} = '' OR l.created_at <= (${dateTo}::date + '1 day'::interval) OR l.updated_at <= (${dateTo}::date + '1 day'::interval) OR l.deleted_at <= (${dateTo}::date + '1 day'::interval))` : sql``}
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
          OR (${incName}  AND l.name  ILIKE ${'%' + search + '%'})
          OR (${incPhone} AND l.phone LIKE  ${'%' + search + '%'})
          OR (${incEmail} AND l.email ILIKE ${'%' + search + '%'})
          OR (${incAlt}   AND l.alternate_phone LIKE ${'%' + search + '%'})
          OR (${incSub}   AND l.sub_source ILIKE ${'%' + search + '%'})
          OR (${incSrc}   AND l.source    ILIKE ${'%' + search + '%'})
          OR (${incLoc}   AND l.customer_location ILIKE ${'%' + search + '%'})
          OR (${incRef}   AND l.referral_phone LIKE ${'%' + search + '%'})
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
