// Frontend API client helper functions

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

function getWebhookUrl(formType: string): string {
  if (typeof window === "undefined") return ""

  try {
    const stored = localStorage.getItem("propsarathi_webhook_config")
    if (stored) {
      const config = JSON.parse(stored)
      if (formType === "website" || formType === "contact") {
        return config.websiteFormsWebhook || ""
      } else if (formType === "partner") {
        return config.partnerWebhook || ""
      } else if (formType === "rm") {
        return config.rmWebhook || ""
      }
    }
  } catch (e) {
    console.error("[v0] Failed to load webhook config:", e)
  }

  return ""
}

export async function submitContactForm(formData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode?: string
  city: string
  propertyType: string
  budget: string
  message?: string
  source?: string
}) {
  const webhookUrl = getWebhookUrl("website")

  console.log("[v0] Submitting form with webhook URL:", webhookUrl ? "CONFIGURED" : "NOT CONFIGURED")

  const submissionData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone, // Just the phone number without country code
    countryCode: formData.countryCode || "+91", // Country code separately
    city: formData.city,
    propertyType: formData.propertyType,
    budget: formData.budget,
    message: formData.message || "",
    source: formData.source || "Website", // Track the source
  }

  const response = await fetch(`/api/forms/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      formType: "website",
      data: submissionData,
      webhookUrl: webhookUrl,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
    console.error("[v0] API error response:", errorData)
    throw new Error(errorData.message || "Failed to submit form")
  }

  return response.json()
}

export async function loginPartner(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/partner/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Login failed")
  }

  return response.json()
}

export async function registerPartner(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  password: string
  panCard: string
  aadharCard: string
}) {
  const response = await fetch(`${API_URL}/api/partner/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Registration failed")
  }

  return response.json()
}

export async function createLead(
  token: string,
  leadData: {
    clientName: string
    clientEmail: string
    clientPhone: string
    city: string
    propertyType: string
    budget: string
    status: string
    assignedRM?: string
    notes?: string
  },
) {
  const response = await fetch(`${API_URL}/api/leads/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leadData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create lead")
  }

  return response.json()
}

export async function getLeads(token: string) {
  const response = await fetch(`${API_URL}/api/leads/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch leads")
  }

  return response.json()
}

export async function updateLead(
  token: string,
  leadId: string,
  updates: {
    status?: string
    assignedRM?: string
    notes?: string
  },
) {
  const response = await fetch(`${API_URL}/api/leads/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ leadId, updates }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update lead")
  }

  return response.json()
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Login failed")
  }

  return response.json()
}

export async function getPartners(token: string) {
  const response = await fetch(`${API_URL}/api/admin/partners/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch partners")
  }

  return response.json()
}

export async function approvePartner(token: string, partnerId: string) {
  const response = await fetch(`${API_URL}/api/admin/partners/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ partnerId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to approve partner")
  }

  return response.json()
}

export async function getRMs(token: string) {
  const response = await fetch(`${API_URL}/api/admin/rms/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch RMs")
  }

  return response.json()
}

export async function approveRM(token: string, rmId: string) {
  const response = await fetch(`${API_URL}/api/admin/rms/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rmId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to approve RM")
  }

  return response.json()
}
