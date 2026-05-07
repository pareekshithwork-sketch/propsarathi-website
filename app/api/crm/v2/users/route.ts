import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

const VALID_ROLES = ['super_admin', 'admin', 'gm', 'rm', 'marketing', 'finance', 'hr', 'viewer']

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await sql`
      SELECT id, user_id, name, email, phone, role, department, team_id, manager_id, is_active
      FROM crm_users
      ORDER BY name ASC
    `
    return NextResponse.json({ success: true, users })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, phone = '', role = 'rm', department = '', managerId = null, teamId = null } = body

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'name, email, and role are required' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()
    const existing = await sql`SELECT id FROM crm_users WHERE LOWER(email) = ${normalEmail} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const managerIdVal = managerId ? parseInt(managerId, 10) : null
    const teamIdVal = teamId ? parseInt(teamId, 10) : null

    const [newUser] = await sql`
      INSERT INTO crm_users (name, email, phone, role, department, manager_id, team_id, is_active)
      VALUES (${name}, ${normalEmail}, ${phone}, ${role}, ${department}, ${managerIdVal}, ${teamIdVal}, true)
      RETURNING id, user_id, name, email, phone, role, department, team_id, manager_id, is_active
    `

    return NextResponse.json({ success: true, user: newUser })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, isActive, role, department, managerId, teamId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
    }

    // Toggle active state
    if (typeof isActive === 'boolean') {
      const [updated] = await sql`
        UPDATE crm_users
        SET is_active = ${isActive}
        WHERE user_id = ${userId}
        RETURNING id, user_id, name, email, role, department, team_id, manager_id, is_active
      `
      if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user: updated })
    }

    // Edit role/dept/manager/team
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Valid role required' }, { status: 400 })
    }

    const managerIdVal = managerId ? parseInt(managerId, 10) : null
    const teamIdVal = teamId ? parseInt(teamId, 10) : null

    const [updated] = await sql`
      UPDATE crm_users
      SET role = ${role},
          department = ${department || ''},
          manager_id = ${managerIdVal},
          team_id = ${teamIdVal}
      WHERE user_id = ${userId}
      RETURNING id, user_id, name, email, role, department, team_id, manager_id, is_active
    `

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, user: updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 })
  }
}
