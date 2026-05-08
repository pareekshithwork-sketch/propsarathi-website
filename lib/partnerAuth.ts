import jwt from 'jsonwebtoken'
import { type NextRequest } from 'next/server'

export const PARTNER_COOKIE = 'partner_token'
const JWT_SECRET = () => process.env.JWT_SECRET || 'propsarathi-secret-2026'

export interface PartnerTokenPayload {
  partnerId: string
  email: string
  name: string
  status: string
  assignedRM?: string
}

export function generatePartnerToken(payload: PartnerTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: '7d' })
}

export function verifyPartnerToken(token: string): PartnerTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET()) as PartnerTokenPayload
  } catch {
    return null
  }
}

export function getPartnerSession(request: NextRequest): PartnerTokenPayload | null {
  const token = request.cookies.get(PARTNER_COOKIE)?.value
  if (!token) return null
  return verifyPartnerToken(token)
}

export const PARTNER_COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/' as const,
}
