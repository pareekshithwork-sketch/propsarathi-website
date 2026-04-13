import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' })
    const user = verifyCRMToken(token)
    if (!user) return NextResponse.json({ success: false, message: 'Invalid token' })
    return NextResponse.json({ success: true, user })
  } catch {
    return NextResponse.json({ success: false, message: 'Auth error' })
  }
}
