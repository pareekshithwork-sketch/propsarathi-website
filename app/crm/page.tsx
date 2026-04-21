"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  LayoutDashboard, Users, Database, ChevronLeft, ChevronRight,
  Plus, Search, LogOut, Edit2, Trash2, Phone, Mail, MessageCircle,
  Download, Clock, ArrowLeft, MoreHorizontal, X, Check,
  ChevronDown, AlertCircle, Calendar, MapPin, Loader2,
  TrendingUp, FileText, Building2, User, Menu, Bell,
  PhoneCall, PhoneOff, Eye, RefreshCw, Star, Flag,
  CheckCircle2, XCircle, Activity, BarChart3, Filter,
  ChevronUp, Bookmark, Home, Briefcase, DollarSign, Layers, PieChart, BookOpen,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import MapEditor from "@/components/MapEditor"
import { LogoCompact } from "@/components/Logo"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
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

interface DataRecord {
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

interface HistoryEntry {
  recordId: string
  recordType: string
  timestamp: string
  action: string
  changedBy: string
  oldStatus: string
  newStatus: string
  notes: string
}

interface CRMUser {
  name: string
  email: string
  role: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RM_LIST = ["Pareekshith Rawal", "Kushal Rawal", "Anil Kumar", "Siva Kali"]

const SOURCE_OPTIONS = [
  "Direct", "WhatsApp", "Facebook", "Google Ads", "LinkedIn",
  "99 Acres", "Housing.com", "Magic Bricks", "QuikrHomes", "IVR",
  "Referral", "Walk In", "Website", "YouTube", "Gmail",
  "Cold Call", "JustLead", "Partner Portal", "Other"
]

const CALLBACK_SUBS = [
  "Follow Up", "Future Prospect/Project", "Not Reachable", "Busy",
  "To Schedule A Meeting", "Not Answered", "Need More Info",
  "To Schedule Site Visit", "Plan Postponed"
]
const MEETING_SUBS = ["On Call", "In Person", "Others", "Online"]
const SITE_VISIT_SUBS = ["First Visit", "Revisit"]
const NOT_INTERESTED_SUBS = ["Different Location", "Different Requirements", "Unmatched Budget"]
const DROP_SUBS = ["Not Enquired", "Wrong/Invalid No", "Ringing Not Received", "Not Looking", "Purchased From Others"]
const EOI_SUBS = ["Given EOI"]

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Callback: "bg-amber-100 text-amber-700 border-amber-200",
  Meeting: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Site Visit": "bg-purple-100 text-purple-700 border-purple-200",
  "Expression of Interest": "bg-orange-100 text-orange-700 border-orange-200",
  Booked: "bg-[#ede9f8] text-[#371f6e] border-[#c4b8ef]",
  "Not Interested": "bg-gray-100 text-gray-600 border-gray-200",
  Dropped: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_DOT: Record<string, string> = {
  New: "bg-blue-500",
  Callback: "bg-amber-500",
  Meeting: "bg-indigo-500",
  "Site Visit": "bg-purple-500",
  "Expression of Interest": "bg-orange-500",
  Booked: "bg-violet-700",
  "Not Interested": "bg-gray-400",
  Dropped: "bg-red-500",
}

const EMPTY_LEAD_FORM: Partial<Lead> = {
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

// ─── Helper Components ────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    "MND-1": "bg-purple-600 text-white",
    "DC": "bg-blue-600 text-white",
    "SVND-1": "bg-indigo-600 text-white",
    "Hot": "bg-red-500 text-white",
    "Warm": "bg-orange-500 text-white",
    "Cold": "bg-blue-400 text-white",
    "Escalated": "bg-yellow-500 text-white",
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[tag] || "bg-gray-200 text-gray-700"}`}>
      {tag}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {status}
    </span>
  )
}

function RMInitial({ name, color = "bg-blue-500" }: { name: string; color?: string }) {
  if (!name) return null
  return (
    <span title={name} className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0 ${color}`}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )
}

function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      {children}
    </select>
  )
}

function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    />
  )
}

// ─── Main CRM Page ────────────────────────────────────────────────────────────

export default function CRMPage() {
  // ── Auth ──
  const [authState, setAuthState] = useState<"loading" | "login" | "crm">("loading")
  const [user, setUser] = useState<CRMUser | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // ── View ──
  const [view, setView] = useState<"dashboard" | "leads" | "pipeline" | "reports" | "data" | "projects" | "map" | "blog" | "clients" | "referrals">("dashboard")
  const [clientsList, setClientsList] = useState<any[]>([])
  const [referralsList, setReferralsList] = useState<any[]>([])
  const [docViewsList, setDocViewsList] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState("")

  // ── Data ──
  const [leads, setLeads] = useState<Lead[]>([])
  const [dataRecords, setDataRecords] = useState<DataRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [crmProjects, setCrmProjects] = useState<any[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Lead detail ──
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadHistory, setLeadHistory] = useState<HistoryEntry[]>([])
  const [detailTab, setDetailTab] = useState<"overview" | "status" | "history" | "notes" | "document">("overview")
  const [leadFilter, setLeadFilter] = useState("All")
  const [activeLeadTab, setActiveLeadTab] = useState("All")

  // ── Status action ──
  const [showStatusAction, setShowStatusAction] = useState<{ action: string; sub?: string } | null>(null)
  const [selectedSubStatus, setSelectedSubStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [statusSchedule, setStatusSchedule] = useState("")
  const [bookingForm, setBookingForm] = useState({ bookedName: "", bookedDate: "", agreementValue: "", property: "" })
  const [savingStatus, setSavingStatus] = useState(false)

  // ── Add/Edit Lead modal ──
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [addLeadTab, setAddLeadTab] = useState<"leadinfo" | "enquiry" | "additional" | "others" | "notes">("leadinfo")
  const [leadForm, setLeadForm] = useState<Partial<Lead>>(EMPTY_LEAD_FORM)
  const [savingLead, setSavingLead] = useState(false)

  // ── Data section ──
  const [selectedData, setSelectedData] = useState<DataRecord | null>(null)
  const [showAddData, setShowAddData] = useState(false)
  const [newData, setNewData] = useState({ source: "Direct", name: "", phone: "", countryCode: "+91", email: "", dob: "", gender: "", notes: "" })
  const [savingData, setSavingData] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [convertForm, setConvertForm] = useState({ assignedRM: "", budget: "", propertyType: "", city: "", source: "Walk In" })
  const [dataFilter, setDataFilter] = useState("All")
  const [dataSearch, setDataSearch] = useState("")

  // ── Notes ──
  const [addNoteText, setAddNoteText] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  // ── Auth check on mount ──
  useEffect(() => {
    fetch("/api/crm/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user) {
          setUser(d.user)
          setAuthState("crm")
        } else {
          setAuthState("login")
        }
      })
      .catch(() => setAuthState("login"))
  }, [])

  // ── Load data when crm unlocked ──
  useEffect(() => {
    if (authState === "crm") {
      loadAll()
    }
  }, [authState])

  // ── Load projects when projects tab opened ──
  useEffect(() => {
    if (view === "projects" && user?.role === "admin") {
      loadProjects()
    }
    if (view === "clients" && user?.role === "admin") {
      fetch("/api/crm/clients").then(r => r.json()).then(d => { if (d.clients) setClientsList(d.clients) })
    }
    if (view === "referrals" && user?.role === "admin") {
      fetch("/api/crm/referrals").then(r => r.json()).then(d => {
        if (d.referrals) setReferralsList(d.referrals)
        if (d.docViews) setDocViewsList(d.docViews)
      })
    }
  }, [view])

  async function loadAll() {
    setLoading(true)
    try {
      const [leadsRes, dataRes, statsRes] = await Promise.all([
        fetch("/api/crm/leads"),
        fetch("/api/crm/data"),
        fetch("/api/crm/stats"),
      ])
      const [ld, dd, sd] = await Promise.all([leadsRes.json(), dataRes.json(), statsRes.json()])
      if (ld.success) setLeads(ld.leads || [])
      if (dd.success) setDataRecords(dd.records || [])
      if (sd.success) setStats(sd.stats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadProjects() {
    setProjectsLoading(true)
    try {
      const res = await fetch("/api/crm/projects")
      const data = await res.json()
      if (data.success) setCrmProjects(data.projects || [])
    } catch (e) { console.error(e) }
    finally { setProjectsLoading(false) }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const res = await fetch("/api/crm/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        setAuthState("crm")
      } else {
        setLoginError(data.message || "Invalid credentials")
      }
    } catch {
      setLoginError("Network error")
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/crm/auth/logout", { method: "POST" })
    setUser(null)
    setAuthState("login")
  }

  // ── Lead selection ──
  async function selectLead(lead: Lead | null) {
    if (!lead) { setSelectedLead(null); return }
    setSelectedLead(lead)
    setDetailTab("overview")
    setShowStatusAction(null)
    try {
      const res = await fetch(`/api/crm/leads/${lead.leadId}`)
      const d = await res.json()
      if (d.success) {
        setSelectedLead(d.lead)
        setLeadHistory(d.history || [])
      }
    } catch {}
  }

  // ── Status action ──
  async function saveStatusAction(goNext = false) {
    if (!selectedLead || !showStatusAction) return
    setSavingStatus(true)
    try {
      const body: any = {
        status: showStatusAction.action,
        subStatus: selectedSubStatus,
        notes: statusNote,
        action: `Status set to ${showStatusAction.action}`,
      }
      if (showStatusAction.action === "Callback" || showStatusAction.action === "Meeting" || showStatusAction.action === "Site Visit") {
        body.scheduledAt = statusSchedule
      }
      if (showStatusAction.action === "Booked") {
        body.bookedName = bookingForm.bookedName
        body.bookedDate = bookingForm.bookedDate
        body.agreementValue = bookingForm.agreementValue
        body.projectEnquired = bookingForm.property
      }
      if (statusNote) body.lastNote = statusNote

      await fetch(`/api/crm/leads/${selectedLead.leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      // Update local state
      const updated = { ...selectedLead, status: showStatusAction.action, subStatus: selectedSubStatus, lastNote: statusNote, scheduledAt: statusSchedule }
      setSelectedLead(updated)
      setLeads(prev => prev.map(l => l.leadId === updated.leadId ? updated : l))

      setShowStatusAction(null)
      setSelectedSubStatus("")
      setStatusNote("")
      setStatusSchedule("")
      setBookingForm({ bookedName: "", bookedDate: "", agreementValue: "", property: "" })

      if (goNext) {
        const idx = filteredLeads.findIndex(l => l.leadId === selectedLead.leadId)
        if (idx >= 0 && idx < filteredLeads.length - 1) {
          selectLead(filteredLeads[idx + 1])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingStatus(false)
    }
  }

  async function saveNote() {
    if (!selectedLead || !addNoteText.trim()) return
    setSavingNote(true)
    try {
      await fetch(`/api/crm/leads/${selectedLead.leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastNote: addNoteText }),
      })
      const updated = { ...selectedLead, lastNote: addNoteText }
      setSelectedLead(updated)
      setLeads(prev => prev.map(l => l.leadId === updated.leadId ? updated : l))
      setAddNoteText("")
      // Refresh history
      const res = await fetch(`/api/crm/leads/${selectedLead.leadId}`)
      const d = await res.json()
      if (d.success) setLeadHistory(d.history || [])
    } catch {}
    setSavingNote(false)
  }

  async function deleteLead(lead: Lead) {
    if (user?.role !== 'admin') {
      alert('Only admins can delete leads.')
      return
    }
    const typed = prompt(`Type DELETE to confirm removing lead "${lead.clientName}":`)
    if (typed !== 'DELETE') return
    await fetch(`/api/crm/leads/${lead.leadId}`, { method: "DELETE" })
    setLeads(prev => prev.filter(l => l.leadId !== lead.leadId))
    if (selectedLead?.leadId === lead.leadId) setSelectedLead(null)
  }

  // ── Add/Edit Lead ──
  function openAddLead() {
    setEditingLead(null)
    setLeadForm({ ...EMPTY_LEAD_FORM })
    setAddLeadTab("leadinfo")
    setShowAddLead(true)
  }

  function openEditLead(lead: Lead) {
    setEditingLead(lead)
    setLeadForm({ ...lead })
    setAddLeadTab("leadinfo")
    setShowAddLead(true)
  }

  async function saveLead() {
    if (!leadForm.clientName || !leadForm.phone) return
    setSavingLead(true)
    try {
      if (editingLead) {
        await fetch(`/api/crm/leads/${editingLead.leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadForm),
        })
        setLeads(prev => prev.map(l => l.leadId === editingLead.leadId ? { ...l, ...leadForm } as Lead : l))
        if (selectedLead?.leadId === editingLead.leadId) setSelectedLead({ ...selectedLead, ...leadForm } as Lead)
      } else {
        const res = await fetch("/api/crm/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadForm),
        })
        const d = await res.json()
        if (d.success) {
          const newLead: Lead = { ...EMPTY_LEAD_FORM, ...leadForm, leadId: d.leadId, createdAt: new Date().toLocaleString("en-IN"), lastUpdated: new Date().toLocaleString("en-IN"), isDeleted: false, isDuplicate: false } as Lead
          setLeads(prev => [newLead, ...prev])
        }
      }
      setShowAddLead(false)
    } catch {}
    setSavingLead(false)
  }

  // ── Add Data ──
  async function saveData() {
    if (!newData.name || !newData.phone) return
    setSavingData(true)
    try {
      const res = await fetch("/api/crm/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      })
      const d = await res.json()
      if (d.success) {
        const rec: DataRecord = { ...newData, dataId: d.dataId, createdAt: new Date().toLocaleString("en-IN"), status: "New", converted: "No", convertedLeadId: "", carpetArea: "", subSource: "", lastUpdated: "" }
        setDataRecords(prev => [rec, ...prev])
        setShowAddData(false)
        setNewData({ source: "Direct", name: "", phone: "", countryCode: "+91", email: "", dob: "", gender: "", notes: "" })
      }
    } catch {}
    setSavingData(false)
  }

  // ── Convert Data to Lead ──
  async function convertToLead() {
    if (!selectedData) return
    setSavingData(true)
    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...convertForm,
          clientName: selectedData.name,
          phone: selectedData.phone,
          countryCode: selectedData.countryCode,
          email: selectedData.email,
          source: selectedData.source,
          status: "New",
        }),
      })
      const d = await res.json()
      if (d.success) {
        await fetch(`/api/crm/data/${selectedData.dataId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ converted: true, convertedLeadId: d.leadId }),
        })
        setDataRecords(prev => prev.map(r => r.dataId === selectedData.dataId ? { ...r, converted: "Yes", convertedLeadId: d.leadId } : r))
        setShowConvert(false)
        await loadAll()
      }
    } catch {}
    setSavingData(false)
  }

  // ── Filtered leads ──
  const filteredLeads = useMemo(() => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    return leads.filter(l => {
      if (l.isDeleted && leadFilter !== "Deleted") return false

      if (activeLeadTab === "New" && l.status !== "New") return false
      if (activeLeadTab === "Pending" && l.status !== "Callback") return false
      if (activeLeadTab === "Scheduled" && !["Meeting", "Site Visit"].includes(l.status)) return false
      if (activeLeadTab === "Overdue") {
        if (!["Callback", "Meeting", "Site Visit"].includes(l.status)) return false
        if (l.lastUpdated && new Date(l.lastUpdated) >= twoDaysAgo) return false
      }
      if (activeLeadTab === "EOI" && l.status !== "Expression of Interest") return false
      if (activeLeadTab === "Booked" && l.status !== "Booked") return false

      if (leadFilter === "My Leads" && l.assignedRM !== user?.name) return false
      if (leadFilter === "Unassigned" && l.assignedRM) return false
      if (leadFilter === "Duplicate" && !l.isDuplicate) return false
      if (leadFilter === "Deleted" && !l.isDeleted) return false

      if (search) {
        const q = search.toLowerCase()
        return (
          l.clientName?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.source?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [leads, activeLeadTab, leadFilter, search, user])

  const filteredData = useMemo(() => {
    return dataRecords.filter(d => {
      if (dataFilter === "Converted" && d.converted !== "Yes") return false
      if (dataFilter === "Not Converted" && d.converted === "Yes") return false
      if (dataSearch) {
        const q = dataSearch.toLowerCase()
        return d.name?.toLowerCase().includes(q) || d.phone?.includes(q) || d.email?.toLowerCase().includes(q)
      }
      return true
    })
  }, [dataRecords, dataFilter, dataSearch])

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Loading CRM…</p>
        </div>
      </div>
    )
  }

  if (authState === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <LogoCompact href="" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CRM Login</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@propsarathi.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── CRM App ──
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-14"} bg-[#1a1f2e] text-white flex flex-col transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-2 p-4 border-b border-white/10 ${!sidebarOpen && "justify-center"}`}>
          {sidebarOpen ? (
            <>
              <LogoCompact href="" dark={true} className="flex-1 min-w-0" />
              <span className="text-xs text-blue-400 font-medium flex-shrink-0">CRM</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
              <Building2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "leads", label: "Leads", icon: Users, count: leads.filter(l => !l.isDeleted).length },
            { id: "pipeline", label: "Pipeline", icon: Layers },
            { id: "reports", label: "Reports", icon: BarChart3 },
            { id: "data", label: "Data", icon: Database, count: dataRecords.length },
            ...(user?.role === "admin" ? [{ id: "clients", label: "Clients", icon: User }] : []),
            ...(user?.role === "admin" ? [{ id: "referrals", label: "Referrals", icon: Activity }] : []),
            ...(user?.role === "admin" ? [{ id: "projects", label: "Projects", icon: Building2, count: crmProjects.filter((p: any) => p.isActive).length }] : []),
            ...(user?.role === "admin" ? [{ id: "blog", label: "Blog", icon: BookOpen }] : []),
            { id: "map", label: "Map", icon: MapPin },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as typeof view)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                view === item.id ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              } ${!sidebarOpen && "justify-center"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === item.id ? "bg-white/20" : "bg-white/10"}`}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className={`p-3 border-t border-white/10 ${!sidebarOpen && "flex justify-center"}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/40 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="text-white/40 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-3 px-4 py-2.5 flex-shrink-0">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-semibold text-gray-900 text-base capitalize">{view}</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={view === "data" ? dataSearch : search}
                onChange={e => view === "data" ? setDataSearch(e.target.value) : setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
            </div>
            <button
              onClick={() => view === "data" ? setShowAddData(true) : openAddLead()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {view === "data" ? "Add Data" : "Add Lead"}
            </button>
            <button onClick={loadAll} className="text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "dashboard" && (
            <DashboardView stats={stats} loading={loading} leads={leads} onNavigate={setView} />
          )}
          {view === "leads" && (
            <LeadsView
              leads={leads}
              filteredLeads={filteredLeads}
              selectedLead={selectedLead}
              leadHistory={leadHistory}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              leadFilter={leadFilter}
              setLeadFilter={setLeadFilter}
              activeLeadTab={activeLeadTab}
              setActiveLeadTab={setActiveLeadTab}
              showStatusAction={showStatusAction}
              setShowStatusAction={setShowStatusAction}
              selectedSubStatus={selectedSubStatus}
              setSelectedSubStatus={setSelectedSubStatus}
              statusNote={statusNote}
              setStatusNote={setStatusNote}
              statusSchedule={statusSchedule}
              setStatusSchedule={setStatusSchedule}
              bookingForm={bookingForm}
              setBookingForm={setBookingForm}
              savingStatus={savingStatus}
              addNoteText={addNoteText}
              setAddNoteText={setAddNoteText}
              savingNote={savingNote}
              onSelectLead={selectLead}
              onEditLead={openEditLead}
              onDeleteLead={deleteLead}
              onSaveStatus={saveStatusAction}
              onSaveNote={saveNote}
              onAddLead={openAddLead}
              user={user}
            />
          )}
          {view === "pipeline" && (
            <PipelineView leads={leads.filter(l => !l.isDeleted)} onStatusChange={async (leadId, newStatus) => {
              await fetch(`/api/crm/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
              setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, status: newStatus } : l))
            }} />
          )}
          {view === "reports" && (
            <ReportsView leads={leads.filter(l => !l.isDeleted)} />
          )}
          {view === "projects" && user?.role === "admin" && (
            <ProjectsView
              projects={crmProjects}
              loading={projectsLoading}
              onRefresh={loadProjects}
              onUpdate={(id, data) => fetch(`/api/crm/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(loadProjects)}
              onDelete={(id) => fetch(`/api/crm/projects/${id}`, { method: 'DELETE' }).then(loadProjects)}
              onCreate={(data) => fetch('/api/crm/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(loadProjects)}
            />
          )}
          {view === "blog" && user?.role === "admin" && (
            <BlogView />
          )}
          {view === "data" && (
            <DataView
              dataRecords={filteredData}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              dataFilter={dataFilter}
              setDataFilter={setDataFilter}
              showConvert={showConvert}
              setShowConvert={setShowConvert}
              convertForm={convertForm}
              setConvertForm={setConvertForm}
              onConvert={convertToLead}
              savingData={savingData}
            />
          )}

          {/* ── CLIENTS VIEW ── */}
          {view === "clients" && user?.role === "admin" && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Registered Clients</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Verified</th>
                      <th className="px-4 py-3 text-left">Enquiries</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientsList.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No clients yet</td></tr>
                    )}
                    {clientsList.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                        <td className="px-4 py-3">
                          {c.phone_verified
                            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unverified</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.enquiry_count ?? 0}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REFERRALS VIEW ── */}
          {view === "referrals" && user?.role === "admin" && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Referral Intelligence</h2>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Share Links</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Code</th>
                        <th className="px-4 py-3 text-left">Project</th>
                        <th className="px-4 py-3 text-left">Sharer</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Clicks</th>
                        <th className="px-4 py-3 text-left">Leads</th>
                        <th className="px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {referralsList.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No share links yet</td></tr>
                      )}
                      {referralsList.map((r: any) => (
                        <tr key={r.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.code}</td>
                          <td className="px-4 py-3 text-gray-600">{r.project_slug}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{r.sharer_name || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${r.sharer_type === 'affiliate' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {r.sharer_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{r.clicks}</td>
                          <td className="px-4 py-3 text-gray-600">{r.leads_count}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {docViewsList.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Document Views</h3>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Client</th>
                          <th className="px-4 py-3 text-left">Project</th>
                          <th className="px-4 py-3 text-left">Doc Type</th>
                          <th className="px-4 py-3 text-left">Viewed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {docViewsList.map((v: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">{v.client_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{v.project_slug}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{v.doc_type}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(v.viewed_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {view === "map" && (
            <div className="flex-1 h-full overflow-hidden" style={{ height: "100%" }}>
              <MapEditor />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showAddLead && (
        <LeadModal
          editingLead={editingLead}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          addLeadTab={addLeadTab}
          setAddLeadTab={setAddLeadTab}
          savingLead={savingLead}
          onSave={saveLead}
          onClose={() => setShowAddLead(false)}
        />
      )}

      {/* Add Data Modal */}
      {showAddData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Add Data Record</h2>
              <button onClick={() => setShowAddData(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Name" required>
                  <Input value={newData.name} onChange={e => setNewData(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                </FormField>
                <FormField label="Source">
                  <Select value={newData.source} onChange={e => setNewData(p => ({ ...p, source: e.target.value }))}>
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Phone" required>
                  <Input value={newData.phone} onChange={e => setNewData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                </FormField>
                <FormField label="Email">
                  <Input type="email" value={newData.email} onChange={e => setNewData(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Gender">
                  <Select value={newData.gender} onChange={e => setNewData(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Select>
                </FormField>
                <FormField label="Date of Birth">
                  <Input type="date" value={newData.dob} onChange={e => setNewData(p => ({ ...p, dob: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Notes">
                <Textarea value={newData.notes} onChange={e => setNewData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any notes…" />
              </FormField>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowAddData(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={saveData}
                disabled={savingData || !newData.name || !newData.phone}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {savingData ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ stats, loading, leads, onNavigate }: { stats: any; loading: boolean; leads: Lead[]; onNavigate: (v: any) => void }) {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  const sourceCounts: { source: string; count: number }[] = stats.sourceCounts || []
  const totalLeads = stats.totalLeads || 0

  // Map sources to display groups
  const socialSources = [
    { name: "Facebook", key: "Facebook" },
    { name: "LinkedIn", key: "LinkedIn" },
    { name: "Google Ads", key: "Google Ads" },
    { name: "Gmail", key: "Gmail" },
    { name: "WhatsApp", key: "WhatsApp" },
    { name: "YouTube", key: "YouTube" },
  ]
  const thirdPartySources = [
    { name: "IVR", key: "IVR" },
    { name: "Magic Bricks", key: "Magic Bricks" },
    { name: "99 Acres", key: "99 Acres" },
    { name: "Housing.com", key: "Housing.com" },
    { name: "QuikrHomes", key: "QuikrHomes" },
    { name: "JustLead", key: "JustLead" },
    { name: "Website", key: "Website" },
    { name: "Partner Portal", key: "__partner__" },
  ]
  const otherSources = [
    { name: "Direct", key: "Direct" },
    { name: "Referral", key: "Referral" },
    { name: "Walk In", key: "Walk In" },
    { name: "Cold Call", key: "Cold Call" },
  ]

  function getCount(key: string) {
    if (key === "__partner__") {
      return sourceCounts.filter(s => s.source?.startsWith("Partner:")).reduce((acc, s) => acc + s.count, 0)
    }
    return sourceCounts.find(s => s.source === key)?.count || 0
  }

  const pipelineTiles = [
    { label: "New", value: stats.newLeads, color: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", icon: "🆕" },
    { label: "Pending", value: stats.callbackLeads, color: "border-amber-500", bg: "bg-amber-50", text: "text-amber-700", icon: "⏰" },
    { label: "Callbacks", value: stats.callbackLeads, color: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", icon: "📞" },
    { label: "Meetings", value: stats.meetings, color: "border-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", icon: "📅" },
    { label: "Site Visits", value: stats.siteVisits, color: "border-purple-500", bg: "bg-purple-50", text: "text-purple-700", icon: "📍" },
    { label: "Overdue", value: stats.overdue, color: "border-red-500", bg: "bg-red-50", text: "text-red-700", icon: "🔴" },
    { label: "EOI", value: stats.eoi, color: "border-orange-500", bg: "bg-orange-50", text: "text-orange-700", icon: "⭐" },
    { label: "Booked", value: stats.booked, color: "border-violet-500", bg: "bg-violet-50", text: "text-violet-700", icon: "🏆" },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.totalLeads, sub: `${stats.activeLeads} active`, icon: Users, color: "bg-blue-500" },
          { label: "Unassigned", value: stats.unassigned, sub: "Needs assignment", icon: AlertCircle, color: "bg-amber-500" },
          { label: "Booked", value: stats.booked, sub: "Closed deals", icon: CheckCircle2, color: "bg-green-500" },
          { label: "Total Data", value: stats.totalData, sub: `${stats.convertedData} converted`, icon: Database, color: "bg-indigo-500" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline tiles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Overview</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {pipelineTiles.map(tile => (
            <div key={tile.label} className={`border-l-4 ${tile.color} ${tile.bg} rounded-r-lg p-2 text-center`}>
              <p className="text-lg">{tile.icon}</p>
              <p className={`text-xl font-bold ${tile.text}`}>{tile.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{tile.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source breakdown + RM table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Leads by Source</h2>
          <div className="space-y-4">
            {[
              { group: "Social", sources: socialSources },
              { group: "3rd Party", sources: thirdPartySources },
              { group: "Others", sources: otherSources },
            ].map(({ group, sources }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group}</p>
                <div className="space-y-1.5">
                  {sources.map(s => {
                    const c = getCount(s.key)
                    const pct = totalLeads > 0 ? Math.round((c / totalLeads) * 100) : 0
                    return (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-28 truncate flex-shrink-0">{s.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{c}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(stats.recentActivity || []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              (stats.recentActivity || []).map((h: HistoryEntry, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium truncate">{h.action}</p>
                    <p className="text-xs text-gray-400">{h.changedBy} · {h.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RM Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Team Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Agent", "Total", "New", "Pending", "Overdue", "EOI", "Callbacks", "Meetings", "Site Visits", "Booked"].map(h => (
                  <th key={h} className="text-left pb-2 pr-3 font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.byRM || []).map((rm: any) => (
                <tr key={rm.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium text-gray-800 whitespace-nowrap">{rm.name}</td>
                  <td className="py-2 pr-3 font-bold text-blue-600">{rm.total}</td>
                  <td className="py-2 pr-3">{rm.new}</td>
                  <td className="py-2 pr-3 text-amber-600">{rm.pending}</td>
                  <td className="py-2 pr-3 text-red-600">{rm.overdue}</td>
                  <td className="py-2 pr-3 text-orange-600">{rm.eoi}</td>
                  <td className="py-2 pr-3">{rm.callbacks}</td>
                  <td className="py-2 pr-3">{rm.meetings}</td>
                  <td className="py-2 pr-3">{rm.siteVisits}</td>
                  <td className="py-2 pr-3 text-green-600 font-medium">{rm.booked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Leads View ────────────────────────────────────────────────────────────────

function LeadsView({
  leads, filteredLeads, selectedLead, leadHistory, detailTab, setDetailTab,
  leadFilter, setLeadFilter, activeLeadTab, setActiveLeadTab,
  showStatusAction, setShowStatusAction, selectedSubStatus, setSelectedSubStatus,
  statusNote, setStatusNote, statusSchedule, setStatusSchedule,
  bookingForm, setBookingForm, savingStatus,
  addNoteText, setAddNoteText, savingNote,
  onSelectLead, onEditLead, onDeleteLead, onSaveStatus, onSaveNote, onAddLead, user,
}: any) {

  const statusActions = [
    { label: "Callback", color: "bg-amber-500 hover:bg-amber-600" },
    { label: "Meeting", color: "bg-indigo-500 hover:bg-indigo-600" },
    { label: "Site Visit", color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Expression of Interest", color: "bg-orange-500 hover:bg-orange-600" },
    { label: "Booked", color: "bg-violet-600 hover:bg-violet-700" },
    { label: "Not Interested", color: "bg-gray-500 hover:bg-gray-600" },
    { label: "Dropped", color: "bg-red-500 hover:bg-red-600" },
  ]

  function getSubOptions(action: string): string[] {
    switch (action) {
      case "Callback": return CALLBACK_SUBS
      case "Meeting": return MEETING_SUBS
      case "Site Visit": return SITE_VISIT_SUBS
      case "Not Interested": return NOT_INTERESTED_SUBS
      case "Dropped": return DROP_SUBS
      case "Expression of Interest": return EOI_SUBS
      default: return []
    }
  }

  const tabs = [
    { id: "All", label: "All" },
    { id: "New", label: "New" },
    { id: "Pending", label: "Pending" },
    { id: "Scheduled", label: "Scheduled" },
    { id: "Overdue", label: "Overdue" },
    { id: "EOI", label: "EOI" },
    { id: "Booked", label: "Booked" },
  ]

  const filters = ["All", "My Leads", "Team's", "Unassigned", "Duplicate", "Deleted"]

  // Follow-up reminders
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const DONE_STATUSES = ['Booked','Dropped','Not Interested']
  const remindersToday = leads.filter((l: Lead) => {
    if (!l.scheduledAt || DONE_STATUSES.includes(l.status)) return false
    const d = new Date(l.scheduledAt); d.setHours(0,0,0,0)
    return d.getTime() === today.getTime()
  })
  const remindersOverdue = leads.filter((l: Lead) => {
    if (!l.scheduledAt || DONE_STATUSES.includes(l.status)) return false
    const d = new Date(l.scheduledAt); d.setHours(0,0,0,0)
    return d < today
  })

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Lead list */}
      <div className={`${selectedLead ? "w-96 flex-shrink-0" : "flex-1"} flex flex-col border-r border-gray-200 bg-white overflow-hidden`}>
        {/* Follow-up reminders banner */}
        {(remindersToday.length > 0 || remindersOverdue.length > 0) && (
          <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 flex gap-3 text-xs flex-wrap">
            {remindersOverdue.length > 0 && (
              <button onClick={() => setActiveLeadTab('Overdue')} className="flex items-center gap-1 text-red-600 font-semibold hover:underline">
                <AlertCircle className="w-3.5 h-3.5" />{remindersOverdue.length} Overdue
              </button>
            )}
            {remindersToday.length > 0 && (
              <button onClick={() => setActiveLeadTab('Scheduled')} className="flex items-center gap-1 text-amber-700 font-semibold hover:underline">
                <Clock className="w-3.5 h-3.5" />{remindersToday.length} Due Today
              </button>
            )}
          </div>
        )}
        {/* Filter tabs */}
        <div className="border-b border-gray-100 px-3 pt-2">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveLeadTab(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  activeLeadTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Secondary filter */}
          <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-hide">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setLeadFilter(f)}
                className={`text-xs px-2.5 py-1 rounded whitespace-nowrap flex-shrink-0 transition-colors ${
                  leadFilter === f ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50 flex items-center justify-between">
          <span>{filteredLeads.length} leads</span>
        </div>

        {/* Lead table */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {filteredLeads.map((lead: Lead) => {
                  const tags = lead.tags ? lead.tags.split(",").map(t => t.trim()).filter(Boolean) : []
                  const isSelected = selectedLead?.leadId === lead.leadId
                  const sourceDisplay = lead.source?.startsWith("Partner:") ? "Partner Portal" : lead.source
                  return (
                    <tr
                      key={lead.leadId}
                      onClick={() => onSelectLead(lead)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="pl-3 pr-1 py-2 w-1">
                        <div className={`w-2 h-2 rounded-full ${STATUS_DOT[lead.status] || "bg-gray-400"}`} />
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-semibold text-gray-800">{lead.clientName || "—"}</span>
                          {tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} />)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{lead.countryCode} {lead.phone}</span>
                          {lead.altPhone && <span className="text-gray-400">· {lead.altPhone}</span>}
                        </div>
                        {lead.lastNote && (
                          <p className="text-gray-400 truncate max-w-[160px]">{lead.lastNote}</p>
                        )}
                      </td>
                      <td className="py-2 pr-2 hidden sm:table-cell">
                        <div className="flex items-center gap-1 mb-1">
                          <RMInitial name={lead.assignedRM} color="bg-blue-500" />
                          {lead.secondaryOwner && <RMInitial name={lead.secondaryOwner} color="bg-gray-400" />}
                        </div>
                        <p className="text-gray-400">{sourceDisplay}</p>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="mb-1">
                          <StatusBadge status={lead.status} />
                        </div>
                        {lead.subStatus && <p className="text-gray-400">{lead.subStatus}</p>}
                        <button
                          onClick={e => { e.stopPropagation(); onEditLead(lead) }}
                          className="mt-1 text-gray-300 hover:text-blue-500"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: Lead detail panel */}
      {selectedLead && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Panel header */}
          <div className="border-b border-gray-200 p-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onSelectLead(null)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onEditLead(selectedLead)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => onDeleteLead(selectedLead)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
            <button
              onClick={() => window.open(`tel:${selectedLead.countryCode}${selectedLead.phone}`)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> Call
            </button>
            <button
              onClick={() => window.open(`https://wa.me/${selectedLead.countryCode.replace("+", "")}${selectedLead.phone}`)}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
            {selectedLead.email && (
              <button
                onClick={() => window.open(`mailto:${selectedLead.email}`)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> Email
              </button>
            )}
            <div className="flex-1" />
            <StatusBadge status={selectedLead.status} />
          </div>

          {/* Tab bar */}
          <div className="border-b border-gray-100 flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "status", label: "Status" },
              { id: "notes", label: "Notes" },
              { id: "history", label: "History" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  detailTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {detailTab === "overview" && <LeadOverviewTab lead={selectedLead} />}
            {detailTab === "status" && (
              <LeadStatusTab
                lead={selectedLead}
                statusActions={statusActions}
                showStatusAction={showStatusAction}
                setShowStatusAction={setShowStatusAction}
                selectedSubStatus={selectedSubStatus}
                setSelectedSubStatus={setSelectedSubStatus}
                statusNote={statusNote}
                setStatusNote={setStatusNote}
                statusSchedule={statusSchedule}
                setStatusSchedule={setStatusSchedule}
                bookingForm={bookingForm}
                setBookingForm={setBookingForm}
                savingStatus={savingStatus}
                onSave={onSaveStatus}
                getSubOptions={getSubOptions}
              />
            )}
            {detailTab === "notes" && (
              <LeadNotesTab
                lead={selectedLead}
                history={leadHistory}
                addNoteText={addNoteText}
                setAddNoteText={setAddNoteText}
                savingNote={savingNote}
                onSave={onSaveNote}
              />
            )}
            {detailTab === "history" && (
              <LeadHistoryTab history={leadHistory} />
            )}
          </div>
        </div>
      )}

      {!selectedLead && (
        <div className="flex-1 flex items-center justify-center text-gray-300">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a lead to view details</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Lead Overview Tab ─────────────────────────────────────────────────────────

function LeadOverviewTab({ lead }: { lead: Lead }) {
  const InfoRow = ({ label, value }: { label: string; value: string }) => {
    if (!value) return null
    return (
      <div className="flex">
        <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
        <span className="text-xs text-gray-800 font-medium">{value}</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Lead info header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          {lead.clientName?.charAt(0) || "?"}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">{lead.clientName}</h2>
          <p className="text-xs text-gray-500">{lead.leadId} · {lead.createdAt}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={lead.status} />
            {lead.subStatus && <span className="text-xs text-gray-500">· {lead.subStatus}</span>}
            {lead.isDuplicate && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Duplicate</span>}
          </div>
        </div>
      </div>

      {/* Contact */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</h3>
        <div className="space-y-1.5">
          <InfoRow label="Phone" value={`${lead.countryCode} ${lead.phone}`} />
          <InfoRow label="Alt Phone" value={lead.altPhone} />
          <InfoRow label="Landline" value={lead.landline} />
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="City" value={lead.city} />
          <InfoRow label="Gender" value={lead.gender} />
          <InfoRow label="DOB" value={lead.dob} />
          <InfoRow label="Marital Status" value={lead.maritalStatus} />
        </div>
      </section>

      {/* Professional */}
      {(lead.profession || lead.company || lead.designation) && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Professional</h3>
          <div className="space-y-1.5">
            <InfoRow label="Profession" value={lead.profession} />
            <InfoRow label="Company" value={lead.company} />
            <InfoRow label="Designation" value={lead.designation} />
          </div>
        </section>
      )}

      {/* Property Requirement */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Requirement</h3>
        <div className="space-y-1.5">
          <InfoRow label="Property Type" value={lead.propertyType} />
          <InfoRow label="Budget" value={lead.budget} />
          <InfoRow label="Min Budget" value={lead.minBudget} />
          <InfoRow label="Max Budget" value={lead.maxBudget} />
          <InfoRow label="Location" value={lead.enquiredLocation} />
          <InfoRow label="Enquired For" value={lead.enquiredFor} />
          <InfoRow label="Purpose" value={lead.purpose} />
          <InfoRow label="Possession Date" value={lead.possessionDate} />
          <InfoRow label="Carpet Area" value={lead.carpetArea} />
          <InfoRow label="Saleable Area" value={lead.saleableArea} />
        </div>
      </section>

      {/* Assignment */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Assignment</h3>
        <div className="space-y-1.5">
          <InfoRow label="Assigned RM" value={lead.assignedRM} />
          <InfoRow label="Secondary Owner" value={lead.secondaryOwner} />
          <InfoRow label="Sourcing Manager" value={lead.sourcingManager} />
          <InfoRow label="Closing Manager" value={lead.closingManager} />
          <InfoRow label="Affiliate Partner" value={lead.affiliatePartner} />
        </div>
      </section>

      {/* Source */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Source</h3>
        <div className="space-y-1.5">
          <InfoRow label="Source" value={lead.source?.startsWith("Partner:") ? "Partner Portal" : lead.source} />
          <InfoRow label="Sub Source" value={lead.subSource} />
          {lead.source?.startsWith("Partner:") && <InfoRow label="Partner" value={lead.partnerName} />}
          <InfoRow label="Referral Name" value={lead.referralName} />
          <InfoRow label="Referral Phone" value={lead.referralPhone} />
        </div>
      </section>

      {/* Booking (if booked) */}
      {lead.status === "Booked" && (lead.bookedName || lead.bookedDate || lead.agreementValue) && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Booking Details</h3>
          <div className="space-y-1.5">
            <InfoRow label="Booked Name" value={lead.bookedName} />
            <InfoRow label="Booked Date" value={lead.bookedDate} />
            <InfoRow label="Agreement Value" value={lead.agreementValue} />
            <InfoRow label="Project" value={lead.projectEnquired} />
          </div>
        </section>
      )}

      {/* Last note */}
      {lead.lastNote && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Last Note</h3>
          <p className="text-xs text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3">{lead.lastNote}</p>
        </section>
      )}
    </div>
  )
}

// ─── Lead Status Tab ───────────────────────────────────────────────────────────

function LeadStatusTab({ lead, statusActions, showStatusAction, setShowStatusAction, selectedSubStatus, setSelectedSubStatus, statusNote, setStatusNote, statusSchedule, setStatusSchedule, bookingForm, setBookingForm, savingStatus, onSave, getSubOptions }: any) {
  const subOptions: string[] = showStatusAction ? getSubOptions(showStatusAction.action) : []
  const needsSchedule = showStatusAction && ["Callback", "Meeting", "Site Visit"].includes(showStatusAction.action)
  const isBooking = showStatusAction?.action === "Booked"

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Status</h3>
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {lead.subStatus && <span className="text-xs text-gray-500">{lead.subStatus}</span>}
        </div>
        {lead.scheduledAt && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Scheduled: {lead.scheduledAt}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusActions.map((action: any) => (
            <button
              key={action.label}
              onClick={() => {
                setShowStatusAction(showStatusAction?.action === action.label ? null : { action: action.label })
                setSelectedSubStatus("")
                setStatusNote("")
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${action.color} ${
                showStatusAction?.action === action.label ? "ring-2 ring-offset-1 ring-gray-400" : ""
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {showStatusAction && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700">Setting status to: <span className="text-blue-600">{showStatusAction.action}</span></p>

          {subOptions.length > 0 && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Sub Status</label>
              <select
                value={selectedSubStatus}
                onChange={e => setSelectedSubStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select sub-status…</option>
                {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {needsSchedule && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Schedule Date/Time</label>
              <input
                type="datetime-local"
                value={statusSchedule}
                onChange={e => setStatusSchedule(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {isBooking && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Booked In Name Of</label>
                  <input
                    type="text"
                    value={bookingForm.bookedName}
                    onChange={e => setBookingForm((p: any) => ({ ...p, bookedName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Booking Date</label>
                  <input
                    type="date"
                    value={bookingForm.bookedDate}
                    onChange={e => setBookingForm((p: any) => ({ ...p, bookedDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Agreement Value</label>
                  <input
                    type="text"
                    value={bookingForm.agreementValue}
                    onChange={e => setBookingForm((p: any) => ({ ...p, agreementValue: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1.2 Cr"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Property / Project</label>
                  <input
                    type="text"
                    value={bookingForm.property}
                    onChange={e => setBookingForm((p: any) => ({ ...p, property: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project name"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Note</label>
            <textarea
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Add a note about this update…"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSave(false)}
              disabled={savingStatus}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
            <button
              onClick={() => onSave(true)}
              disabled={savingStatus}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              Save & Next
            </button>
            <button
              onClick={() => setShowStatusAction(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Lead Notes Tab ────────────────────────────────────────────────────────────

function LeadNotesTab({ lead, history, addNoteText, setAddNoteText, savingNote, onSave }: any) {
  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Note</h3>
        <textarea
          value={addNoteText}
          onChange={e => setAddNoteText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          placeholder="Type a note…"
        />
        <button
          onClick={onSave}
          disabled={savingNote || !addNoteText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Save Note
        </button>
      </div>

      {/* Current last note */}
      {lead.lastNote && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">Last Note</p>
          <p className="text-xs text-gray-700">{lead.lastNote}</p>
        </div>
      )}

      {/* All notes from history */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Note History</h3>
        <div className="space-y-2">
          {history.filter((h: HistoryEntry) => h.notes).length === 0 ? (
            <p className="text-xs text-gray-400">No notes yet</p>
          ) : (
            history.filter((h: HistoryEntry) => h.notes).map((h: HistoryEntry, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-700">{h.notes}</p>
                <p className="text-xs text-gray-400 mt-1">{h.changedBy} · {h.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Lead History Tab ──────────────────────────────────────────────────────────

function LeadHistoryTab({ history }: { history: HistoryEntry[] }) {
  return (
    <div className="space-y-2">
      {history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No history yet</p>
      ) : (
        history.map((h, i) => (
          <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
              {i < history.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-xs font-medium text-gray-800">{h.action}</p>
              {h.oldStatus && h.newStatus && (
                <p className="text-xs text-gray-500">
                  <span className="text-gray-400">{h.oldStatus}</span>
                  {" → "}
                  <span className="font-medium">{h.newStatus}</span>
                </p>
              )}
              {h.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{h.notes}"</p>}
              <p className="text-xs text-gray-400 mt-0.5">{h.changedBy} · {h.timestamp}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Data View ─────────────────────────────────────────────────────────────────

function DataView({ dataRecords, selectedData, setSelectedData, dataFilter, setDataFilter, showConvert, setShowConvert, convertForm, setConvertForm, onConvert, savingData }: any) {
  const filters = ["All", "Converted", "Not Converted"]

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`${selectedData ? "w-96 flex-shrink-0" : "flex-1"} flex flex-col border-r border-gray-200 bg-white overflow-hidden`}>
        {/* Filter */}
        <div className="border-b border-gray-100 px-3 py-2 flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setDataFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                dataFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50">
          {dataRecords.length} records
        </div>
        <div className="flex-1 overflow-y-auto">
          {dataRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Database className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No data records</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {dataRecords.map((rec: DataRecord) => (
                  <tr
                    key={rec.dataId}
                    onClick={() => setSelectedData(rec)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedData?.dataId === rec.dataId ? "bg-blue-50" : ""}`}
                  >
                    <td className="pl-3 pr-1 py-2 w-1">
                      <div className={`w-2 h-2 rounded-full ${rec.converted === "Yes" ? "bg-green-500" : "bg-gray-300"}`} />
                    </td>
                    <td className="py-2 pr-2">
                      <p className="font-semibold text-gray-800">{rec.name || "—"}</p>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{rec.countryCode} {rec.phone}</span>
                      </div>
                      {rec.email && <p className="text-gray-400 truncate max-w-[150px]">{rec.email}</p>}
                    </td>
                    <td className="py-2 pr-3">
                      <p className="text-gray-500">{rec.source}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${rec.converted === "Yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {rec.converted === "Yes" ? "Converted" : "Not Converted"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Data detail */}
      {selectedData ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="border-b border-gray-200 p-3 flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
              {selectedData.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-sm">{selectedData.name}</h2>
              <p className="text-xs text-gray-500">{selectedData.dataId} · {selectedData.createdAt}</p>
            </div>
            {selectedData.converted !== "Yes" && (
              <button
                onClick={() => setShowConvert(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
              >
                Convert to Lead
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[
              { label: "Phone", value: `${selectedData.countryCode} ${selectedData.phone}` },
              { label: "Email", value: selectedData.email },
              { label: "Source", value: selectedData.source },
              { label: "Gender", value: selectedData.gender },
              { label: "DOB", value: selectedData.dob },
              { label: "Status", value: selectedData.status },
              { label: "Converted", value: selectedData.converted },
              { label: "Converted Lead ID", value: selectedData.convertedLeadId },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex">
                <span className="text-xs text-gray-500 w-36">{row.label}</span>
                <span className="text-xs font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
            {selectedData.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3">{selectedData.notes}</p>
              </div>
            )}
          </div>

          {/* Convert modal inline */}
          {showConvert && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Convert to Lead</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Assigned RM</label>
                  <select
                    value={convertForm.assignedRM}
                    onChange={e => setConvertForm((p: any) => ({ ...p, assignedRM: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select RM</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Budget</label>
                  <input
                    value={convertForm.budget}
                    onChange={e => setConvertForm((p: any) => ({ ...p, budget: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                    placeholder="e.g. 50 Lakhs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
                  <select
                    value={convertForm.propertyType}
                    onChange={e => setConvertForm((p: any) => ({ ...p, propertyType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select type</option>
                    {["Apartment", "Villa", "Penthouse", "Studio", "Townhouse", "Plot"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">City</label>
                  <select
                    value={convertForm.city}
                    onChange={e => setConvertForm((p: any) => ({ ...p, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select city</option>
                    {["Bangalore", "Dubai", "Mumbai", "Delhi"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onConvert}
                  disabled={savingData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingData ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Convert
                </button>
                <button onClick={() => setShowConvert(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-300">
          <div className="text-center">
            <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a record to view details</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Lead Modal (Add / Edit) ───────────────────────────────────────────────────

function LeadModal({ editingLead, leadForm, setLeadForm, addLeadTab, setAddLeadTab, savingLead, onSave, onClose }: any) {
  function upd(field: string, value: string) {
    setLeadForm((p: any) => ({ ...p, [field]: value }))
  }

  const tabs = [
    { id: "leadinfo", label: "Lead Info" },
    { id: "enquiry", label: "Enquiry" },
    { id: "additional", label: "Additional" },
    { id: "others", label: "Others" },
    { id: "notes", label: "Notes" },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900 text-base">
            {editingLead ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAddLeadTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                addLeadTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {addLeadTab === "leadinfo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Client Name" required>
                  <Input value={leadForm.clientName || ""} onChange={e => upd("clientName", e.target.value)} placeholder="Full name" />
                </FormField>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Phone<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex gap-1.5">
                    <select
                      value={leadForm.countryCode || "+91"}
                      onChange={e => upd("countryCode", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none w-20"
                    >
                      {["+91", "+971", "+1", "+44", "+65", "+61"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Input value={leadForm.phone || ""} onChange={e => upd("phone", e.target.value)} placeholder="Phone" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Alt Phone">
                  <Input value={leadForm.altPhone || ""} onChange={e => upd("altPhone", e.target.value)} placeholder="Alternate phone" />
                </FormField>
                <FormField label="Landline">
                  <Input value={leadForm.landline || ""} onChange={e => upd("landline", e.target.value)} placeholder="Landline" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email">
                  <Input type="email" value={leadForm.email || ""} onChange={e => upd("email", e.target.value)} placeholder="email@example.com" />
                </FormField>
                <FormField label="City">
                  <Select value={leadForm.city || ""} onChange={e => upd("city", e.target.value)}>
                    <option value="">Select city</option>
                    {["Bangalore", "Dubai", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Gurgaon", "Noida"].map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Gender">
                  <Select value={leadForm.gender || ""} onChange={e => upd("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Select>
                </FormField>
                <FormField label="Date of Birth">
                  <Input type="date" value={leadForm.dob || ""} onChange={e => upd("dob", e.target.value)} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Marital Status">
                  <Select value={leadForm.maritalStatus || ""} onChange={e => upd("maritalStatus", e.target.value)}>
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </Select>
                </FormField>
                <FormField label="Status">
                  <Select value={leadForm.status || "New"} onChange={e => upd("status", e.target.value)}>
                    {["New", "Callback", "Meeting", "Site Visit", "Expression of Interest", "Booked", "Not Interested", "Dropped"].map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assigned RM">
                  <Select value={leadForm.assignedRM || ""} onChange={e => upd("assignedRM", e.target.value)}>
                    <option value="">Not Assigned</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </Select>
                </FormField>
                <FormField label="Secondary Owner">
                  <Select value={leadForm.secondaryOwner || ""} onChange={e => upd("secondaryOwner", e.target.value)}>
                    <option value="">None</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Source">
                  <Select value={leadForm.source || "Direct"} onChange={e => upd("source", e.target.value)}>
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </FormField>
                <FormField label="Sub Source">
                  <Input value={leadForm.subSource || ""} onChange={e => upd("subSource", e.target.value)} placeholder="Sub source" />
                </FormField>
              </div>
              <FormField label="Tags">
                <Input value={leadForm.tags || ""} onChange={e => upd("tags", e.target.value)} placeholder="Hot, Warm, Cold (comma separated)" />
              </FormField>
            </div>
          )}

          {addLeadTab === "enquiry" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Property Type">
                  <Select value={leadForm.propertyType || ""} onChange={e => upd("propertyType", e.target.value)}>
                    <option value="">Select</option>
                    {["Apartment", "Villa", "Penthouse", "Studio", "Townhouse", "Plot", "Commercial"].map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormField>
                <FormField label="Budget">
                  <Input value={leadForm.budget || ""} onChange={e => upd("budget", e.target.value)} placeholder="e.g. 1 Cr, AED 500K" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Min Budget">
                  <Input value={leadForm.minBudget || ""} onChange={e => upd("minBudget", e.target.value)} placeholder="Min budget" />
                </FormField>
                <FormField label="Max Budget">
                  <Input value={leadForm.maxBudget || ""} onChange={e => upd("maxBudget", e.target.value)} placeholder="Max budget" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Enquired Location">
                  <Input value={leadForm.enquiredLocation || ""} onChange={e => upd("enquiredLocation", e.target.value)} placeholder="Location" />
                </FormField>
                <FormField label="Enquired For">
                  <Input value={leadForm.enquiredFor || ""} onChange={e => upd("enquiredFor", e.target.value)} placeholder="What property" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Purpose">
                  <Select value={leadForm.purpose || ""} onChange={e => upd("purpose", e.target.value)}>
                    <option value="">Select</option>
                    <option>Investment</option>
                    <option>Own Use</option>
                    <option>Rental Income</option>
                    <option>Capital Appreciation</option>
                  </Select>
                </FormField>
                <FormField label="Buyer">
                  <Select value={leadForm.buyer || ""} onChange={e => upd("buyer", e.target.value)}>
                    <option value="">Select</option>
                    <option>First Time Buyer</option>
                    <option>Repeat Buyer</option>
                    <option>Investor</option>
                    <option>NRI</option>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Possession Date">
                  <Input type="date" value={leadForm.possessionDate || ""} onChange={e => upd("possessionDate", e.target.value)} />
                </FormField>
                <FormField label="Payment Plan">
                  <Select value={leadForm.paymentPlan || ""} onChange={e => upd("paymentPlan", e.target.value)}>
                    <option value="">Select</option>
                    <option>Full Payment</option>
                    <option>Loan</option>
                    <option>Construction Linked</option>
                    <option>Post Possession</option>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Carpet Area (sq ft)">
                  <Input value={leadForm.carpetArea || ""} onChange={e => upd("carpetArea", e.target.value)} placeholder="e.g. 1200" />
                </FormField>
                <FormField label="Saleable Area (sq ft)">
                  <Input value={leadForm.saleableArea || ""} onChange={e => upd("saleableArea", e.target.value)} placeholder="e.g. 1500" />
                </FormField>
              </div>
              <FormField label="Project Enquired">
                <Input value={leadForm.projectEnquired || ""} onChange={e => upd("projectEnquired", e.target.value)} placeholder="Project / property name" />
              </FormField>
            </div>
          )}

          {addLeadTab === "additional" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Profession">
                  <Input value={leadForm.profession || ""} onChange={e => upd("profession", e.target.value)} placeholder="e.g. Doctor, Engineer" />
                </FormField>
                <FormField label="Company">
                  <Input value={leadForm.company || ""} onChange={e => upd("company", e.target.value)} placeholder="Company name" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Designation">
                  <Input value={leadForm.designation || ""} onChange={e => upd("designation", e.target.value)} placeholder="Job title" />
                </FormField>
                <FormField label="Affiliate Partner">
                  <Input value={leadForm.affiliatePartner || ""} onChange={e => upd("affiliatePartner", e.target.value)} placeholder="Affiliate partner name" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sourcing Manager">
                  <Select value={leadForm.sourcingManager || ""} onChange={e => upd("sourcingManager", e.target.value)}>
                    <option value="">None</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </Select>
                </FormField>
                <FormField label="Closing Manager">
                  <Select value={leadForm.closingManager || ""} onChange={e => upd("closingManager", e.target.value)}>
                    <option value="">None</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </Select>
                </FormField>
              </div>
            </div>
          )}

          {addLeadTab === "others" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Referral Name">
                  <Input value={leadForm.referralName || ""} onChange={e => upd("referralName", e.target.value)} placeholder="Referral person name" />
                </FormField>
                <FormField label="Referral Phone">
                  <Input value={leadForm.referralPhone || ""} onChange={e => upd("referralPhone", e.target.value)} placeholder="Referral phone" />
                </FormField>
              </div>
              <FormField label="Referral Email">
                <Input type="email" value={leadForm.referralEmail || ""} onChange={e => upd("referralEmail", e.target.value)} placeholder="Referral email" />
              </FormField>
              {leadForm.source === "Partner Portal" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Partner Name">
                      <Input value={leadForm.partnerName || ""} onChange={e => upd("partnerName", e.target.value)} placeholder="Partner name" />
                    </FormField>
                    <FormField label="Partner ID">
                      <Input value={leadForm.partnerId || ""} onChange={e => upd("partnerId", e.target.value)} placeholder="Partner ID" />
                    </FormField>
                  </div>
                </>
              )}
              <FormField label="Mark as Duplicate">
                <select
                  value={leadForm.isDuplicate ? "Yes" : "No"}
                  onChange={e => setLeadForm((p: any) => ({ ...p, isDuplicate: e.target.value === "Yes" }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes - Mark as Duplicate</option>
                </select>
              </FormField>
            </div>
          )}

          {addLeadTab === "notes" && (
            <div className="space-y-4">
              <FormField label="Notes">
                <Textarea
                  value={leadForm.notes || ""}
                  onChange={e => upd("notes", e.target.value)}
                  rows={6}
                  placeholder="Add any notes about this lead…"
                />
              </FormField>
              <FormField label="Scheduled At">
                <Input
                  type="datetime-local"
                  value={leadForm.scheduledAt || ""}
                  onChange={e => upd("scheduledAt", e.target.value)}
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map((tab, i) => (
              <div
                key={tab.id}
                className={`w-2 h-2 rounded-full transition-colors ${addLeadTab === tab.id ? "bg-blue-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={savingLead || !leadForm.clientName || !leadForm.phone}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingLead ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Projects View (Super Admin) ─────────────────────────────────────────────

const EMPTY_PROJECT_FORM = {
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

const PROJECT_STATUS_OPTIONS = ['Pre-Launch', 'Just Launched', 'Under Construction', 'Ready to Move']
const PROJECT_TYPE_OPTIONS = ['Apartment', 'Villa', 'Plots', 'Farmland', 'Townhouse', 'Villament', 'Commercial']
const CITY_OPTIONS = ['Bangalore', 'Dubai']

function ProjectsView({ projects, loading, onRefresh, onUpdate, onDelete, onCreate }: {
  projects: any[]; loading: boolean; onRefresh: () => void
  onUpdate: (id: number, data: any) => Promise<any>
  onDelete: (id: number) => Promise<any>
  onCreate: (data: any) => Promise<any>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY_PROJECT_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterCity, setFilterCity] = useState('All')

  function openAdd() { setForm({ ...EMPTY_PROJECT_FORM }); setEditingProject(null); setShowForm(true) }
  function openEdit(p: any) {
    setForm({
      name: p.name || '', developer: p.developer || '', city: p.city || 'Bangalore',
      location: p.location || '', projectType: p.projectType || 'Apartment',
      status: p.status || 'Pre-Launch', currency: p.currency || 'INR',
      minPrice: p.minPrice || '', maxPrice: p.maxPrice || '',
      coverImage: p.coverImage || '', description: p.description || '',
      highlights: p.highlights || '', amenities: p.amenities || '',
      possessionDate: p.possessionDate || '', reraNumber: p.reraNumber || '',
      numUnits: p.numUnits || '', isFeatured: p.isFeatured || false, isActive: p.isActive !== false,
      // Payment plan
      paymentPlanBooking: p.paymentPlanBooking ?? '',
      paymentPlanConstruction: p.paymentPlanConstruction ?? '',
      paymentPlanPossession: p.paymentPlanPossession ?? '',
      paymentPlanNote: p.paymentPlanNote || '',
      paymentPlanEmi: p.paymentPlanEmi || false,
      // Developer info
      developerDescription: p.developerDescription || '',
      developerLogo: p.developerLogo || '',
      developerFounded: p.developerFounded || '',
      developerProjectsCount: p.developerProjectsCount ?? '',
      developerWebsite: p.developerWebsite || '',
      // Content (JSON)
      floorPlans: p.floorPlans || '',
      nearbyLocations: p.nearbyLocations || '',
    })
    setEditingProject(p)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.city) return
    setSaving(true)
    const payload = {
      ...form,
      minPrice: form.minPrice ? Number(form.minPrice) : null,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
      numUnits: form.numUnits ? Number(form.numUnits) : null,
      paymentPlanBooking: form.paymentPlanBooking !== '' ? Number(form.paymentPlanBooking) : null,
      paymentPlanConstruction: form.paymentPlanConstruction !== '' ? Number(form.paymentPlanConstruction) : null,
      paymentPlanPossession: form.paymentPlanPossession !== '' ? Number(form.paymentPlanPossession) : null,
      developerProjectsCount: form.developerProjectsCount !== '' ? Number(form.developerProjectsCount) : null,
    }
    try {
      if (editingProject) {
        await onUpdate(editingProject.id, payload)
      } else {
        await onCreate(payload)
      }
      setShowForm(false)
    } catch {}
    setSaving(false)
  }

  const filtered = projects.filter(p => {
    if (filterActive === 'active' && !p.isActive) return false
    if (filterActive === 'inactive' && p.isActive) return false
    if (filterCity !== 'All' && p.city !== filterCity) return false
    return true
  })

  const fmtPrice = (p: any) => {
    if (!p.minPrice) return '—'
    if (p.currency === 'AED') return `AED ${(p.minPrice / 1000000).toFixed(1)}M`
    if (p.minPrice >= 10000000) return `₹${(p.minPrice / 10000000).toFixed(1)} Cr`
    return `₹${(p.minPrice / 100000).toFixed(0)} L`
  }

  const STATUS_CHIP: Record<string, string> = {
    'Pre-Launch': 'bg-amber-100 text-amber-700',
    'Just Launched': 'bg-purple-100 text-purple-700',
    'Under Construction': 'bg-blue-100 text-blue-700',
    'Ready to Move': 'bg-green-100 text-green-700',
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button key={f} onClick={() => setFilterActive(f)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${filterActive === f ? 'bg-[#422D83] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            {['All', 'Bangalore', 'Dubai'].map(c => (
              <button key={c} onClick={() => setFilterCity(c)}
                className={`px-3 py-1 rounded-md font-medium transition ${filterCity === c ? 'bg-[#422D83] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {c}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} projects</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#422D83] hover:bg-[#2d1a60] text-white text-sm font-medium px-4 py-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Project" to add your first listing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Project</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">City</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Price from</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Featured</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Live</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt="" className="w-10 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.developer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600">{p.city}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{p.projectType}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CHIP[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-700">{fmtPrice(p)}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onUpdate(p.id, { isFeatured: !p.isFeatured })}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${p.isFeatured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {p.isFeatured ? '★ Yes' : '☆ No'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onUpdate(p.id, { isActive: !p.isActive })}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${p.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                      {p.isActive ? 'Live' : 'Off'}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-blue-600 transition" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { onDelete(p.id); setDeleteConfirm(null) }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Project Name *</label>
                  <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sobha City" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Developer</label>
                  <input value={form.developer} onChange={e => setForm((f: any) => ({ ...f, developer: e.target.value }))}
                    placeholder="e.g. Sobha Limited" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                  <select value={form.city} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value, currency: e.target.value === 'Dubai' ? 'AED' : 'INR' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {CITY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location / Micro-market</label>
                  <input value={form.location} onChange={e => setForm((f: any) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Devanahalli, North Bangalore" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Property Type</label>
                  <select value={form.projectType} onChange={e => setForm((f: any) => ({ ...f, projectType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {PROJECT_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {PROJECT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm((f: any) => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    <option>INR</option><option>AED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Total Units</label>
                  <input type="number" value={form.numUnits} onChange={e => setForm((f: any) => ({ ...f, numUnits: e.target.value }))}
                    placeholder="e.g. 500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Min Price ({form.currency})</label>
                  <input type="number" value={form.minPrice} onChange={e => setForm((f: any) => ({ ...f, minPrice: e.target.value }))}
                    placeholder={form.currency === 'AED' ? 'e.g. 1500000' : 'e.g. 7500000'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Max Price ({form.currency})</label>
                  <input type="number" value={form.maxPrice} onChange={e => setForm((f: any) => ({ ...f, maxPrice: e.target.value }))}
                    placeholder={form.currency === 'AED' ? 'e.g. 8000000' : 'e.g. 25000000'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Possession Date</label>
                  <input value={form.possessionDate} onChange={e => setForm((f: any) => ({ ...f, possessionDate: e.target.value }))}
                    placeholder="e.g. December 2027" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">RERA Number</label>
                  <input value={form.reraNumber} onChange={e => setForm((f: any) => ({ ...f, reraNumber: e.target.value }))}
                    placeholder="RERA / Applied / NA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Cover Image URL</label>
                  <input value={form.coverImage} onChange={e => setForm((f: any) => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                  {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" />}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Brief description of the project..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Highlights <span className="font-normal text-gray-400">(separate with |)</span></label>
                  <input value={form.highlights} onChange={e => setForm((f: any) => ({ ...f, highlights: e.target.value }))}
                    placeholder="Near Metro|Premium Location|RERA Registered" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Amenities <span className="font-normal text-gray-400">(separate with |)</span></label>
                  <input value={form.amenities} onChange={e => setForm((f: any) => ({ ...f, amenities: e.target.value }))}
                    placeholder="Clubhouse|Swimming Pool|Gym|Children Play Area" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-[#422D83]" />
                    <span className="text-sm text-gray-700">Featured on homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-700">Live on website</span>
                  </label>
                </div>

                {/* ── PAYMENT PLAN ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">💰 Payment Plan</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Booking %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanBooking}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanBooking: e.target.value }))}
                        placeholder="e.g. 20" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Construction %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanConstruction}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanConstruction: e.target.value }))}
                        placeholder="e.g. 60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Possession %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanPossession}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanPossession: e.target.value }))}
                        placeholder="e.g. 20" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                  </div>
                  <input value={form.paymentPlanNote}
                    onChange={e => setForm((f: any) => ({ ...f, paymentPlanNote: e.target.value }))}
                    placeholder="Payment plan note (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 mb-2" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.paymentPlanEmi} onChange={e => setForm((f: any) => ({ ...f, paymentPlanEmi: e.target.checked }))} className="w-4 h-4 accent-[#422D83]" />
                    <span className="text-sm text-gray-700">EMI Available</span>
                  </label>
                </div>

                {/* ── DEVELOPER INFO ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🏢 Developer Info</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Founded Year</label>
                      <input value={form.developerFounded}
                        onChange={e => setForm((f: any) => ({ ...f, developerFounded: e.target.value }))}
                        placeholder="e.g. 1995" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Projects Delivered</label>
                      <input type="number" value={form.developerProjectsCount}
                        onChange={e => setForm((f: any) => ({ ...f, developerProjectsCount: e.target.value }))}
                        placeholder="e.g. 45" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input value={form.developerLogo}
                      onChange={e => setForm((f: any) => ({ ...f, developerLogo: e.target.value }))}
                      placeholder="Developer Logo URL (https://...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    <input value={form.developerWebsite}
                      onChange={e => setForm((f: any) => ({ ...f, developerWebsite: e.target.value }))}
                      placeholder="Developer Website (https://...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    <textarea value={form.developerDescription}
                      onChange={e => setForm((f: any) => ({ ...f, developerDescription: e.target.value }))}
                      rows={3} placeholder="Brief description of the developer..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                  </div>
                </div>

                {/* ── FLOOR PLANS (JSON) ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">📐 Floor Plans <span className="font-normal normal-case text-gray-400">(JSON array)</span></p>
                  <p className="text-xs text-gray-400 mb-2">Format: {`[{"name":"2BHK Type A","bedrooms":2,"size_sqft":1250,"price_from":8500000,"image_url":"https://..."}]`}</p>
                  <textarea value={form.floorPlans}
                    onChange={e => setForm((f: any) => ({ ...f, floorPlans: e.target.value }))}
                    rows={3} placeholder='[{"name":"2BHK","bedrooms":2,"size_sqft":1200,"price_from":8000000}]'
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>

                {/* ── NEARBY LOCATIONS (JSON) ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">📍 Nearby Locations <span className="font-normal normal-case text-gray-400">(JSON array)</span></p>
                  <p className="text-xs text-gray-400 mb-2">Categories: Airport | Metro | School | Hospital | Mall | IT Park | Beach | Park. Format: {`[{"name":"Kempegowda Airport","distance_km":8,"category":"Airport","travel_mins":15}]`}</p>
                  <textarea value={form.nearbyLocations}
                    onChange={e => setForm((f: any) => ({ ...f, nearbyLocations: e.target.value }))}
                    rows={3} placeholder='[{"name":"Metro Station","distance_km":1.2,"category":"Metro","travel_mins":5}]'
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>

              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.city}
                className="px-6 py-2 text-sm bg-[#422D83] hover:bg-[#2d1a60] text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingProject ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pipeline Kanban View ────────────────────────────────────────────────────

const PIPELINE_STAGES = ['New','Callback','Meeting','Site Visit','Expression of Interest','Booked','Not Interested','Dropped']

const STAGE_COL_COLORS: Record<string, string> = {
  New: 'border-t-blue-400',
  Callback: 'border-t-amber-400',
  Meeting: 'border-t-indigo-400',
  'Site Visit': 'border-t-purple-400',
  'Expression of Interest': 'border-t-orange-400',
  Booked: 'border-t-violet-600',
  'Not Interested': 'border-t-gray-300',
  Dropped: 'border-t-red-400',
}

function PipelineView({ leads, onStatusChange }: { leads: Lead[]; onStatusChange: (leadId: string, status: string) => void }) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDragging(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: React.DragEvent, stage: string) {
    e.preventDefault()
    if (dragging) onStatusChange(dragging, stage)
    setDragging(null)
    setDragOver(null)
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault()
    setDragOver(stage)
  }

  const byStage: Record<string, Lead[]> = {}
  PIPELINE_STAGES.forEach(s => { byStage[s] = leads.filter(l => l.status === s) })

  return (
    <div className="h-full overflow-x-auto bg-gray-50">
      <div className="flex gap-3 h-full p-4 min-w-max">
        {PIPELINE_STAGES.map(stage => (
          <div
            key={stage}
            onDragOver={e => handleDragOver(e, stage)}
            onDrop={e => handleDrop(e, stage)}
            onDragLeave={() => setDragOver(null)}
            className={`w-52 flex-shrink-0 flex flex-col rounded-xl border border-gray-200 border-t-4 ${STAGE_COL_COLORS[stage]} bg-white shadow-sm ${dragOver === stage ? 'bg-blue-50' : ''}`}
          >
            <div className="px-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 truncate">{stage}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">{byStage[stage].length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {byStage[stage].map(lead => (
                <div
                  key={lead.leadId}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.leadId)}
                  className={`bg-white border border-gray-200 rounded-lg p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow text-xs ${dragging === lead.leadId ? 'opacity-50' : ''}`}
                >
                  <p className="font-semibold text-gray-800 truncate">{lead.clientName || 'Unknown'}</p>
                  <p className="text-gray-400 truncate mt-0.5">{lead.phone}</p>
                  {lead.budget && <p className="text-[#422D83] font-medium mt-1">{lead.budget}</p>}
                  <div className="flex items-center justify-between mt-1.5 gap-1">
                    {lead.assignedRM ? <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full truncate">{lead.assignedRM}</span> : <span />}
                    {lead.city && <span className="text-gray-400">{lead.city}</span>}
                  </div>
                </div>
              ))}
              {byStage[stage].length === 0 && (
                <div className="text-center py-6 text-gray-300 text-xs">Drop here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Blog View ───────────────────────────────────────────────────────────────

function BlogView() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'General', tags: '', author_name: '', cover_image: '', reading_time: 5, status: 'draft' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const CATEGORIES = ['General', 'Investment Guide', 'Market Trends', 'NRI Investment', 'Bangalore', 'Dubai', 'Legal & Finance']

  async function loadPosts() {
    setLoading(true)
    const res = await fetch('/api/crm/blog')
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  function openNew() {
    setEditing(null)
    setForm({ title: '', excerpt: '', content: '', category: 'General', tags: '', author_name: '', cover_image: '', reading_time: 5, status: 'draft' })
    setShowForm(true)
  }

  function openEdit(post: any) {
    setEditing(post)
    setForm({ title: post.title, excerpt: post.excerpt || '', content: post.content || '', category: post.category || 'General', tags: post.tags || '', author_name: post.author_name || '', cover_image: post.cover_image || '', reading_time: post.reading_time || 5, status: post.status || 'draft' })
    setShowForm(true)
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/crm/blog/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/crm/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowForm(false)
    loadPosts()
  }

  async function deletePost(id: number) {
    if (!confirm('Delete this post permanently?')) return
    setDeletingId(id)
    await fetch(`/api/crm/blog/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    loadPosts()
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Blog Management</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No blog posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Author</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-xs">{post.title}</p>
                    <p className="text-xs text-gray-400">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{post.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{post.author_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(post)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePost(post.id)} disabled={deletingId === post.id} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="Post title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400" placeholder="Post content (markdown supported)..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                  <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="PropSarathi Team" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
                  <input type="number" value={form.reading_time} min={1} onChange={e => setForm(f => ({ ...f, reading_time: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="bangalore, investment, pre-launch" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={save} disabled={saving || !form.title} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reports View ────────────────────────────────────────────────────────────

function ReportsView({ leads }: { leads: Lead[] }) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay())

  const leadsThisMonth = leads.filter(l => new Date(l.createdAt) >= startOfMonth)
  const leadsThisWeek = leads.filter(l => new Date(l.createdAt) >= startOfWeek)

  const byStatus = PIPELINE_STAGES.map(s => ({ name: s === 'Expression of Interest' ? 'EOI' : s, count: leads.filter(l => l.status === s).length })).filter(s => s.count > 0)

  const rmMap: Record<string, number> = {}
  leads.forEach(l => { const rm = l.assignedRM || 'Unassigned'; rmMap[rm] = (rmMap[rm] || 0) + 1 })
  const byRM = Object.entries(rmMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))

  const srcMap: Record<string, number> = {}
  leads.forEach(l => { const s = l.source || 'Unknown'; srcMap[s] = (srcMap[s] || 0) + 1 })
  const bySource = Object.entries(srcMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))

  const PURPLE = ['#422D83','#5b40b0','#7d65cc','#9e8ada','#c0b4e9']

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Leads', val: leads.length, bg: 'bg-[#422D83]' },
          { label: 'This Month', val: leadsThisMonth.length, bg: 'bg-indigo-500' },
          { label: 'This Week', val: leadsThisWeek.length, bg: 'bg-blue-500' },
          { label: 'Booked', val: leads.filter(l => l.status === 'Booked').length, bg: 'bg-violet-600' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 text-white ${c.bg}`}>
            <p className="text-2xl font-bold">{c.val}</p>
            <p className="text-xs opacity-80 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} />
              <Bar dataKey="count" radius={[0,4,4,0]}>
                {byStatus.map((_, i) => <Cell key={i} fill={PURPLE[i % PURPLE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by RM</h3>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {byRM.map(r => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 truncate">{r.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#422D83] rounded-full" style={{ width: `${Math.round(r.count / (byRM[0]?.count || 1) * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-5 text-right">{r.count}</span>
              </div>
            ))}
            {byRM.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bySource} margin={{ left: 0, right: 16, bottom: 48 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {bySource.map((_, i) => <Cell key={i} fill={PURPLE[i % PURPLE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Conversion by RM</h3>
          <div className="space-y-2.5">
            {byRM.map(r => {
              const booked = leads.filter(l => l.assignedRM === r.name && l.status === 'Booked').length
              const pct = r.count > 0 ? Math.round(booked / r.count * 100) : 0
              return (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-28 truncate">{r.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{booked}/{r.count}</span>
                </div>
              )
            })}
            {byRM.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
