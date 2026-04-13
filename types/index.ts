export interface Partner {
  id: string
  registrationDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  panCard: string
  aadharCard: string
  status: "Pending Approval" | "Active" | "Deactivated"
  approvedBy?: string
  approvedDate?: string
  lastLogin?: string
  totalLeads: number
  convertedLeads: number
}

export interface Lead {
  id: string
  createdDate: string
  partnerId: string
  partnerName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  city: string
  propertyType: string
  budget: string
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Closed" | "Lost"
  assignedRM?: string
  notes?: string
  lastUpdated: string
  applicationNumber?: string
}

export interface RM {
  id: string
  registrationDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
  expertise: string[]
  status: "Pending Approval" | "Active" | "Deactivated"
  assignedLeads: number
  closedLeads: number
}

export interface ActivityLog {
  timestamp: string
  activityType: string
  userId?: string
  userEmail?: string
  userRole?: string
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "admin" | "partner" | "rm"
  company?: string
}
