import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getAllProjects, createProject } from '@/lib/projectsDb'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// GET — list all projects for CRM view (admins see all; RMs see only active)
export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const isAdmin = user.role === 'admin'
    const rows = await sql`SELECT * FROM projects WHERE (${isAdmin} OR is_active = TRUE) ORDER BY is_featured DESC, created_at DESC`
    const projects = rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      developer: r.developer,
      city: r.city,
      location: r.location,
      projectType: r.project_type,
      status: r.status,
      minPrice: r.min_price,
      maxPrice: r.max_price,
      currency: r.currency,
      coverImage: r.cover_image,
      isFeatured: r.is_featured,
      isActive: r.is_active,
      possessionDate: r.possession_date,
      reraNumber: r.rera_number,
      description: r.description,
      highlights: r.highlights || '',
      amenities: r.amenities || '',
      numUnits: r.num_units,
      createdAt: r.created_at,
    }))
    return NextResponse.json({ success: true, projects })
  } catch (e) {
    console.error('[CRM Projects GET]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST — create a new project
export async function POST(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const data = await req.json()
    if (!data.name || !data.city) return NextResponse.json({ error: 'Name and city are required' }, { status: 400 })

    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      // append city to make unique
      data.slug = `${data.slug}-${data.city.toLowerCase()}`
    }

    const id = await createProject(data)
    return NextResponse.json({ success: true, id })
  } catch (e: any) {
    console.error('[CRM Projects POST]', e)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
