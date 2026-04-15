import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'ps_client_token'
const JWT_SECRET = process.env.JWT_SECRET!

export interface ClientTokenPayload {
  clientId: number
  email: string
  name: string
}

export function generateClientToken(payload: ClientTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyClientToken(token: string): ClientTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as ClientTokenPayload
  } catch {
    return null
  }
}

export async function getClientSession(): Promise<ClientTokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyClientToken(token)
}

export { COOKIE_NAME as CLIENT_COOKIE_NAME }
