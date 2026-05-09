import type { Lead } from './types'

export const RM_LIST = ["Pareekshith Rawal", "Kushal Rawal", "Anil Kumar", "Siva Kali"]

export const SOURCE_OPTIONS = [
  "Direct", "WhatsApp", "Facebook", "Google Ads", "LinkedIn",
  "99 Acres", "Housing.com", "Magic Bricks", "QuikrHomes", "IVR",
  "Referral", "Walk In", "Website", "YouTube", "Gmail",
  "Cold Call", "JustLead", "Partner Portal", "Other"
]

export const CALLBACK_SUBS = [
  "Follow Up", "Future Prospect/Project", "Not Reachable", "Busy",
  "To Schedule A Meeting", "Not Answered", "Need More Info",
  "To Schedule Site Visit", "Plan Postponed"
]
export const MEETING_SUBS = ["On Call", "In Person", "Others", "Online"]
export const SITE_VISIT_SUBS = ["First Visit", "Revisit"]
export const NOT_INTERESTED_SUBS = ["Different Location", "Different Requirements", "Unmatched Budget"]
export const DROP_SUBS = ["Not Enquired", "Wrong/Invalid No", "Ringing Not Received", "Not Looking", "Purchased From Others"]
export const EOI_SUBS = ["Given EOI"]

export const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Callback: "bg-amber-100 text-amber-700 border-amber-200",
  Meeting: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Site Visit": "bg-purple-100 text-purple-700 border-purple-200",
  "Expression of Interest": "bg-orange-100 text-orange-700 border-orange-200",
  Booked: "bg-[#ede9f8] text-[#371f6e] border-[#c4b8ef]",
  "Not Interested": "bg-gray-100 text-gray-600 border-gray-200",
  Dropped: "bg-red-100 text-red-700 border-red-200",
}

export const STATUS_DOT: Record<string, string> = {
  New: "bg-blue-500",
  Callback: "bg-amber-500",
  Meeting: "bg-indigo-500",
  "Site Visit": "bg-purple-500",
  "Expression of Interest": "bg-orange-500",
  Booked: "bg-violet-700",
  "Not Interested": "bg-gray-400",
  Dropped: "bg-red-500",
}

export const EMPTY_LEAD_FORM: Partial<Lead> = {
  source: "Direct", subSource: "", partnerId: "", partnerName: "",
  clientName: "", phone: "", altPhone: "", landline: "", countryCode: "+91",
  email: "", city: "", propertyType: "", budget: "", minBudget: "", maxBudget: "",
  assignedRM: "", secondaryOwner: "", status: "New", subStatus: "", tags: "", notes: "",
  referralName: "", referralPhone: "", referralEmail: "",
  profession: "", company: "", designation: "", gender: "", dob: "", maritalStatus: "",
  sourcingManager: "", closingManager: "", possessionDate: "", enquiredLocation: "",
  purpose: "", buyer: "", paymentPlan: "", affiliatePartner: "", carpetArea: "", saleableArea: "",
  enquiredFor: "", projectEnquired: "", scheduledAt: "",
}

export const PIPELINE_STAGES = ['New','Callback','Meeting','Site Visit','Expression of Interest','Booked','Not Interested','Dropped']

export const STAGE_COL_COLORS: Record<string, string> = {
  New: 'border-t-blue-400',
  Callback: 'border-t-amber-400',
  Meeting: 'border-t-indigo-400',
  'Site Visit': 'border-t-purple-400',
  'Expression of Interest': 'border-t-orange-400',
  Booked: 'border-t-violet-600',
  'Not Interested': 'border-t-gray-300',
  Dropped: 'border-t-red-400',
}

export const EMPTY_PROJECT_FORM = {
  name: '', developer: '', city: 'Bangalore', location: '', projectType: 'Apartment',
  status: 'Pre-Launch', currency: 'INR', minPrice: '', maxPrice: '',
  coverImage: '', description: '', highlights: '', amenities: '',
  possessionDate: '', reraNumber: '', numUnits: '', isFeatured: false, isActive: true,
  // Payment plan
  paymentPlanBooking: '', paymentPlanConstruction: '', paymentPlanPossession: '',
  paymentPlanNote: '', paymentPlanEmi: false,
  // Developer info
  developerDescription: '', developerLogo: '', developerFounded: '',
  developerProjectsCount: '', developerWebsite: '',
  // Content (JSON)
  floorPlans: '', nearbyLocations: '',
}

export const PROJECT_STATUS_OPTIONS = ['Pre-Launch', 'Just Launched', 'Under Construction', 'Ready to Move']
export const PROJECT_TYPE_OPTIONS = ['Apartment', 'Villa', 'Plots', 'Farmland', 'Townhouse', 'Villament', 'Commercial']
export const CITY_OPTIONS = ['Bangalore', 'Dubai']

// ─── V2 canonical stage system (crm_enquiries.stage values) ──────────────────

export const V2_STAGE_TABS = [
  { id: 'All',                    label: 'All Active' },
  { id: 'New',                    label: 'New' },
  { id: 'Callback',               label: 'Callback' },
  { id: 'Schedule Meeting',       label: 'Meeting' },
  { id: 'Schedule Site Visit',    label: 'Site Visit' },
  { id: 'Expression Of Interest', label: 'EOI' },
  { id: 'Book',                   label: 'Booked' },
  { id: 'Not Interested',         label: 'Not Int.' },
  { id: 'Drop',                   label: 'Drop' },
]

export const V2_SUB_STAGES: Record<string, string[]> = {
  Callback:               CALLBACK_SUBS,
  'Schedule Meeting':     MEETING_SUBS,
  'Schedule Site Visit':  SITE_VISIT_SUBS,
  'Expression Of Interest': EOI_SUBS,
  'Not Interested':       NOT_INTERESTED_SUBS,
  Drop:                   DROP_SUBS,
}

export const V2_STAGE_BADGE: Record<string, string> = {
  New:                    'bg-gray-100 text-gray-600 border-gray-200',
  Callback:               'bg-blue-100 text-blue-700 border-blue-200',
  'Schedule Meeting':     'bg-violet-100 text-violet-700 border-violet-200',
  'Schedule Site Visit':  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Expression Of Interest': 'bg-amber-100 text-amber-700 border-amber-200',
  Book:                   'bg-green-100 text-green-700 border-green-200',
  'Not Interested':       'bg-orange-100 text-orange-700 border-orange-200',
  Drop:                   'bg-red-100 text-red-700 border-red-200',
}

export const V2_STAGE_DOT: Record<string, string> = {
  New:                    'bg-gray-400',
  Callback:               'bg-blue-500',
  'Schedule Meeting':     'bg-violet-500',
  'Schedule Site Visit':  'bg-cyan-500',
  'Expression Of Interest': 'bg-amber-500',
  Book:                   'bg-green-500',
  'Not Interested':       'bg-orange-400',
  Drop:                   'bg-red-500',
}

export const V2_STAGE_COL_COLORS: Record<string, string> = {
  New:                    'border-t-gray-400',
  Callback:               'border-t-blue-400',
  'Schedule Meeting':     'border-t-violet-400',
  'Schedule Site Visit':  'border-t-cyan-400',
  'Expression Of Interest': 'border-t-amber-400',
  Book:                   'border-t-green-400',
  'Not Interested':       'border-t-orange-300',
  Drop:                   'border-t-red-400',
}

export const V2_STAGE_LABEL: Record<string, string> = {
  New:                    'New',
  Callback:               'Callback',
  'Schedule Meeting':     'Meeting',
  'Schedule Site Visit':  'Site Visit',
  'Expression Of Interest': 'Expression of Interest',
  Book:                   'Booked',
  'Not Interested':       'Not Interested',
  Drop:                   'Dropped',
}

export const V2_ACTIVE_STAGES = ['New', 'Callback', 'Schedule Meeting', 'Schedule Site Visit', 'Expression Of Interest']
export const V2_CLOSED_STAGES = ['Book', 'Not Interested', 'Drop']
export const V2_ALL_STAGES = [...V2_ACTIVE_STAGES, ...V2_CLOSED_STAGES]

export function v2StageLabel(stage: string | null | undefined): string {
  if (!stage) return 'New'
  return V2_STAGE_LABEL[stage] ?? stage
}

export function v2StageBadge(stage: string | null | undefined): string {
  const s = stage ?? 'New'
  return V2_STAGE_BADGE[s] ?? 'bg-gray-100 text-gray-600 border-gray-200'
}
