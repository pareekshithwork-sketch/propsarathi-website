import { type NextRequest, NextResponse } from "next/server"

// ── JWT helpers (no external deps) ─────────────────────────────────────────

function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

async function signJWT(payload: object, privateKeyPem: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const body = base64url(JSON.stringify(payload))
  const signingInput = `${header}.${body}`

  // Import the private key
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "")

  const keyData = Buffer.from(pemContents, "base64")

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput),
  )

  return `${signingInput}.${Buffer.from(signature).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  if (!clientEmail || !privateKey) {
    throw new Error("Google Sheets credentials not configured (GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY)")
  }

  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJWT(
    {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    privateKey,
  )

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get access token: ${err}`)
  }

  const { access_token } = await res.json()
  return access_token
}

// ── Append a row to Google Sheets ───────────────────────────────────────────

async function appendToSheet(spreadsheetId: string, sheetName: string, values: any[]): Promise<void> {
  const token = await getAccessToken()

  const range = encodeURIComponent(`'${sheetName}'!A1`)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Sheets append failed: ${err}`)
  }
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formType, data } = body

    console.log("[sheets] Form submission:", formType)

    if (!formType || !data) {
      return NextResponse.json({ success: false, message: "Missing formType or data" }, { status: 400 })
    }

    // Pick spreadsheet based on form type
    let spreadsheetId = ""
    let sheetName = "ContactForms"

    if (formType === "website" || formType === "contact") {
      spreadsheetId = process.env.GOOGLE_SHEETS_ADMIN_SPREADSHEET_ID || ""
      sheetName = "Sheet1"
    } else if (formType === "partner") {
      spreadsheetId = process.env.GOOGLE_SHEETS_PARTNER_SPREADSHEET_ID || ""
      sheetName = "Partners"
    } else if (formType === "rm") {
      spreadsheetId = process.env.GOOGLE_SHEETS_RM_SPREADSHEET_ID || ""
      sheetName = "RMs"
    }

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, message: `Spreadsheet ID not configured for form type: ${formType}` },
        { status: 400 },
      )
    }

    // Clean phone number
    let phoneNumber = (data.phone || "").replace(/\D/g, "")
    if (phoneNumber.startsWith("91") && phoneNumber.length > 10) {
      phoneNumber = phoneNumber.substring(2)
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

    const row = [
      timestamp,
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      phoneNumber,
      data.countryCode || "+91",
      data.city || "",
      data.propertyType || "",
      data.budget || "",
      data.message || "",
      data.source || "Website",
      "New",
    ]

    await appendToSheet(spreadsheetId, sheetName, row)

    console.log("[sheets] ✓ Row appended successfully")

    return NextResponse.json({ success: true, message: "Form submitted successfully" })
  } catch (error) {
    console.error("[sheets] ✗ Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
