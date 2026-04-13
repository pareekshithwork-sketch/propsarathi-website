import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet } from "@/lib/googleSheets"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    // Get leads from sheet
    const leadsData = await readFromSheet("Leads")

    if (leadsData.length === 0) {
      return NextResponse.json({ leads: [] })
    }

    // Skip header row and convert to objects
    const leads = leadsData.slice(1).map((row) => ({
      id: row[0],
      applicationNumber: row[1],
      createdDate: row[2],
      partnerId: row[3],
      partnerName: row[4],
      clientName: row[5],
      clientEmail: row[6],
      clientPhone: row[7],
      city: row[8],
      propertyType: row[9],
      budget: row[10],
      status: row[11],
      assignedRM: row[12],
      notes: row[13],
      lastUpdated: row[14],
      closedDate: row[15],
      revenue: row[16],
    }))

    // Filter leads based on user role
    let filteredLeads = leads
    if (user.role === "partner") {
      filteredLeads = leads.filter((lead) => lead.partnerId === user.userId)
    }
    // Admin sees all leads

    return NextResponse.json({ leads: filteredLeads })
  } catch (error) {
    console.error("[v0] Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads. Please try again." }, { status: 500 })
  }
}
