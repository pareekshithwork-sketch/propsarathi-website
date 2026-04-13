import { appendToSheet } from "./googleSheets"

export type ActivityType =
  | "FORM_SUBMISSION"
  | "PARTNER_REGISTRATION"
  | "PARTNER_LOGIN"
  | "LEAD_CREATED"
  | "LEAD_UPDATED"
  | "RM_ASSIGNED"
  | "DOCUMENT_UPLOADED"
  | "PARTNER_APPROVED"
  | "PARTNER_DEACTIVATED"
  | "ADMIN_LOGIN"
  | "DATA_EXPORT"
  | "SETTINGS_CHANGED"

export interface ActivityLog {
  timestamp: string
  activityType: ActivityType
  userId?: string
  userEmail?: string
  userRole?: "admin" | "partner" | "rm" | "visitor"
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export async function logActivity(activity: ActivityLog) {
  try {
    const row = [
      activity.timestamp,
      activity.activityType,
      activity.userId || "N/A",
      activity.userEmail || "N/A",
      activity.userRole || "visitor",
      activity.description,
      activity.ipAddress || "N/A",
      activity.userAgent || "N/A",
      JSON.stringify(activity.metadata || {}),
    ]

    await appendToSheet("ActivityLogs", [row])
    console.log(`[v0] Activity logged: ${activity.activityType}`)
  } catch (error) {
    console.error("[v0] Error logging activity:", error)
    // Don't throw - logging should not break the main flow
  }
}

export function getClientInfo(request: Request) {
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  return { ipAddress, userAgent }
}
