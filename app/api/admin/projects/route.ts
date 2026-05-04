import { NextRequest, NextResponse } from 'next/server'
import { getAllProjects, createProject } from '@/lib/projectsDb'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const projects = await getAllProjects()
    return NextResponse.json({ success: true, projects })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await req.json()
    const id = await createProject(data)
    return NextResponse.json({ success: true, id })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}
