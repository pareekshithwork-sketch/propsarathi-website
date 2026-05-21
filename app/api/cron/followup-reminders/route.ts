import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendPushNotification, getDeviceTokensForUser, getDeviceTokensForRole } from '@/lib/firebase-admin'

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
      const tokens = task.assigned_to ? await getDeviceTokensForUser(task.assigned_to) : []
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
      const [adminTokens, superAdminTokens] = await Promise.all([
        getDeviceTokensForRole('admin'),
        getDeviceTokensForRole('super_admin'),
      ])

      for (const task of overdue) {
        const rmTokens = task.assigned_to ? await getDeviceTokensForUser(task.assigned_to) : []
        const tokens = [...rmTokens, ...adminTokens, ...superAdminTokens].filter(
          (t, i, a) => t && a.indexOf(t) === i
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
