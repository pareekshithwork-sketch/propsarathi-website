import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// PUT /api/crm/blog/[id] — update post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const data = await req.json()

  try {
    await sql`
      UPDATE blog_posts SET
        title = COALESCE(${data.title ?? null}, title),
        excerpt = COALESCE(${data.excerpt ?? null}, excerpt),
        content = COALESCE(${data.content ?? null}, content),
        cover_image = COALESCE(${data.cover_image ?? null}, cover_image),
        author_name = COALESCE(${data.author_name ?? null}, author_name),
        category = COALESCE(${data.category ?? null}, category),
        tags = COALESCE(${data.tags ?? null}, tags),
        reading_time = COALESCE(${data.reading_time ?? null}, reading_time),
        status = COALESCE(${data.status ?? null}, status),
        published_at = CASE
          WHEN ${data.status ?? null} = 'published' AND published_at IS NULL THEN NOW()
          ELSE published_at
        END
      WHERE id = ${Number(id)}
    `
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// DELETE /api/crm/blog/[id] — delete post permanently
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  try {
    await sql`DELETE FROM blog_posts WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
