import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await sql`
      SELECT id, user_id, name, email, phone, role, is_active
      FROM crm_users
      ORDER BY name ASC
    `
    return NextResponse.json({ success: true, users })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
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
    const { name, email, phone = '', role = 'rm', passwordEnv } = body

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'name, email, and role are required' }, { status: 400 })
    }

    const validRoles = ['rm', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const envVar = passwordEnv || (role === 'rm' ? 'CRM_RM_PASSWORD' : 'CRM_ADMIN_PASSWORD')

    const existing = await sql`SELECT id FROM crm_users WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const [newUser] = await sql`
      INSERT INTO crm_users (name, email, phone, role, password_env)
      VALUES (${name}, ${email}, ${phone}, ${role}, ${envVar})
      RETURNING id, user_id, name, email, phone, role, is_active
    `

    return NextResponse.json({ success: true, user: newUser })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
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
    const { userId, isActive } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
    }

    const [updated] = await sql`
      UPDATE crm_users
      SET is_active = ${isActive}
      WHERE user_id = ${userId}
      RETURNING id, user_id, name, email, role, is_active
    `

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, user: updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
