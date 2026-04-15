import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { updateProject } from '@/lib/projectsDb'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// PUT — update project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  await updateProject(Number(id), data)
  return NextResponse.json({ success: true })
}

// DELETE — hard delete a project permanently
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  try {
    // Delete related records first
    await sql`DELETE FROM project_units WHERE project_id = ${Number(id)}`
    await sql`DELETE FROM project_images WHERE project_id = ${Number(id)}`
    await sql`DELETE FROM projects WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
