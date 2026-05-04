import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet, updateSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { loginSchema, validateData } from "@/lib/validation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const _partnerSecret = process.env.JWT_SECRET
if (!_partnerSecret) throw new Error("JWT_SECRET environment variable is not set")
const JWT_SECRET: string = _partnerSecret

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const { email, password } = validation.data
    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get partners from sheet
    const partners = await readFromSheet("Partners")

    // Find partner by email (email is in column 5, index 4)
    const partnerIndex = partners.findIndex(
      (row, idx) => idx > 0 && row[4] === email, // Skip header row
    )

    if (partnerIndex === -1) {
      await logActivity({
        timestamp,
        activityType: "PARTNER_LOGIN",
        userEmail: email,
        userRole: "partner",
        description: `Failed login attempt - email not found: ${email}`,
        ipAddress,
        userAgent,
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const partner = partners[partnerIndex]
    const [
      partnerId,
      regDate,
      firstName,
      lastName,
      partnerEmail,
      phone,
      company,
      passwordHash,
      panCard,
      aadharCard,
      status,
    ] = partner

    // Check if partner is approved
    if (status !== "Active" && status !== "Approved") {
      return NextResponse.json({ error: "Account pending approval or deactivated" }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, passwordHash)

    if (!isValidPassword) {
      await logActivity({
        timestamp,
        activityType: "PARTNER_LOGIN",
        userId: partnerId,
        userEmail: email,
        userRole: "partner",
        description: `Failed login attempt - invalid password: ${email}`,
        ipAddress,
        userAgent,
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    await updateSheet("Partners", `N${partnerIndex + 1}`, [[timestamp]])

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: partnerId,
        email: partnerEmail,
        role: "partner",
        name: `${firstName} ${lastName}`,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Log successful login
    await logActivity({
      timestamp,
      activityType: "PARTNER_LOGIN",
      userId: partnerId,
      userEmail: email,
      userRole: "partner",
      description: `Successful login: ${firstName} ${lastName}`,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: partnerId,
        firstName,
        lastName,
        email: partnerEmail,
        phone,
        company,
        role: "partner",
      },
    })
  } catch (error) {
    console.error("[v0] Error processing partner login:", error)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
