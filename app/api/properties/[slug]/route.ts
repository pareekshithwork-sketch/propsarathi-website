import { type NextRequest, NextResponse } from 'next/server'
import { getProjectBySlug } from '@/lib/projectsDb'

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const project = await getProjectBySlug(slug)
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
    return NextResponse.json({ success: true, project })
  } catch (e) {
    console.error('[Property Detail]', e)
    return NextResponse.json({ success: false, message: 'Failed to fetch project' }, { status: 500 })
  }
}
