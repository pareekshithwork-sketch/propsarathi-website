import { type NextRequest, NextResponse } from "next/server"
import { appendToSheet, initializeSheetHeaders, updateSheet, readFromSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { leadSchema, validateData } from "@/lib/validation"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user || user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = validateData(leadSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const data = validation.data
    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Generate lead ID and application number
    const leadId = `LEAD-${Date.now()}`
    const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Initialize headers if needed
    await initializeSheetHeaders("Leads", [
      "Lead ID",
      "Application Number",
      "Created Date",
      "Partner ID",
      "Partner Name",
      "Client Name",
      "Client Email",
      "Client Phone",
      "City",
      "Property Type",
      "Budget",
      "Status",
      "Assigned RM",
      "Notes",
      "Last Updated",
      "Closed Date",
      "Revenue",
    ])

    // Append to Google Sheets
    await appendToSheet("Leads", [
      [
        leadId,
        applicationNumber,
        timestamp,
        user.userId,
        user.name,
        data.clientName,
        data.clientEmail,
        data.clientPhone,
        data.city,
        data.propertyType,
        data.budget,
        data.status,
        data.assignedRM || "",
        data.notes || "",
        timestamp,
        "",
        "",
      ],
    ])

    // Update partner's total leads count
    const partners = await readFromSheet("Partners")
    const partnerIndex = partners.findIndex((row, idx) => idx > 0 && row[0] === user.userId)

    if (partnerIndex !== -1) {
      const currentLeads = Number.parseInt(partners[partnerIndex][14] || "0")
      await updateSheet("Partners", `O${partnerIndex + 1}`, [[currentLeads + 1]])
    }

    // Log activity
    await logActivity({
      timestamp,
      activityType: "LEAD_CREATED",
      userId: user.userId,
      userEmail: user.email,
      userRole: "partner",
      description: `New lead created: ${data.clientName} for ${data.propertyType} in ${data.city}`,
      ipAddress,
      userAgent,
      metadata: { leadId, applicationNumber, city: data.city, propertyType: data.propertyType },
    })

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      leadId,
      applicationNumber,
    })
  } catch (error) {
    console.error("[v0] Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead. Please try again." }, { status: 500 })
  }
}
