import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// GET /api/crm/blog — list all blog posts for CRM management
export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const posts = await sql`
      SELECT id, slug, title, excerpt, cover_image, author_name, category, tags,
             reading_time, status, published_at, created_at
      FROM blog_posts ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, posts })
  } catch (e: any) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST /api/crm/blog — create a blog post
export async function POST(req: NextRequest) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const data = await req.json()
    if (!data.title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    // Auto-generate slug from title
    if (!data.slug) {
      data.slug = data.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    const [row] = await sql`
      INSERT INTO blog_posts (
        slug, title, excerpt, content, cover_image, author_name,
        category, tags, reading_time, status, published_at
      ) VALUES (
        ${data.slug},
        ${data.title},
        ${data.excerpt || ''},
        ${data.content || ''},
        ${data.cover_image || ''},
        ${data.author_name || user.name},
        ${data.category || 'General'},
        ${data.tags || ''},
        ${data.reading_time || 5},
        ${data.status || 'draft'},
        ${data.status === 'published' ? new Date().toISOString() : null}
      )
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, id: row.id, slug: row.slug })
  } catch (e: any) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
