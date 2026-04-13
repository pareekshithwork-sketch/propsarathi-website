import { NextRequest, NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/projectsDb'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === 'PropSarathi@Admin2026'
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  await updateProject(Number(id), data)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteProject(Number(id))
  return NextResponse.json({ success: true })
}
