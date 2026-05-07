import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'
import { runCRMMigration, runCRMUsersMigration } from '@/lib/crmMigration'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value
  const user = verifyCRMToken(token || '')
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
  }

  try {
    await runCRMMigration()
    const usersMigrationResults = await runCRMUsersMigration()
    return NextResponse.json({ success: true, results: usersMigrationResults })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
