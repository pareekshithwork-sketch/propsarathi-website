import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "propsarathi-secret-2026"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("partner_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      partnerId: string
      email: string
      name: string
      status: string
    }

    return NextResponse.json({
      success: true,
      partner: {
        name: decoded.name,
        email: decoded.email,
        status: decoded.status,
        partnerId: decoded.partnerId,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid or expired session" })
  }
}
