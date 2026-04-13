import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { getCRMData, addCRMData, addCRMHistory } from '@/lib/crmSheets'

function auth(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  if (!token) return null
  return verifyCRMToken(token)
}

export async function GET(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const data = await getCRMData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = auth(request)
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const dataId = `DATA-${Date.now()}`
    const entry = { ...body, dataId, status: body.status || 'New' }
    await addCRMData(entry)
    await addCRMHistory({
      recordId: dataId, recordType: 'data',
      action: 'Data Record Created', changedBy: user.name,
      oldStatus: '', newStatus: 'New', notes: body.notes || '',
    })
    return NextResponse.json({ success: true, dataId })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create data record' }, { status: 500 })
  }
}
