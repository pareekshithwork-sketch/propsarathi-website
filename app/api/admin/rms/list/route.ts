import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet } from "@/lib/googleSheets"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    // Get RMs from sheet
    const rmsData = await readFromSheet("RMs")

    if (rmsData.length === 0) {
      return NextResponse.json({ rms: [] })
    }

    // Skip header row and convert to objects (exclude password hash)
    const rms = rmsData.slice(1).map((row) => ({
      id: row[0],
      registrationDate: row[1],
      firstName: row[2],
      lastName: row[3],
      email: row[4],
      phone: row[5],
      expertise: row[7]?.split(", ") || [],
      status: row[8],
      approvedBy: row[9],
      approvedDate: row[10],
      lastLogin: row[11],
      assignedLeads: Number.parseInt(row[12] || "0"),
      closedLeads: Number.parseInt(row[13] || "0"),
    }))

    return NextResponse.json({ rms })
  } catch (error) {
    console.error("[v0] Error fetching RMs:", error)
    return NextResponse.json({ error: "Failed to fetch RMs. Please try again." }, { status: 500 })
  }
}
