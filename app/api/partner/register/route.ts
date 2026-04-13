import { type NextRequest, NextResponse } from "next/server"
import { appendToSheet, initializeSheetHeaders, readFromSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { partnerRegistrationSchema, validateData } from "@/lib/validation"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(partnerRegistrationSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const data = validation.data
    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Check for duplicate email
    const existingPartners = await readFromSheet("Partners")
    const emailExists = existingPartners.some((row) => row[3] === data.email)

    if (emailExists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Generate partner ID
    const partnerId = `PARTNER-${Date.now()}`

    // Initialize headers if needed
    await initializeSheetHeaders("Partners", [
      "Partner ID",
      "Registration Date",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Password Hash",
      "PAN Card",
      "Aadhar Card",
      "Status",
      "Approved By",
      "Approved Date",
      "Last Login",
      "Total Leads",
      "Converted Leads",
    ])

    // Append to Google Sheets
    await appendToSheet("Partners", [
      [
        partnerId,
        timestamp,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.company,
        hashedPassword,
        data.panCard,
        data.aadharCard,
        "Pending Approval",
        "",
        "",
        "",
        "0",
        "0",
      ],
    ])

    // Log activity
    await logActivity({
      timestamp,
      activityType: "PARTNER_REGISTRATION",
      userId: partnerId,
      userEmail: data.email,
      userRole: "partner",
      description: `New partner registered: ${data.firstName} ${data.lastName} from ${data.company}`,
      ipAddress,
      userAgent,
      metadata: { company: data.company, panCard: data.panCard },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      partnerId,
    })
  } catch (error) {
    console.error("[v0] Error processing partner registration:", error)
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 })
  }
}
