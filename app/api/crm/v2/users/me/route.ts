import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMToken } from '@/lib/crmAuth'

function extractToken(request: NextRequest): string | null {
  const cookie = request.cookies.get('crm_token')?.value
  if (cookie) return cookie
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      )
    }
    const user = verifyCRMToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 },
      )
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Auth error' },
      { status: 500 },
    )
  }
}
