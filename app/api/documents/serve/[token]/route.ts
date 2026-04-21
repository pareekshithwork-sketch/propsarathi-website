import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import sql from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

  let payload: { documentId: number; clientId: number }
  try {
    const { payload: p } = await jwtVerify(token, secret)
    payload = p as any
  } catch {
    return new NextResponse('Expired or invalid token', { status: 401 })
  }

  const [doc] = await sql`
    SELECT file_url FROM protected_documents WHERE id = ${payload.documentId} AND is_active = TRUE
  `
  if (!doc) return new NextResponse('Document not found', { status: 404 })

  // Proxy the file — real URL never leaves server
  const upstream = await fetch(doc.file_url)
  if (!upstream.ok) return new NextResponse('File unavailable', { status: 502 })

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const body = await upstream.arrayBuffer()

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      // Prevent caching of sensitive file
      'Cache-Control': 'no-store, no-cache',
      // Prevent download
      'Content-Disposition': 'inline',
    },
  })
}
