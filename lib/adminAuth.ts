import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export function issueAdminToken(): string {
  const secret = process.env.ADMIN_SECRET_KEY
  if (!secret) throw new Error("ADMIN_SECRET_KEY is not set")
  return jwt.sign({ role: "admin" }, secret, { expiresIn: "24h" })
}

export function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET_KEY
  if (!secret) return false
  const token = req.headers.get("x-admin-key")
  if (!token) return false
  try {
    const payload = jwt.verify(token, secret) as { role?: string }
    return payload.role === "admin"
  } catch {
    return false
  }
}
