import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.set("partner_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[partner/logout] Error:", error)
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}
