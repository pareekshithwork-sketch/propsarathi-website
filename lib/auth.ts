import jwt from "jsonwebtoken"

const _authSecret = process.env.JWT_SECRET
if (!_authSecret) throw new Error("JWT_SECRET environment variable is not set")
const JWT_SECRET: string = _authSecret

export interface JWTPayload {
  userId: string
  email: string
  role: "admin" | "partner" | "rm"
  name: string
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("[v0] Token verification failed:", error)
    return null
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}
