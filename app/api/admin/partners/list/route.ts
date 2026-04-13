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

    // Get partners from sheet
    const partnersData = await readFromSheet("Partners")

    if (partnersData.length === 0) {
      return NextResponse.json({ partners: [] })
    }

    // Skip header row and convert to objects (exclude password hash)
    const partners = partnersData.slice(1).map((row) => ({
      id: row[0],
      registrationDate: row[1],
      firstName: row[2],
      lastName: row[3],
      email: row[4],
      phone: row[5],
      company: row[6],
      panCard: row[8],
      aadharCard: row[9],
      status: row[10],
      approvedBy: row[11],
      approvedDate: row[12],
      lastLogin: row[13],
      totalLeads: Number.parseInt(row[14] || "0"),
      convertedLeads: Number.parseInt(row[15] || "0"),
    }))

    return NextResponse.json({ partners })
  } catch (error) {
    console.error("[v0] Error fetching partners:", error)
    return NextResponse.json({ error: "Failed to fetch partners. Please try again." }, { status: 500 })
  }
}
