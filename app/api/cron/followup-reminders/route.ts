import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendPushNotification } from '@/lib/firebase-admin'

// Vercel Cron calls this with a header — accept only from Vercel or internal
function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // no secret configured — allow (Vercel validates origin)
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

async function ensureReminderSentColumn() {
  try {
    await sql`ALTER TABLE crm_tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE`
  } catch {}
}

let columnReady = false

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!columnReady) {
    await ensureReminderSentColumn()
    columnReady = true
  }

  let upcomingNotified = 0
  let overdueNotified = 0

  try {
    // TRIGGER 3 — tasks due within the next 30 minutes, reminder not yet sent
    const upcoming = await sql`
      SELECT
        t.task_id, t.lead_id, t.assigned_to, t.due_at,
        l.name AS lead_name
      FROM crm_tasks t
      LEFT JOIN crm_leads_v2 l ON l.lead_id = t.lead_id AND l.is_deleted = FALSE
      WHERE t.status = 'pending'
        AND t.reminder_sent = FALSE
        AND t.due_at BETWEEN NOW() AND NOW() + INTERVAL '30 minutes'
    `

    for (const task of upcoming) {
      const rows = await sql`SELECT fcm_token FROM crm_device_tokens WHERE user_id = ${task.assigned_to}`
      const tokens = rows.map((r: any) => r.fcm_token).filter(Boolean)
      if (tokens.length) {
        await sendPushNotification(
          tokens,
          'Follow-up Due ⏰',
          `${task.lead_name || 'Lead'} — due in 30 mins`,
          { type: 'followup_due', lead_id: task.lead_id, task_id: task.task_id }
        )
      }
      await sql`UPDATE crm_tasks SET reminder_sent = TRUE WHERE task_id = ${task.task_id}`
      upcomingNotified++
    }

    // TRIGGER 4 — tasks already overdue (past due_at, still pending)
    const overdue = await sql`
      SELECT
        t.task_id, t.lead_id, t.assigned_to, t.due_at,
        l.name AS lead_name,
        EXTRACT(EPOCH FROM (NOW() - t.due_at)) / 3600 AS hours_overdue
      FROM crm_tasks t
      LEFT JOIN crm_leads_v2 l ON l.lead_id = t.lead_id AND l.is_deleted = FALSE
      WHERE t.status = 'pending'
        AND t.due_at < NOW()
    `

    if (overdue.length > 0) {
      // Get all admin/super_admin tokens once
      const adminRows = await sql`
        SELECT dt.fcm_token FROM crm_device_tokens dt
        JOIN crm_users u ON u.name = dt.user_id
        WHERE u.role IN ('admin', 'super_admin') AND u.is_active = TRUE
      `
      const adminTokens = adminRows.map((r: any) => r.fcm_token).filter(Boolean)

      for (const task of overdue) {
        const rmRows = task.assigned_to
          ? await sql`SELECT fcm_token FROM crm_device_tokens WHERE user_id = ${task.assigned_to}`
          : []
        const rmTokens = rmRows.map((r: any) => r.fcm_token).filter(Boolean)

        const tokens = [...rmTokens, ...adminTokens].filter(
          (t: string, i: number, a: string[]) => a.indexOf(t) === i
        )

        if (tokens.length) {
          const hours = Math.round(Number(task.hours_overdue))
          const overdueLabel = hours < 1 ? 'less than an hour' : `${hours} hour${hours === 1 ? '' : 's'}`
          await sendPushNotification(
            tokens,
            'Overdue Follow-up 🔴',
            `${task.lead_name || 'Lead'} — overdue by ${overdueLabel}`,
            { type: 'overdue_followup', lead_id: task.lead_id, task_id: task.task_id }
          )
          overdueNotified++
        }
      }
    }

    return NextResponse.json({
      success: true,
      upcomingNotified,
      overdueNotified,
    })
  } catch (e: any) {
    console.error('[followup-reminders cron]', e)
    return NextResponse.json({ success: false, error: e.message || 'An error occurred' }, { status: 500 })
  }
}
