import { type NextRequest, NextResponse } from "next/server"
import { appendToSheet, initializeSheetHeaders, readFromSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { validateData } from "@/lib/validation"
import bcrypt from "bcryptjs"
import { z } from "zod"

const rmRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  expertise: z.array(z.string()).min(1, "At least one expertise area is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(rmRegistrationSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const data = validation.data
    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Check for duplicate email
    const existingRMs = await readFromSheet("RMs")
    const emailExists = existingRMs.some((row) => row[3] === data.email)

    if (emailExists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Generate RM ID
    const rmId = `RM-${Date.now()}`

    // Initialize headers if needed
    await initializeSheetHeaders("RMs", [
      "RM ID",
      "Registration Date",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Password Hash",
      "Expertise",
      "Status",
      "Approved By",
      "Approved Date",
      "Last Login",
      "Assigned Leads",
      "Closed Leads",
    ])

    // Append to Google Sheets
    await appendToSheet("RMs", [
      [
        rmId,
        timestamp,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        hashedPassword,
        data.expertise.join(", "),
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
      activityType: "RM_ASSIGNED",
      userId: rmId,
      userEmail: data.email,
      userRole: "rm",
      description: `New RM registered: ${data.firstName} ${data.lastName}`,
      ipAddress,
      userAgent,
      metadata: { expertise: data.expertise },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      rmId,
    })
  } catch (error) {
    console.error("[v0] Error processing RM registration:", error)
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 })
  }
}
