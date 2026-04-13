import { type NextRequest, NextResponse } from "next/server"
import { saveWebhookConfig, loadWebhookConfig } from "@/lib/webhookStorage"

export async function GET() {
  const config = loadWebhookConfig()

  return NextResponse.json({
    success: true,
    config: {
      websiteFormsWebhook: config.websiteFormsWebhook || "",
      partnerWebhook: config.partnerWebhook || "",
      rmWebhook: config.rmWebhook || "",
      // Return masked versions for security
      websiteFormsWebhookMasked: config.websiteFormsWebhook ? maskUrl(config.websiteFormsWebhook) : "",
      partnerWebhookMasked: config.partnerWebhook ? maskUrl(config.partnerWebhook) : "",
      rmWebhookMasked: config.rmWebhook ? maskUrl(config.rmWebhook) : "",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteFormsWebhook, partnerWebhook, rmWebhook, adminPassword } = body

    console.log("[v0] Webhook save request received")
    console.log("[v0] Admin password provided:", adminPassword ? "YES" : "NO")

    // Simple admin authentication
    if (adminPassword !== "Admin123") {
      console.error("[v0] Invalid admin password")
      return NextResponse.json({ success: false, error: "Invalid admin password" }, { status: 401 })
    }

    console.log("[v0] Saving webhook configuration...")
    console.log("[v0] Website Forms Webhook:", websiteFormsWebhook ? "PROVIDED" : "EMPTY")
    console.log("[v0] Partner Webhook:", partnerWebhook ? "PROVIDED" : "EMPTY")
    console.log("[v0] RM Webhook:", rmWebhook ? "PROVIDED" : "EMPTY")

    saveWebhookConfig({
      websiteFormsWebhook: websiteFormsWebhook || "",
      partnerWebhook: partnerWebhook || "",
      rmWebhook: rmWebhook || "",
    })

    console.log("[v0] ✓ Webhook configuration saved successfully!")

    return NextResponse.json({
      success: true,
      message: "Webhook configuration saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving webhook config:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save configuration",
      },
      { status: 500 },
    )
  }
}

function maskUrl(url: string): string {
  if (!url) return ""
  const parts = url.split("/")
  if (parts.length > 3) {
    return `${parts[0]}//${parts[2]}/.../${parts[parts.length - 1].substring(0, 10)}...`
  }
  return url.substring(0, 30) + "..."
}
