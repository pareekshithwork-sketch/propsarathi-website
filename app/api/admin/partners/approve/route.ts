import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet, updateSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { partnerId } = body

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get partners from sheet
    const partners = await readFromSheet("Partners")
    const partnerIndex = partners.findIndex((row, idx) => idx > 0 && row[0] === partnerId)

    if (partnerIndex === -1) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    const rowNumber = partnerIndex + 1

    // Update partner status to Active
    await Promise.all([
      updateSheet("Partners", `K${rowNumber}`, [["Active"]]),
      updateSheet("Partners", `L${rowNumber}`, [[user.name]]),
      updateSheet("Partners", `M${rowNumber}`, [[timestamp]]),
    ])

    // Log activity
    await logActivity({
      timestamp,
      activityType: "PARTNER_APPROVED",
      userId: user.userId,
      userEmail: user.email,
      userRole: "admin",
      description: `Partner approved: ${partners[partnerIndex][2]} ${partners[partnerIndex][3]} (${partnerId})`,
      ipAddress,
      userAgent,
      metadata: { partnerId, partnerEmail: partners[partnerIndex][4] },
    })

    return NextResponse.json({
      success: true,
      message: "Partner approved successfully",
    })
  } catch (error) {
    console.error("[v0] Error approving partner:", error)
    return NextResponse.json({ error: "Failed to approve partner. Please try again." }, { status: 500 })
  }
}
