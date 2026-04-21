import { type NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/clientAuth'
import sql from '@/lib/db'
import { SignJWT } from 'jose'

const DOC_TYPES = ['floor_plan', 'payment_plan', 'brochure'] as const

async function signDocToken(documentId: number, clientId: number): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return new SignJWT({ documentId, clientId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(secret)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; type: string }> }
) {
  const user = await getClientSession()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { slug, type } = await params
  if (!DOC_TYPES.includes(type as any)) {
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
  }

  const docs = await sql`
    SELECT id, label, doc_type FROM protected_documents
    WHERE project_slug = ${slug} AND doc_type = ${type} AND is_active = TRUE
    ORDER BY id ASC
  `

  if (docs.length === 0) return NextResponse.json({ docs: [] })

  // Log views + sign tokens
  const result = await Promise.all(docs.map(async (doc) => {
    // Check if this is first view (for lead auto-creation)
    const [existing] = await sql`
      SELECT id FROM document_view_logs
      WHERE document_id = ${doc.id} AND client_id = ${user.clientId}
      LIMIT 1
    `
    const isFirstView = !existing

    await sql`
      INSERT INTO document_view_logs (document_id, client_id)
      VALUES (${doc.id}, ${user.clientId})
    `

    if (isFirstView) {
      // Auto-create CRM lead if not already exists for this client+project
      const [existingLead] = await sql`
        SELECT id FROM crm_leads
        WHERE client_id = ${user.clientId} AND project = ${slug}
        LIMIT 1
      `
      if (!existingLead) {
        const [clientRow] = await sql`SELECT name, email, phone FROM client_users WHERE id = ${user.clientId}`
        if (clientRow) {
          await sql`
            INSERT INTO crm_leads (name, email, phone, project, source, status, client_id)
            VALUES (
              ${clientRow.name ?? ''},
              ${clientRow.email ?? ''},
              ${clientRow.phone ?? ''},
              ${slug},
              ${'document_view'},
              ${'new'},
              ${user.clientId}
            )
          `
        }
      }
    }

    const token = await signDocToken(doc.id, user.clientId)
    return { id: doc.id, label: doc.label, docType: doc.doc_type, token }
  }))

  return NextResponse.json({ docs: result })
}
