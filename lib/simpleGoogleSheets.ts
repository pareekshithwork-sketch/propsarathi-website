// Simple Google Sheets integration using webhook URLs
// No googleapis dependency - just direct HTTP POST to Google Apps Script webhooks

interface WebhookConfig {
  websiteFormsWebhook: string
  partnerWebhook: string
  rmWebhook: string
}

// In-memory storage for webhook configuration
let webhookConfig: WebhookConfig = {
  websiteFormsWebhook: "",
  partnerWebhook: "",
  rmWebhook: "",
}

export function setWebhookConfig(config: Partial<WebhookConfig>) {
  webhookConfig = { ...webhookConfig, ...config }
  console.log("[v0] Webhook config updated:", {
    websiteFormsWebhook: webhookConfig.websiteFormsWebhook ? "SET" : "NOT SET",
    partnerWebhook: webhookConfig.partnerWebhook ? "SET" : "NOT SET",
    rmWebhook: webhookConfig.rmWebhook ? "SET" : "NOT SET",
  })
}

export function getWebhookConfig(): WebhookConfig {
  return webhookConfig
}

export async function submitToGoogleSheet(webhookUrl: string, data: any): Promise<boolean> {
  if (!webhookUrl) {
    console.log("[v0] No webhook URL configured")
    return false
  }

  try {
    console.log("[v0] Submitting to Google Sheet:", webhookUrl.substring(0, 50) + "...")
    console.log("[v0] Data being sent:", JSON.stringify(data, null, 2))

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      redirect: "follow",
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Google Sheets webhook error:", response.status, response.statusText, errorText)
      return false
    }

    const result = await response.json()
    console.log("[v0] Google Sheets response:", result)
    return result.success === true
  } catch (error) {
    console.error("[v0] Error submitting to Google Sheet:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return false
  }
}

export async function submitWebsiteForm(formData: any): Promise<boolean> {
  const { websiteFormsWebhook } = webhookConfig

  if (!websiteFormsWebhook) {
    console.log("[v0] Website forms webhook not configured")
    return false
  }

  const data = {
    timestamp: new Date().toISOString(),
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    city: formData.city || "",
    propertyType: formData.propertyType || "",
    budget: formData.budget || "",
    message: formData.message || "",
    status: "New",
  }

  return await submitToGoogleSheet(websiteFormsWebhook, data)
}

export async function submitPartnerData(partnerData: any): Promise<boolean> {
  const { partnerWebhook } = webhookConfig

  if (!partnerWebhook) {
    console.log("[v0] Partner webhook not configured")
    return false
  }

  return await submitToGoogleSheet(partnerWebhook, partnerData)
}

export async function submitRMData(rmData: any): Promise<boolean> {
  const { rmWebhook } = webhookConfig

  if (!rmWebhook) {
    console.log("[v0] RM webhook not configured")
    return false
  }

  return await submitToGoogleSheet(rmWebhook, rmData)
}
