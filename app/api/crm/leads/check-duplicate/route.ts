import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMLeads } from '@/lib/crmSheets'

function auth(req: NextRequest) {
  const token = req.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(req: NextRequest) {
  const user = auth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ duplicate: false })

  try {
    const leads = await getCRMLeads()
    const clean = phone.replace(/\D/g, '').slice(-10)
    const match = leads.filter(l => {
      const lp = (l.phone || '').replace(/\D/g, '').slice(-10)
      return lp === clean && !l.isDeleted
    })
    return NextResponse.json({
      duplicate: match.length > 0,
      matches: match.map(l => ({ leadId: l.leadId, name: l.clientName, status: l.status, assignedRM: l.assignedRM })),
    })
  } catch {
    return NextResponse.json({ duplicate: false })
  }
}
