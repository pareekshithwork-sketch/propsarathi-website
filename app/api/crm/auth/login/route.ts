import { type NextRequest, NextResponse } from 'next/server'
import { verifyCRMUser, generateCRMToken } from '@/lib/crmAuth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }
    const user = verifyCRMUser(email, password)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }
    const token = generateCRMToken(user)
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
    response.cookies.set('crm_token', token, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 43200,
    })
    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 })
  }
}
