import { type NextRequest, NextResponse } from 'next/server'
import { getAllProjects } from '@/lib/projectsDb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      city: searchParams.get('city') || undefined,
      projectType: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      search: searchParams.get('q') || undefined,
    }
    const projects = await getAllProjects(filters)
    return NextResponse.json({ success: true, projects })
  } catch (e) {
    console.error('[Properties]', e)
    return NextResponse.json({ success: false, message: 'Failed to fetch projects' }, { status: 500 })
  }
}
