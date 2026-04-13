import { type NextRequest, NextResponse } from "next/server"
import { readFromSheet, updateSheet } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { loginSchema, validateData } from "@/lib/validation"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"

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

    // Get admins from sheet
    const admins = await readFromSheet("Admins")

    // Find admin by email
    const adminIndex = admins.findIndex(
      (row, idx) => idx > 0 && row[2] === email, // Email is in column 3, index 2
    )

    if (adminIndex === -1) {
      await logActivity({
        timestamp,
        activityType: "ADMIN_LOGIN",
        userEmail: email,
        userRole: "admin",
        description: `Failed admin login attempt - email not found: ${email}`,
        ipAddress,
        userAgent,
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const admin = admins[adminIndex]
    const [adminId, name, adminEmail, passwordHash, status, lastLogin] = admin

    // Check if admin is active
    if (status !== "Active") {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, passwordHash)

    if (!isValidPassword) {
      await logActivity({
        timestamp,
        activityType: "ADMIN_LOGIN",
        userId: adminId,
        userEmail: email,
        userRole: "admin",
        description: `Failed admin login attempt - invalid password: ${email}`,
        ipAddress,
        userAgent,
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    await updateSheet("Admins", `F${adminIndex + 1}`, [[timestamp]])

    // Generate JWT token
    const token = generateToken({
      userId: adminId,
      email: adminEmail,
      role: "admin",
      name,
    })

    // Log successful login
    await logActivity({
      timestamp,
      activityType: "ADMIN_LOGIN",
      userId: adminId,
      userEmail: email,
      userRole: "admin",
      description: `Successful admin login: ${name}`,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: adminId,
        name,
        email: adminEmail,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("[v0] Error processing admin login:", error)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
