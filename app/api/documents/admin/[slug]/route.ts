import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import sql from '@/lib/db'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

// POST — add document to a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  const { docType, label, fileUrl } = await req.json()

  if (!docType || !fileUrl) {
    return NextResponse.json({ error: 'docType and fileUrl are required' }, { status: 400 })
  }

  const [doc] = await sql`
    INSERT INTO protected_documents (project_slug, doc_type, label, file_url)
    VALUES (${slug}, ${docType}, ${label ?? ''}, ${fileUrl})
    RETURNING id, doc_type, label, created_at
  `
  return NextResponse.json({ doc })
}

// GET — list documents for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = auth(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  const docs = await sql`
    SELECT id, doc_type, label, file_url, is_active, created_at
    FROM protected_documents
    WHERE project_slug = ${slug}
    ORDER BY doc_type, id
  `
  return NextResponse.json({ docs })
}
