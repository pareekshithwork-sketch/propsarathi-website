import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet, updateSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, updates } = body

    if (!leadId || !updates) {
      return NextResponse.json({ error: "Lead ID and updates are required" }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get leads from sheet
    const leads = await readFromSheet("Leads")
    const leadIndex = leads.findIndex((row, idx) => idx > 0 && row[0] === leadId)

    if (leadIndex === -1) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Check authorization - partners can only update their own leads
    if (user.role === "partner" && leads[leadIndex][3] !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update fields
    const rowNumber = leadIndex + 1
    const updatePromises = []

    if (updates.status) {
      updatePromises.push(updateSheet("Leads", `L${rowNumber}`, [[updates.status]]))
    }
    if (updates.assignedRM) {
      updatePromises.push(updateSheet("Leads", `M${rowNumber}`, [[updates.assignedRM]]))
    }
    if (updates.notes) {
      updatePromises.push(updateSheet("Leads", `N${rowNumber}`, [[updates.notes]]))
    }

    // Always update last updated timestamp
    updatePromises.push(updateSheet("Leads", `O${rowNumber}`, [[timestamp]]))

    // If status is Closed, update closed date
    if (updates.status === "Closed") {
      updatePromises.push(updateSheet("Leads", `P${rowNumber}`, [[timestamp]]))

      // Update partner's converted leads count
      const partners = await readFromSheet("Partners")
      const partnerIndex = partners.findIndex((row, idx) => idx > 0 && row[0] === leads[leadIndex][3])

      if (partnerIndex !== -1) {
        const currentConverted = Number.parseInt(partners[partnerIndex][15] || "0")
        updatePromises.push(updateSheet("Partners", `P${partnerIndex + 1}`, [[currentConverted + 1]]))
      }
    }

    await Promise.all(updatePromises)

    // Log activity
    await logActivity({
      timestamp,
      activityType: "LEAD_UPDATED",
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      description: `Lead updated: ${leadId} - ${JSON.stringify(updates)}`,
      ipAddress,
      userAgent,
      metadata: { leadId, updates },
    })

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
    })
  } catch (error) {
    console.error("[v0] Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead. Please try again." }, { status: 500 })
  }
}
