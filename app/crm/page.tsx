"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  LayoutDashboard, Users, Database, ChevronLeft, ChevronDown, ChevronRight,
  Plus, Search, LogOut, X,
  MapPin, Loader2, Building2, User, Menu, Home,
  XCircle, Activity, BarChart3,
  RefreshCw, Layers, BookOpen,
} from "lucide-react"
import MapEditor from "@/components/MapEditor"
import { LogoCompact } from "@/components/Logo"
import type { Lead, DataRecord, HistoryEntry, CRMUser } from './types'
import { EMPTY_LEAD_FORM, SOURCE_OPTIONS } from './constants'
import { FormField, Input, Select, Textarea } from './components/shared'
import { DashboardView } from './components/DashboardView'
import { LeadsView } from './components/LeadsView'
import { LeadModal } from './components/LeadModal'
import { PipelineView } from './components/PipelineView'
import { ReportsView } from './components/ReportsView'
import { DataView } from './components/DataView'
import { ProjectsView } from './components/ProjectsView'
import { BlogView } from './components/BlogView'
import { TeamView } from './components/TeamView'
import { EnquiriesView } from './components/EnquiriesView'
import { ListingsView } from './components/ListingsView'
import { PropertiesView } from './components/PropertiesView'
import { CRMProjectsBrochure } from './components/CRMProjectsBrochure'

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
  const [view, setView] = useState<"dashboard" | "leads" | "pipeline" | "reports" | "data" | "projects" | "map" | "blog" | "clients" | "referrals" | "team" | "enquiries" | "listings" | "properties">("dashboard")
  const [leadsExpanded, setLeadsExpanded] = useState(true)
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

  // ── v2 leads + dashboard ──
  const [v2Leads, setV2Leads] = useState<any[]>([])
  const [v2Dashboard, setV2Dashboard] = useState<any>(null)

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
    if (view === "projects") {
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
      const [leadsRes, dataRes, statsRes, v2Res, dashRes] = await Promise.all([
        fetch("/api/crm/leads"),
        fetch("/api/crm/data"),
        fetch("/api/crm/stats"),
        fetch("/api/crm/v2/leads?limit=200"),
        fetch("/api/crm/v2/dashboard"),
      ])
      const [ld, dd, sd, v2d, dashd] = await Promise.all([
        leadsRes.json(), dataRes.json(), statsRes.json(), v2Res.json(), dashRes.json(),
      ])
      if (ld.success) setLeads(ld.leads || [])
      if (dd.success) setDataRecords(dd.records || [])
      if (sd.success) setStats(sd.stats)
      if (v2d.leads) setV2Leads(v2d.leads)
      if (dashd.success) setV2Dashboard(dashd)
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
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">

          {/* Dashboard */}
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "dashboard" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Dashboard</span>}
          </button>

          {/* Leads parent */}
          <button
            onClick={() => { setView("leads"); setLeadsExpanded(p => !p) }}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${["leads","enquiries","listings"].includes(view) ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">Leads</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${["leads","enquiries","listings"].includes(view) ? "bg-white/20" : "bg-white/10"}`}>
                  {v2Leads.filter((l: any) => !l.is_deleted).length}
                </span>
                {leadsExpanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 ml-1" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 ml-1" />}
              </>
            )}
          </button>

          {/* Sub-items: Enquiries + Listings */}
          {sidebarOpen && leadsExpanded && (
            <>
              <button
                onClick={() => setView("enquiries")}
                className={`w-full flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors ${view === "enquiries" ? "bg-[#422D83] text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                <span>Enquiries</span>
              </button>
              <button
                onClick={() => setView("listings")}
                className={`w-full flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors ${view === "listings" ? "bg-[#422D83] text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                <span>Listings</span>
              </button>
            </>
          )}

          {/* Pipeline */}
          <button
            onClick={() => setView("pipeline")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "pipeline" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <Layers className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Pipeline</span>}
          </button>

          {/* Properties (all users) */}
          <button
            onClick={() => setView("properties")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "properties" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Properties</span>}
          </button>

          {/* Projects (all users) */}
          <button
            onClick={() => setView("projects")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "projects" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <Building2 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">Projects</span>
                {crmProjects.filter((p: any) => p.isActive).length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === "projects" ? "bg-white/20" : "bg-white/10"}`}>
                    {crmProjects.filter((p: any) => p.isActive).length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Reports */}
          <button
            onClick={() => setView("reports")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "reports" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Reports</span>}
          </button>

          {/* Data */}
          <button
            onClick={() => setView("data")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "data" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">Data</span>
                {dataRecords.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === "data" ? "bg-white/20" : "bg-white/10"}`}>
                    {dataRecords.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Admin-only items */}
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setView("clients")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "clients" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">Clients</span>}
              </button>
              <button
                onClick={() => setView("referrals")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "referrals" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
              >
                <Activity className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">Referrals</span>}
              </button>
              <button
                onClick={() => setView("blog")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "blog" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">Blog</span>}
              </button>
              <button
                onClick={() => setView("team")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "team" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">Team</span>}
              </button>
            </>
          )}

          {/* Map */}
          <button
            onClick={() => setView("map")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${view === "map" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"} ${!sidebarOpen && "justify-center"}`}
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">Map</span>}
          </button>

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
            {view !== "leads" && (
              <>
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
                  onClick={() => {
                    if (view === "data") setShowAddData(true)
                    else openAddLead()
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {view === "data" ? "Add Data" : "Add Lead"}
                </button>
              </>
            )}
            <button onClick={loadAll} className="text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "dashboard" && (
            <DashboardView stats={stats} loading={loading} leads={leads} onNavigate={setView} v2Dashboard={v2Dashboard} />
          )}
          {view === "leads" && (
            <LeadsView v2Leads={v2Leads} user={user} onReload={loadAll} />
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
          {view === "enquiries" && <EnquiriesView user={user} />}
          {view === "listings" && <ListingsView user={user} />}
          {view === "properties" && <PropertiesView user={user} />}
          {view === "projects" && (
            user?.role === "admin"
              ? (
                <ProjectsView
                  projects={crmProjects}
                  loading={projectsLoading}
                  onRefresh={loadProjects}
                  onUpdate={(id: number, data: any) => fetch(`/api/crm/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(loadProjects)}
                  onDelete={(id: number) => fetch(`/api/crm/projects/${id}`, { method: 'DELETE' }).then(loadProjects)}
                  onCreate={(data: any) => fetch('/api/crm/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(loadProjects)}
                />
              )
              : <CRMProjectsBrochure user={user} />
          )}
          {view === "blog" && user?.role === "admin" && (
            <BlogView />
          )}
          {view === "team" && user?.role === "admin" && (
            <TeamView user={user} />
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
