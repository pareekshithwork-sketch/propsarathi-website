import { NextRequest, NextResponse } from 'next/server'
import { issueAdminToken } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validUsername || !validPassword || !process.env.ADMIN_SECRET_KEY) {
      console.error('Admin credentials not configured in environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({ success: true, token: issueAdminToken() })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
