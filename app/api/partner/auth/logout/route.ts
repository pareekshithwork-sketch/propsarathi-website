import { NextResponse } from 'next/server'
import { PARTNER_COOKIE } from '@/lib/partnerAuth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(PARTNER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
