import sql from './db'

// RM names from crmAuth.ts — we auto-assign only to role='rm' users
// (admin can handle their own leads manually)
const RM_NAMES = ['Kushal Rawal']

/**
 * Returns the RM name with the fewest open (non-deleted, non-Booked/Dropped/Not Interested) leads.
 * Falls back to the first RM if the DB query fails.
 */
export async function getAutoAssignRM(): Promise<string> {
  try {
    const rows = await sql`
      SELECT assigned_rm, COUNT(*) as open_count
      FROM crm_leads
      WHERE is_deleted = FALSE
        AND status NOT IN ('Booked', 'Dropped', 'Not Interested')
        AND assigned_rm = ANY(${RM_NAMES})
      GROUP BY assigned_rm
    `

    // Build a map of RM -> open lead count
    const countMap: Record<string, number> = {}
    for (const rm of RM_NAMES) countMap[rm] = 0
    for (const row of rows) {
      countMap[row.assigned_rm] = Number(row.open_count)
    }

    // Return RM with fewest open leads
    return RM_NAMES.reduce((min, rm) => (countMap[rm] < countMap[min] ? rm : min), RM_NAMES[0])
  } catch {
    return RM_NAMES[0]
  }
}
