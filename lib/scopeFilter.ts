import sql from '@/lib/db'

export type Scope = 'my' | 'team' | 'org'

const GM_ROLES = ['gm', 'admin', 'super_admin']
const ADMIN_ROLES = ['admin', 'super_admin']

export function validateScope(raw: string | null | undefined, role: string): Scope {
  const s = (raw || 'my') as Scope
  if (!['my', 'team', 'org'].includes(s)) return 'my'
  if (s === 'org' && !ADMIN_ROLES.includes(role)) return 'my'
  if (s === 'team' && !GM_ROLES.includes(role)) return 'my'
  return s
}

// SQL fragment for crm_leads_v2 with table alias 'l'
export function buildLeadsScopeWhere(scope: Scope, userName: string, teamId?: number | null) {
  if (scope === 'org') return sql``
  if (scope === 'team' && teamId) {
    return sql`AND l.assigned_rm_id IN (SELECT id FROM crm_users WHERE team_id = ${teamId} AND is_active = TRUE)`
  }
  return sql`AND l.assigned_rm = ${userName}`
}

// SQL fragment for enquiry/dashboard queries that join crm_leads_v2 as 'l'
export function buildEnquiriesScopeWhere(scope: Scope, userName: string, teamId?: number | null) {
  if (scope === 'org') return sql``
  if (scope === 'team' && teamId) {
    return sql`AND l.assigned_rm_id IN (SELECT id FROM crm_users WHERE team_id = ${teamId} AND is_active = TRUE)`
  }
  return sql`AND l.assigned_rm = ${userName}`
}

// SQL fragment for crm_partners with table alias 'p'
// NB: crm_partners uses 'assigned_rm' (text name), not assigned_rm_id/assigned_rm_name
export function buildPartnersScopeWhere(scope: Scope, userName: string, teamId?: number | null) {
  if (scope === 'org') return sql``
  if (scope === 'team' && teamId) {
    return sql`AND p.assigned_rm IN (SELECT name FROM crm_users WHERE team_id = ${teamId} AND is_active = TRUE)`
  }
  return sql`AND p.assigned_rm = ${userName}`
}

// SQL fragment for crm_data (no alias, uses 'assigned_to' column)
export function buildDataScopeWhere(scope: Scope, userName: string, teamId?: number | null) {
  if (scope === 'org') return sql``
  if (scope === 'team' && teamId) {
    return sql`AND assigned_to IN (SELECT name FROM crm_users WHERE team_id = ${teamId} AND is_active = TRUE)`
  }
  return sql`AND assigned_to = ${userName}`
}
