import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { leadIds, action, value } = body

    if (!leadIds?.length || !action) {
      return NextResponse.json({ success: false, error: 'leadIds and action required' }, { status: 400 })
    }

    let updated = 0

    if (action === 'reassign') {
      for (const leadId of leadIds) {
        await sql`
          UPDATE crm_leads_v2
          SET assigned_rm = ${value}, updated_at = NOW()
          WHERE lead_id = ${leadId}
        `
        await sql`
          INSERT INTO crm_activity_log
            (lead_id, activity_type, title, description, performed_by)
          VALUES
            (${leadId}, 'lead_assigned', 'Lead reassigned', ${'Assigned to ' + value}, ${user.name})
        `
        updated++
      }
    } else if (action === 'stage') {
      for (const leadId of leadIds) {
        const [enq] = await sql`
          SELECT enquiry_id, stage FROM crm_enquiries
          WHERE lead_id = ${leadId} AND status = 'active'
          ORDER BY updated_at DESC LIMIT 1
        `

        if (enq) {
          await sql`
            UPDATE crm_enquiries
            SET stage = ${value}, updated_at = NOW()
            WHERE enquiry_id = ${enq.enquiry_id}
          `
          await sql`
            INSERT INTO crm_stage_history
              (enquiry_id, lead_id, from_stage, to_stage, sub_stage, notes, changed_by)
            VALUES
              (${enq.enquiry_id}, ${leadId}, ${enq.stage}, ${value}, '', 'Bulk update', ${user.name})
          `
          await sql`
            INSERT INTO crm_activity_log
              (lead_id, enquiry_id, activity_type, title, description, old_value, new_value, performed_by)
            VALUES
              (${leadId}, ${enq.enquiry_id}, 'stage_change', ${value}, 'Bulk update', ${enq.stage}, ${value}, ${user.name})
          `
        } else {
          const [newEnq] = await sql`
            INSERT INTO crm_enquiries (lead_id, stage, created_by)
            VALUES (${leadId}, ${value}, ${user.name})
            RETURNING enquiry_id
          `
          await sql`
            INSERT INTO crm_stage_history
              (enquiry_id, lead_id, from_stage, to_stage, notes, changed_by)
            VALUES
              (${newEnq.enquiry_id}, ${leadId}, 'New', ${value}, 'Bulk update', ${user.name})
          `
          await sql`
            INSERT INTO crm_activity_log
              (lead_id, enquiry_id, activity_type, title, description, old_value, new_value, performed_by)
            VALUES
              (${leadId}, ${newEnq.enquiry_id}, 'stage_change', ${value}, 'Bulk update', 'New', ${value}, ${user.name})
          `
        }
        updated++
      }
    } else if (action === 'delete') {
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 })
      }
      for (const leadId of leadIds) {
        await sql`
          UPDATE crm_leads_v2
          SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${user.name}
          WHERE lead_id = ${leadId}
        `
        updated++
      }
    } else {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
