export interface Lead {
  leadId: string
  createdAt: string
  source: string
  subSource: string
  partnerId: string
  partnerName: string
  clientName: string
  phone: string
  altPhone: string
  landline: string
  countryCode: string
  email: string
  city: string
  propertyType: string
  budget: string
  minBudget: string
  maxBudget: string
  assignedRM: string
  secondaryOwner: string
  status: string
  subStatus: string
  tags: string
  notes: string
  lastNote: string
  referralName: string
  referralPhone: string
  referralEmail: string
  profession: string
  company: string
  designation: string
  gender: string
  dob: string
  maritalStatus: string
  sourcingManager: string
  closingManager: string
  possessionDate: string
  enquiredLocation: string
  purpose: string
  buyer: string
  paymentPlan: string
  affiliatePartner: string
  carpetArea: string
  saleableArea: string
  enquiredFor: string
  projectEnquired: string
  scheduledAt: string
  bookedName: string
  bookedDate: string
  agreementValue: string
  isDeleted: boolean
  isDuplicate: boolean
  lastUpdated: string
}

export interface DataRecord {
  dataId: string
  createdAt: string
  source: string
  name: string
  phone: string
  countryCode: string
  email: string
  dob: string
  gender: string
  subSource: string
  carpetArea: string
  notes: string
  status: string
  converted: string
  convertedLeadId: string
  lastUpdated: string
}

export interface HistoryEntry {
  recordId: string
  recordType: string
  timestamp: string
  action: string
  changedBy: string
  oldStatus: string
  newStatus: string
  notes: string
}

export interface CRMUser {
  name: string
  email: string
  role: string
}
