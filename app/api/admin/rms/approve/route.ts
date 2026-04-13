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
    const { rmId } = body

    if (!rmId) {
      return NextResponse.json({ error: "RM ID is required" }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get RMs from sheet
    const rms = await readFromSheet("RMs")
    const rmIndex = rms.findIndex((row, idx) => idx > 0 && row[0] === rmId)

    if (rmIndex === -1) {
      return NextResponse.json({ error: "RM not found" }, { status: 404 })
    }

    const rowNumber = rmIndex + 1

    // Update RM status to Active
    await Promise.all([
      updateSheet("RMs", `I${rowNumber}`, [["Active"]]),
      updateSheet("RMs", `J${rowNumber}`, [[user.name]]),
      updateSheet("RMs", `K${rowNumber}`, [[timestamp]]),
    ])

    // Log activity
    await logActivity({
      timestamp,
      activityType: "RM_ASSIGNED",
      userId: user.userId,
      userEmail: user.email,
      userRole: "admin",
      description: `RM approved: ${rms[rmIndex][2]} ${rms[rmIndex][3]} (${rmId})`,
      ipAddress,
      userAgent,
      metadata: { rmId, rmEmail: rms[rmIndex][4] },
    })

    return NextResponse.json({
      success: true,
      message: "RM approved successfully",
    })
  } catch (error) {
    console.error("[v0] Error approving RM:", error)
    return NextResponse.json({ error: "Failed to approve RM. Please try again." }, { status: 500 })
  }
}
