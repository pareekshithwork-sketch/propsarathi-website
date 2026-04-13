// Simple webhook storage using localStorage (client) and in-memory (server)
// This works in v0's preview environment

interface WebhookConfig {
  websiteFormsWebhook: string
  partnerWebhook: string
  rmWebhook: string
}

const STORAGE_KEY = "propsarathi_webhook_config"

// Server-side in-memory storage
let serverConfig: WebhookConfig = {
  websiteFormsWebhook: "",
  partnerWebhook: "",
  rmWebhook: "",
}

export function saveWebhookConfig(config: Partial<WebhookConfig>): void {
  // Update server-side storage
  serverConfig = { ...serverConfig, ...config }

  console.log("[v0] Webhook config saved:", {
    websiteFormsWebhook: serverConfig.websiteFormsWebhook ? "✓ SET" : "✗ NOT SET",
    partnerWebhook: serverConfig.partnerWebhook ? "✓ SET" : "✗ NOT SET",
    rmWebhook: serverConfig.rmWebhook ? "✓ SET" : "✗ NOT SET",
  })

  // Also save to localStorage if available (for persistence across page reloads)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverConfig))
    } catch (e) {
      console.error("[v0] Failed to save to localStorage:", e)
    }
  }
}

export function loadWebhookConfig(): WebhookConfig {
  // Try to load from localStorage first (if on client)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const config = JSON.parse(stored)
        serverConfig = config
        console.log("[v0] Loaded webhook config from localStorage")
      }
    } catch (e) {
      console.error("[v0] Failed to load from localStorage:", e)
    }
  }

  return serverConfig
}

export async function submitToGoogleSheet(
  webhookUrl: string,
  data: any,
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || webhookUrl.trim() === "") {
    console.error("[v0] No webhook URL provided")
    return { success: false, error: "Webhook URL not configured" }
  }

  try {
    console.log("[v0] Submitting to Google Sheet...")
    console.log("[v0] Webhook URL:", webhookUrl.substring(0, 60) + "...")
    console.log("[v0] Data:", JSON.stringify(data, null, 2))

    // Using redirect: "follow" to handle Google's 302 redirects properly
    const response = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] ✓ Successfully submitted to Google Sheet")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting to Google Sheet:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
