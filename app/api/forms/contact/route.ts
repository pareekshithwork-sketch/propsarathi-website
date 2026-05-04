import { type NextRequest, NextResponse } from "next/server"
import { appendToSheet, initializeSheetHeaders } from "@/lib/googleSheets"
import { logActivity, getClientInfo } from "@/lib/activityLogger"
import { contactFormSchema, validateData } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(contactFormSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const data = validation.data
    const timestamp = new Date().toISOString()
    const { ipAddress, userAgent } = getClientInfo(request)

    // Log to Google Sheets (non-fatal)
    try {
      await initializeSheetHeaders("ContactForms", [
        "Timestamp", "First Name", "Last Name", "Email", "Phone",
        "City", "Property Type", "Budget", "Message", "IP Address", "User Agent", "Status",
      ])
      await appendToSheet("ContactForms", [[
        timestamp, data.firstName, data.lastName, data.email, data.phone,
        data.city, data.propertyType, data.budget, data.message || "",
        ipAddress, userAgent, "New",
      ]])
    } catch (sheetsErr) {
      console.error("[Contact] Sheets write failed (non-fatal):", sheetsErr)
    }

    // Log activity (non-fatal)
    try {
      await logActivity({
        timestamp,
        activityType: "FORM_SUBMISSION",
        userEmail: data.email,
        userRole: "visitor",
        description: `Contact form submitted by ${data.firstName} ${data.lastName}`,
        ipAddress,
        userAgent,
        metadata: { city: data.city, propertyType: data.propertyType },
      })
    } catch { /* non-fatal */ }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to submit form. Please try again." }, { status: 500 })
  }
}
