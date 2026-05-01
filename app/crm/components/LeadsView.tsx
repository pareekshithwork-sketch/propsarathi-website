'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Users, Phone, MessageCircle, Mail, RefreshCw, Plus, Search,
  X, Check, Loader2, MoreHorizontal, Trash2, Calendar, FileText,
  Activity, TrendingUp, Building2, Filter, Pencil, ChevronRight, ChevronDown,
  SlidersHorizontal, MapPin, Home,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_TABS = [
  { id: 'All', label: 'All Active' },
  { id: 'New', label: 'New' },
  { id: 'Callback', label: 'Callback' },
  { id: 'Schedule Meeting', label: 'Meeting' },
  { id: 'Schedule Site Visit', label: 'Site Visit' },
  { id: 'Expression Of Interest', label: 'EOI' },
  { id: 'Book', label: 'Booked' },
  { id: 'Not Interested', label: 'Not Interested' },
  { id: 'Drop', label: 'Drop' },
]

const STAGE_ACTIONS = [
  { label: 'Callback', apiStage: 'Callback', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Meeting', apiStage: 'Schedule Meeting', color: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200' },
  { label: 'Site Visit', apiStage: 'Schedule Site Visit', color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
  { label: 'EOI', apiStage: 'Expression Of Interest', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Book', apiStage: 'Book', color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
  { label: 'Not Interested', apiStage: 'Not Interested', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Drop', apiStage: 'Drop', color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
]

const SUB_STAGES: Record<string, string[]> = {
  'Callback': ['Follow Up', 'Future Prospect/Project', 'Not Reachable', 'Busy', 'To Schedule A Meeting', 'Not Answered', 'Need More Info', 'To Schedule Site Visit', 'Plan Postponed'],
  'Schedule Meeting': ['On Call', 'In Person', 'Others', 'Online'],
  'Schedule Site Visit': ['Revisit', 'First Visit'],
  'Expression Of Interest': ['Given EOI'],
  'Not Interested': ['Different Location', 'Different Requirements', 'Unmatched Budget'],
  'Drop': ['Not Enquired', 'Wrong/Invalid No', 'Ringing Not Received', 'Not Looking', 'Purchased From Others'],
}

const STAGE_BADGE: Record<string, string> = {
  'New': 'bg-gray-100 text-gray-600',
  'Callback': 'bg-blue-100 text-blue-700',
  'Schedule Meeting': 'bg-violet-100 text-violet-700',
  'Schedule Site Visit': 'bg-cyan-100 text-cyan-700',
  'Expression Of Interest': 'bg-amber-100 text-amber-700',
  'Book': 'bg-green-100 text-green-700',
  'Not Interested': 'bg-orange-100 text-orange-700',
  'Drop': 'bg-red-100 text-red-700',
}

const STAGE_LABEL: Record<string, string> = {
  'Schedule Meeting': 'Meeting',
  'Schedule Site Visit': 'Site Visit',
  'Expression Of Interest': 'EOI',
  'Book': 'Booked',
}

const TAG_COLORS: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700',
  Warm: 'bg-orange-100 text-orange-700',
  Cold: 'bg-blue-100 text-blue-700',
  Escalated: 'bg-purple-100 text-purple-700',
  Highlighted: 'bg-yellow-100 text-yellow-700',
}

const TAG_PILL_COLORS: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700 border-red-200',
  Warm: 'bg-orange-100 text-orange-700 border-orange-200',
  Cold: 'bg-blue-100 text-blue-700 border-blue-200',
  Escalated: 'bg-purple-100 text-purple-700 border-purple-200',
  Highlighted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  lead_created: Users,
  stage_change: TrendingUp,
  note_added: FileText,
  enquiry_added: Building2,
  lead_assigned: Activity,
}

const ACTIVITY_COLORS: Record<string, string> = {
  lead_created: 'bg-blue-100 text-blue-600',
  stage_change: 'bg-violet-100 text-violet-600',
  note_added: 'bg-yellow-100 text-yellow-600',
  enquiry_added: 'bg-green-100 text-green-600',
  lead_assigned: 'bg-gray-100 text-gray-600',
}

const SOURCES_V2 = ['Direct', 'Website', 'Referral', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'Affiliate', 'Other']
const PROPERTY_TYPES_V2 = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Other']
const PURPOSE_OPTIONS_V2 = ['Investment', 'Self Use', 'Rental']
const TAG_OPTIONS_V2 = ['Hot', 'Warm', 'Cold', 'Escalated', 'Highlighted']
const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4+']
const LEAD_TYPES = ['Buyer', 'Seller', 'Both']

const DATE_TYPE_OPTIONS = [
  { id: 'updated_at',          label: 'Modified Date' },
  { id: 'created_at',          label: 'Created Date' },
  { id: 'latest_scheduled_at', label: 'Scheduled Date' },
  { id: 'deleted_at',          label: 'Deleted Date' },
]

const DATE_FIELD_MAP: Record<string, string> = {
  updated_at:          'updated_at',
  created_at:          'created_at',
  latest_scheduled_at: 'latest_scheduled_at',
  deleted_at:          'deleted_at',
}

const SEARCH_FIELD_OPTIONS = [
  { id: 'name',              label: 'Lead Name',            defaultOn: true },
  { id: 'phone',             label: 'Contact No',           defaultOn: true },
  { id: 'alternate_phone',   label: 'Alternate Contact No', defaultOn: false },
  { id: 'email',             label: 'Email',                defaultOn: false },
  { id: 'sub_source',        label: 'Sub Source',           defaultOn: false },
  { id: 'source',            label: 'Source',               defaultOn: false },
  { id: 'customer_location', label: 'Location',             defaultOn: false },
  { id: 'referral_phone',    label: 'Referral Contact No',  defaultOn: false },
]

const COLUMNS_CONFIG = [
  { id: 'modified',             label: 'Assigned / Modified', defaultOn: true },
  { id: 'phone',                label: 'Phone',               defaultOn: true },
  { id: 'last_note',            label: 'Notes',               defaultOn: true },
  { id: 'source',               label: 'Source',              defaultOn: true },
  { id: 'status',               label: 'Status',              defaultOn: true },
  { id: 'created_at',           label: 'Created Date',        defaultOn: false },
  { id: 'latest_scheduled_at',  label: 'Scheduled Date',      defaultOn: false },
  { id: 'email',                label: 'Email',               defaultOn: false },
  { id: 'customer_location',    label: 'Location',            defaultOn: false },
  { id: 'lead_type',            label: 'Lead Type',           defaultOn: false },
  { id: 'active_enquiry_count', label: 'Enquiries #',         defaultOn: false },
]

const DEFAULT_VISIBLE_COLUMNS = new Set(COLUMNS_CONFIG.filter(c => c.defaultOn).map(c => c.id))

type FilterState = {
  sources: string[]
  leadType: string
  assignedTo: string
  tags: string[]
}

const EMPTY_FILTERS: FilterState = { sources: [], leadType: '', assignedTo: '', tags: [] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch { return String(d) }
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMin < 2) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

function stageBadgeCls(stage: string | null | undefined): string {
  if (!stage) return 'bg-gray-100 text-gray-500'
  return STAGE_BADGE[stage] || 'bg-gray-100 text-gray-600'
}

function stageDisplayLabel(stage: string | null | undefined): string {
  if (!stage) return 'No enquiry'
  return STAGE_LABEL[stage] || stage
}

function leadScore(stage: string | null | undefined): { label: string; cls: string } {
  if (!stage || stage === 'New') return { label: 'Cold', cls: 'bg-blue-100 text-blue-700' }
  if (stage === 'Callback') return { label: 'Warm', cls: 'bg-orange-100 text-orange-700' }
  if (stage === 'Schedule Meeting' || stage === 'Schedule Site Visit') return { label: 'Hot', cls: 'bg-red-100 text-red-700' }
  if (stage === 'Expression Of Interest' || stage === 'Book') return { label: 'Very Hot', cls: 'bg-purple-100 text-purple-700' }
  return { label: 'Cold', cls: 'bg-blue-100 text-blue-700' }
}

// ─── Main LeadsView ────────────────────────────────────────────────────────────

export function LeadsView({ v2Leads, user, onReload }: {
  v2Leads: any[]
  user: any
  onReload: () => void
}) {
  // ── List filters ──
  const [stageTab, setStageTab] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateType, setDateType] = useState('updated_at')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS)

  // ── Search fields ──
  const [searchFields, setSearchFields] = useState<string[]>(['name', 'phone'])
  const [showSearchFields, setShowSearchFields] = useState(false)

  // ── Column visibility ──
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('crm_lead_columns_v1') : null
      if (saved) return new Set(JSON.parse(saved))
    } catch {}
    return new Set(DEFAULT_VISIBLE_COLUMNS)
  })
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const searchFieldsRef = useRef<HTMLDivElement>(null)
  const columnPickerRef = useRef<HTMLDivElement>(null)

  // ── Bulk selection ──
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  // ── RMs ──
  const [rms, setRms] = useState<any[]>([])

  // ── Panel (row highlighting only) ──
  const [selectedLead, setSelectedLead] = useState<any>(null)

  // ── Profile side panel ──
  const [profileLead, setProfileLead] = useState<any>(null)
  const [profileDetail, setProfileDetail] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Add Lead modal ──
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)

  // ── Toast ──
  const [toast, setToast] = useState('')

  // (enquiry form state lives inside EnquiriesTab)

  // ── View mode ──
  const [viewMode, setViewMode] = useState<'people' | 'enquiry'>('people')
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set())
  const [expandedLeadData, setExpandedLeadData] = useState<Record<string, any[]>>({})
  const [enquiryViewData, setEnquiryViewData] = useState<any[]>([])
  const [enquiryViewLoading, setEnquiryViewLoading] = useState(false)

  // ── Outside-click: close dropdowns ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) setShowDatePicker(false)
      if (searchFieldsRef.current && !searchFieldsRef.current.contains(e.target as Node)) setShowSearchFields(false)
      if (columnPickerRef.current && !columnPickerRef.current.contains(e.target as Node)) setShowColumnPicker(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // ── Load RMs ──
  useEffect(() => {
    fetch('/api/crm/v2/users')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.users) setRms(d.users) })
      .catch(() => {})
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openFilters() {
    setPendingFilters({ ...filters })
    setShowFilters(true)
  }

  const activeFilterCount =
    (filters.sources.length > 0 ? 1 : 0) +
    (filters.leadType ? 1 : 0) +
    (filters.assignedTo ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0)

  const filteredLeads = useMemo(() => {
    const active = (v2Leads || []).filter((l: any) => !l.is_deleted)
    let result = active

    if (stageTab !== 'All') {
      result = result.filter((l: any) => {
        const stage = l.latest_enquiry_stage
        if (stageTab === 'New') return !stage || stage === 'New'
        return stage === stageTab
      })
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((l: any) =>
        searchFields.some(field => {
          const val = l[field]
          if (!val) return false
          return String(val).toLowerCase().includes(q)
        })
      )
    }

    if (filters.sources.length > 0) {
      result = result.filter((l: any) => filters.sources.includes(l.source))
    }
    if (filters.leadType) {
      result = result.filter((l: any) => l.lead_type === filters.leadType)
    }
    if (filters.assignedTo) {
      result = result.filter((l: any) => l.assigned_rm === filters.assignedTo)
    }
    if (filters.tags.length > 0) {
      result = result.filter((l: any) => {
        const leadTags = (l.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
        return filters.tags.some((t: string) => leadTags.includes(t))
      })
    }

    if (dateFrom || dateTo) {
      const fieldName = DATE_FIELD_MAP[dateType] || 'updated_at'
      result = result.filter((l: any) => {
        const raw = l[fieldName]
        if (!raw) return false
        const d = new Date(raw).getTime()
        if (dateFrom && d < new Date(dateFrom).getTime()) return false
        if (dateTo && d > new Date(dateTo + 'T23:59:59').getTime()) return false
        return true
      })
    }

    return [...result].sort((a, b) => {
      const fieldName = DATE_FIELD_MAP[dateType] || 'updated_at'
      const aT = a[fieldName] ? new Date(a[fieldName]).getTime() : 0
      const bT = b[fieldName] ? new Date(b[fieldName]).getTime() : 0
      return bT - aT
    })
  }, [v2Leads, stageTab, debouncedSearch, filters, dateType, dateFrom, dateTo, searchFields])

  const allSelected = filteredLeads.length > 0 && filteredLeads.every((l: any) => selectedLeadIds.has(l.lead_id))
  const someSelected = filteredLeads.some((l: any) => selectedLeadIds.has(l.lead_id))

  async function handleBulkAction(action: 'stage' | 'reassign' | 'delete', value: string) {
    if (!value) return
    const leadIds = Array.from(selectedLeadIds)
    setBulkLoading(true)
    try {
      const res = await fetch('/api/crm/v2/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, action, value }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedLeadIds(new Set())
        showToast(`${data.updated} lead${data.updated !== 1 ? 's' : ''} updated`)
        onReload()
      } else {
        showToast(data.error || 'Bulk action failed')
      }
    } catch {
      showToast('Error performing bulk action')
    }
    setBulkLoading(false)
    setShowBulkDeleteConfirm(false)
  }

  function selectLead(lead: any) {
    setSelectedLead(lead)
    setProfileLead(lead)
    setProfileDetail(null)
    setProfileLoading(true)
    fetch(`/api/crm/v2/leads/${lead.lead_id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setProfileDetail(data) })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }

  async function loadEnquiryView() {
    setEnquiryViewLoading(true)
    try {
      const res = await fetch('/api/crm/v2/enquiries?status=active&limit=500')
      const data = await res.json()
      if (data.success) setEnquiryViewData(data.enquiries || [])
    } catch {}
    setEnquiryViewLoading(false)
  }

  async function toggleExpand(e: React.MouseEvent, leadId: string) {
    e.stopPropagation()
    const next = new Set(expandedLeads)
    if (next.has(leadId)) {
      next.delete(leadId)
      setExpandedLeads(next)
      return
    }
    next.add(leadId)
    setExpandedLeads(next)
    if (!expandedLeadData[leadId]) {
      try {
        const res = await fetch(`/api/crm/v2/leads/${leadId}`)
        const data = await res.json()
        if (data.success) setExpandedLeadData(prev => ({ ...prev, [leadId]: data.enquiries || [] }))
      } catch {}
    }
  }

  function selectLeadById(leadId: string) {
    const lead = v2Leads.find((l: any) => l.lead_id === leadId)
    if (lead) selectLead(lead)
  }

  // ── Load enquiry view when mode changes ──
  useEffect(() => {
    if (viewMode === 'enquiry') loadEnquiryView()
  }, [viewMode])


  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Lead list ── */}
      <div className={`${profileLead ? 'w-[60%]' : 'flex-1'} flex flex-col bg-white overflow-hidden`}>

        {/* Top bar */}
        <div className="border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
          {/* People / Enquiries toggle */}
          <div className="flex-shrink-0 flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('people')}
              className={`text-xs px-3 py-1.5 transition-colors ${viewMode === 'people' ? 'bg-[#422D83] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              People
            </button>
            <button
              onClick={() => setViewMode('enquiry')}
              className={`text-xs px-3 py-1.5 border-l border-gray-300 transition-colors ${viewMode === 'enquiry' ? 'bg-[#422D83] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Enquiries
            </button>
          </div>
          <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide">
            {STAGE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStageTab(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  stageTab === tab.id
                    ? 'bg-[#422D83] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#422D83]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Search with field selector */}
          <div ref={searchFieldsRef} className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => { setShowDatePicker(false); setShowColumnPicker(false) }}
              className="pl-8 pr-7 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-36"
            />
            <button
              onClick={() => { setShowSearchFields(p => !p); setShowDatePicker(false); setShowColumnPicker(false) }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${showSearchFields ? 'text-[#422D83]' : 'text-gray-400 hover:text-gray-600'}`}
              title="Search fields"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Date type + range picker */}
          <div ref={datePickerRef} className="flex items-center flex-shrink-0 relative">
            <select
              value={dateType}
              onChange={e => { setDateType(e.target.value); setDateFrom(''); setDateTo('') }}
              className="text-xs border border-gray-300 rounded-l-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white text-gray-600 border-r-0"
            >
              {DATE_TYPE_OPTIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <button
              onClick={() => { setShowDatePicker(p => !p); setShowSearchFields(false); setShowColumnPicker(false) }}
              className={`text-xs px-2 py-1.5 border border-gray-300 rounded-r-lg flex items-center gap-1 transition-colors ${
                showDatePicker || dateFrom || dateTo
                  ? 'bg-[#422D83] text-white border-[#422D83]'
                  : 'bg-white text-gray-600 hover:border-[#422D83]'
              }`}
              title="Date range"
            >
              <Calendar className="w-3.5 h-3.5" />
              {(dateFrom || dateTo) && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
            </button>
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4 w-64">
                <p className="text-xs font-semibold text-gray-700 mb-3">Date Range Filter</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 text-xs py-1.5 bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b]"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); setShowDatePicker(false) }}
                    className="flex-1 text-xs py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manage Columns */}
          <div ref={columnPickerRef} className="relative flex-shrink-0">
            <button
              onClick={() => { setShowColumnPicker(p => !p); setShowDatePicker(false); setShowSearchFields(false) }}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                showColumnPicker ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Columns
            </button>
            {showColumnPicker && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4 w-60">
                <p className="text-xs font-semibold text-gray-700 mb-2">Visible Columns</p>
                <div className="flex items-center gap-2 opacity-40 mb-1 px-1">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <span className="text-xs text-gray-700">Lead Name (always visible)</span>
                </div>
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {COLUMNS_CONFIG.map(col => (
                    <label key={col.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.id)}
                        onChange={e => {
                          const next = new Set(visibleColumns)
                          if (e.target.checked) next.add(col.id)
                          else next.delete(col.id)
                          setVisibleColumns(next)
                          try { localStorage.setItem('crm_lead_columns_v1', JSON.stringify([...next])) } catch {}
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-700">{col.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setVisibleColumns(new Set(DEFAULT_VISIBLE_COLUMNS))
                    try { localStorage.removeItem('crm_lead_columns_v1') } catch {}
                  }}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 w-full text-left px-1"
                >
                  Reset to defaults
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => showFilters ? setShowFilters(false) : openFilters()}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#422D83] text-white border-[#422D83]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setEditingLead(null); setShowAddLead(true) }}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </button>
          <button onClick={onReload} className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search fields panel */}
        {showSearchFields && (
          <div className="border-b border-gray-200 px-3 py-3 bg-gray-50 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search In</p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_FIELD_OPTIONS.map(f => {
                const isOn = searchFields.includes(f.id)
                return (
                  <button
                    key={f.id}
                    onClick={() => setSearchFields(prev =>
                      isOn ? prev.filter(x => x !== f.id) : [...prev, f.id]
                    )}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      isOn ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                    }`}
                  >
                    {f.label}
                    {isOn && ' ×'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters panel */}
        {showFilters && (
          <div className="border-b border-gray-200 px-3 py-3 bg-gray-50 flex-shrink-0 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Source</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {['Direct', 'Website', 'Referral', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'Affiliate'].map(s => (
                    <label key={s} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingFilters.sources.includes(s)}
                        onChange={e => setPendingFilters(p => ({
                          ...p,
                          sources: e.target.checked ? [...p.sources, s] : p.sources.filter(x => x !== s),
                        }))}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-600">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lead Type</p>
                  <div className="flex gap-1.5">
                    {['Buyer', 'Seller', 'Both'].map(t => (
                      <button
                        key={t}
                        onClick={() => setPendingFilters(p => ({ ...p, leadType: p.leadType === t ? '' : t }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          pendingFilters.leadType === t
                            ? 'bg-[#422D83] text-white border-[#422D83]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Assigned To</p>
                  <select
                    value={pendingFilters.assignedTo}
                    onChange={e => setPendingFilters(p => ({ ...p, assignedTo: e.target.value }))}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none w-full bg-white"
                  >
                    <option value="">All RMs</option>
                    {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags</p>
                  <div className="flex gap-1.5">
                    {['Hot', 'Warm', 'Cold', 'Escalated'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setPendingFilters(p => ({
                          ...p,
                          tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
                        }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          pendingFilters.tags.includes(tag)
                            ? TAG_PILL_COLORS[tag] || 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setPendingFilters(EMPTY_FILTERS)
                  setFilters(EMPTY_FILTERS)
                  setShowFilters(false)
                }}
                className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Clear Filters
              </button>
              <button
                onClick={() => { setFilters({ ...pendingFilters }); setShowFilters(false) }}
                className="text-xs px-3 py-1.5 bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Lead count */}
        <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-50 flex-shrink-0">
          {viewMode === 'enquiry'
            ? `${enquiryViewData.length} enquir${enquiryViewData.length !== 1 ? 'ies' : 'y'}`
            : `${filteredLeads.length} result${filteredLeads.length !== 1 ? 's' : ''}`}
          {viewMode === 'people' && activeFilterCount > 0 && (
            <span className="ml-1 text-[#422D83]">· {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'enquiry' ? (
            enquiryViewLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : enquiryViewData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Building2 className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No active enquiries</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-900 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">Lead Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">Enquiry</th>
                    <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Stage</th>
                    <th className="px-3 py-3 w-36 text-left text-xs font-semibold uppercase tracking-wide">Sub Stage</th>
                    <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Scheduled</th>
                    <th className="px-3 py-3 w-28 text-left text-xs font-semibold uppercase tracking-wide">Assigned RM</th>
                    <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiryViewData.map((enq: any) => {
                    const phoneClean = (enq.lead_country_code || '+91').replace('+', '') + (enq.lead_phone || '')
                    return (
                      <tr
                        key={enq.enquiry_id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectLeadById(enq.lead_id)}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {getInitials(enq.lead_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{enq.lead_name}</p>
                              <p className="text-[10px] text-gray-400">{enq.lead_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs font-mono text-gray-500">{enq.enquiry_id}</p>
                          {enq.property_type && (
                            <p className="text-[10px] text-gray-400">{enq.property_type}{enq.location_pref ? ` · ${enq.location_pref}` : ''}</p>
                          )}
                        </td>
                        <td className="px-3 py-3 w-32">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(enq.stage)}`}>
                            {stageDisplayLabel(enq.stage || 'New')}
                          </span>
                        </td>
                        <td className="px-3 py-3 w-36">
                          <p className="text-xs text-gray-500 truncate max-w-[130px]">{enq.sub_stage || '—'}</p>
                        </td>
                        <td className="px-3 py-3 w-32">
                          <p className="text-xs text-gray-500">
                            {enq.scheduled_at
                              ? new Date(enq.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </p>
                        </td>
                        <td className="px-3 py-3 w-28">
                          <p className="text-xs text-gray-600 truncate max-w-[100px]">{enq.assigned_rm || 'Unassigned'}</p>
                        </td>
                        <td className="px-3 py-3 w-32">
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${enq.lead_country_code || '+91'}${enq.lead_phone}`} onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-blue-600" title="Call">
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <span className="text-xs text-gray-600 truncate max-w-[48px]">{enq.lead_phone}</span>
                            <a href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hi ${enq.lead_name}, this is PropSarathi.`)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-green-600 hover:text-green-700" title="WhatsApp">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-900 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 w-8 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={e => {
                        if (e.target.checked) setSelectedLeadIds(new Set(filteredLeads.map((l: any) => l.lead_id)))
                        else setSelectedLeadIds(new Set())
                      }}
                      className="rounded opacity-70"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">Lead Name</th>
                  {visibleColumns.has('modified') && <th className="px-3 py-3 w-28 text-left text-xs font-semibold uppercase tracking-wide">Assigned / Modified</th>}
                  {visibleColumns.has('phone') && <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Phone</th>}
                  {visibleColumns.has('last_note') && <th className="px-3 py-3 w-36 text-left text-xs font-semibold uppercase tracking-wide">Notes</th>}
                  {visibleColumns.has('source') && <th className="px-3 py-3 w-20 text-left text-xs font-semibold uppercase tracking-wide">Source</th>}
                  {visibleColumns.has('status') && <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Status</th>}
                  {visibleColumns.has('created_at') && <th className="px-3 py-3 w-24 text-left text-xs font-semibold uppercase tracking-wide">Created</th>}
                  {visibleColumns.has('latest_scheduled_at') && <th className="px-3 py-3 w-24 text-left text-xs font-semibold uppercase tracking-wide">Scheduled</th>}
                  {visibleColumns.has('email') && <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Email</th>}
                  {visibleColumns.has('customer_location') && <th className="px-3 py-3 w-24 text-left text-xs font-semibold uppercase tracking-wide">Location</th>}
                  {visibleColumns.has('lead_type') && <th className="px-3 py-3 w-16 text-left text-xs font-semibold uppercase tracking-wide">Type</th>}
                  {visibleColumns.has('active_enquiry_count') && <th className="px-3 py-3 w-12 text-left text-xs font-semibold uppercase tracking-wide">Enq</th>}
                  <th className="px-3 py-3 w-14" />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead: any) => {
                  const isSelected = selectedLead?.lead_id === lead.lead_id
                  const tags = lead.tags ? lead.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
                  const phoneClean = (lead.country_code || '+91').replace('+', '') + (lead.phone || '')
                  const waMsg = encodeURIComponent(`Hi ${lead.name}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`)
                  const score = leadScore(lead.latest_enquiry_stage)
                  const isExpanded = expandedLeads.has(lead.lead_id)

                  return (
                    <React.Fragment key={lead.lead_id}>
                      <tr
                        onClick={() => selectLead(lead)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-3 py-4 w-8" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(lead.lead_id)}
                            onChange={e => {
                              const next = new Set(selectedLeadIds)
                              if (e.target.checked) next.add(lead.lead_id)
                              else next.delete(lead.lead_id)
                              setSelectedLeadIds(next)
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {getInitials(lead.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${(lead.active_enquiry_count || 0) > 0 ? 'bg-[#422D83]/10 text-[#422D83]' : 'bg-gray-100 text-gray-400'}`}>
                                  E{lead.active_enquiry_count || 0}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${(lead.active_listings || 0) > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                  L{lead.active_listings || 0}
                                </span>
                              </div>
                              <p className="font-bold text-gray-900 text-sm leading-tight truncate">{lead.name}</p>
                              <p className="text-xs text-gray-400">{lead.lead_id}</p>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${score.cls}`}>{score.label}</span>
                                {tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className={`text-[10px] px-1.5 rounded-full font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        {visibleColumns.has('modified') && (
                          <td className="px-3 py-4 w-28">
                            <p className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{lead.assigned_rm || 'Unassigned'}</p>
                            <p className="text-xs text-gray-400">At {formatDate(lead.updated_at)}</p>
                          </td>
                        )}
                        {visibleColumns.has('phone') && (
                          <td className="px-3 py-4 w-32">
                            <div className="flex items-center gap-1.5">
                              <a href={`tel:${lead.country_code || '+91'}${lead.phone}`} onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-blue-600" title="Call">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <span className="text-xs text-gray-600 truncate max-w-[56px]">{lead.phone}</span>
                              <a href={`https://wa.me/${phoneClean}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-green-600 hover:text-green-700" title="WhatsApp">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        )}
                        {visibleColumns.has('last_note') && (
                          <td className="px-3 py-4 w-36">
                            <p className="text-xs text-gray-500 truncate max-w-[128px]">{lead.last_note || '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('source') && (
                          <td className="px-3 py-4 w-20">
                            <p className="text-xs text-gray-600 truncate max-w-[72px]">{lead.source || '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('status') && (
                          <td className="px-3 py-4 w-32">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(lead.latest_enquiry_stage)}`}>
                              {stageDisplayLabel(lead.latest_enquiry_stage)}
                            </span>
                            {lead.latest_enquiry_sub_stage && (
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{lead.latest_enquiry_sub_stage}</p>
                            )}
                          </td>
                        )}
                        {visibleColumns.has('created_at') && (
                          <td className="px-3 py-4 w-24">
                            <p className="text-xs text-gray-500">{formatDate(lead.created_at)}</p>
                          </td>
                        )}
                        {visibleColumns.has('latest_scheduled_at') && (
                          <td className="px-3 py-4 w-24">
                            <p className="text-xs text-gray-500">{lead.latest_scheduled_at ? formatDate(lead.latest_scheduled_at) : '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('email') && (
                          <td className="px-3 py-4 w-32">
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">{lead.email || '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('customer_location') && (
                          <td className="px-3 py-4 w-24">
                            <p className="text-xs text-gray-500 truncate max-w-[90px]">{lead.customer_location || '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('lead_type') && (
                          <td className="px-3 py-4 w-16">
                            <p className="text-xs text-gray-500">{lead.lead_type || '—'}</p>
                          </td>
                        )}
                        {visibleColumns.has('active_enquiry_count') && (
                          <td className="px-3 py-4 w-12">
                            <p className="text-xs text-gray-500 text-center">{lead.active_enquiry_count || 0}</p>
                          </td>
                        )}
                        <td className="px-3 py-4 w-14" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-0.5">
                            <button
                              className="text-gray-300 hover:text-gray-600 p-1"
                              title="Edit lead"
                              onClick={() => { setEditingLead(lead); setShowAddLead(true) }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className={`p-1 transition-colors ${isExpanded ? 'text-[#422D83]' : 'text-gray-300 hover:text-[#422D83]'}`}
                              title={isExpanded ? 'Collapse' : 'Show enquiries'}
                              onClick={e => toggleExpand(e, lead.lead_id)}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#422D83]/5 border-b border-[#422D83]/10">
                          <td colSpan={8} className="px-6 py-3">
                            {!expandedLeadData[lead.lead_id] ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Loading enquiries…
                              </div>
                            ) : expandedLeadData[lead.lead_id].length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No enquiries yet</p>
                            ) : (
                              <div className="flex gap-3 flex-wrap">
                                {expandedLeadData[lead.lead_id].map((enq: any) => (
                                  <div
                                    key={enq.enquiry_id}
                                    className={`border rounded-lg px-3 py-2 min-w-[160px] max-w-[220px] bg-white ${enq.status === 'active' ? 'border-[#422D83]/30' : 'border-gray-200 opacity-60'}`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${stageBadgeCls(enq.stage)}`}>
                                        {stageDisplayLabel(enq.stage || 'New')}
                                      </span>
                                      {enq.status === 'active' && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Active</span>
                                      )}
                                    </div>
                                    {enq.property_type && (
                                      <p className="text-xs text-gray-600 truncate">{enq.property_type}{enq.location_pref ? ` · ${enq.location_pref}` : ''}</p>
                                    )}
                                    {enq.sub_stage && <p className="text-[10px] text-gray-400 truncate">{enq.sub_stage}</p>}
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{enq.enquiry_id}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Profile side panel ── */}
      {profileLead && (
        <div className="w-[40%] border-l border-gray-200 flex flex-col overflow-hidden bg-white">
          {/* Panel header */}
          <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <button
              onClick={() => { setProfileLead(null); setProfileDetail(null); setSelectedLead(null) }}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{profileLead.name}</p>
              <p className="text-[10px] text-gray-400">{profileLead.lead_id}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <a
                href={`tel:${profileLead.country_code || '+91'}${profileLead.phone}`}
                onClick={e => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${(profileLead.country_code || '+91').replace('+', '')}${profileLead.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              {profileLead.email && (
                <a
                  href={`mailto:${profileLead.email}`}
                  className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                  title="Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => { setEditingLead(profileLead); setShowAddLead(true) }}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
                title="Edit lead"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {profileLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            )}

            {!profileLoading && (
              <>
                {/* Contact Details */}
                <section>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Details</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ['Primary Phone', `${profileLead.country_code || '+91'} ${profileLead.phone}`],
                      ['Alternate Phone', profileLead.alternate_phone],
                      ['Email', profileLead.email],
                      ['Location', profileLead.customer_location],
                      ['Lead Type', profileLead.lead_type],
                      ['Source', profileLead.source],
                      ['Sub Source', profileLead.sub_source],
                      ['Assigned RM', profileLead.assigned_rm || 'Unassigned'],
                      ['Tags', profileLead.tags],
                      ['Created', profileLead.created_at ? new Date(profileLead.created_at).toLocaleDateString('en-IN') : undefined],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-[10px] text-gray-400">{label}</p>
                        <p className="text-xs text-gray-800 font-medium truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Enquiries */}
                <section>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Enquiries ({profileDetail?.enquiries?.length ?? 0})
                  </p>
                  {(!profileDetail?.enquiries || profileDetail.enquiries.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No enquiries yet</p>
                  )}
                  <div className="space-y-1.5">
                    {(profileDetail?.enquiries || []).map((enq: any) => (
                      <div key={enq.enquiry_id} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-400">{enq.enquiry_id}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${stageBadgeCls(enq.stage)}`}>
                            {stageDisplayLabel(enq.stage || 'New')}
                          </span>
                          {enq.property_type && <span className="text-[10px] text-gray-500">{enq.property_type}</span>}
                          {enq.scheduled_at && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(enq.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${enq.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {enq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Listings */}
                <section>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Listings ({profileDetail?.listings?.length ?? 0})
                  </p>
                  {(!profileDetail?.listings || profileDetail.listings.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No listings yet</p>
                  )}
                  <div className="space-y-1.5">
                    {(profileDetail?.listings || []).map((ls: any) => (
                      <div key={ls.listing_id} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 last:border-0">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-gray-400 mr-1.5">{ls.listing_id}</span>
                          <span className="text-xs font-medium text-gray-800 truncate">{ls.title || 'Untitled'}</span>
                          {ls.asking_price > 0 && (
                            <p className="text-[10px] text-gray-500">
                              {ls.currency === 'AED' ? 'AED ' : '₹'}{Number(ls.asking_price).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">{ls.status || 'pending'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Activity */}
                <section>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Activity History</p>
                  {(!profileDetail?.activity || profileDetail.activity.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No activity yet</p>
                  )}
                  <div className="space-y-2">
                    {(profileDetail?.activity || []).slice(0, 10).map((item: any, i: number) => (
                      <div key={item.id || i} className="py-1 border-b border-gray-50 last:border-0">
                        <p className="text-xs font-medium text-gray-800">{item.title}</p>
                        {item.description && (
                          <p className="text-[10px] text-gray-500 italic truncate">"{item.description}"</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.performed_by} ·{' '}
                          {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <AddLeadModal
          user={user}
          editingLead={editingLead}
          onClose={() => { setShowAddLead(false); setEditingLead(null) }}
          onSuccess={(leadId: string) => {
            setShowAddLead(false)
            const wasEditing = editingLead
            setEditingLead(null)
            onReload()
            if (wasEditing) {
              showToast('Lead updated')
              if (profileLead && wasEditing.lead_id === profileLead.lead_id) {
                setProfileLoading(true)
                fetch(`/api/crm/v2/leads/${profileLead.lead_id}`, { credentials: 'include' })
                  .then(r => r.json())
                  .then(data => { if (data.success) { setProfileDetail(data); setProfileLead(data.lead) } })
                  .catch(() => {})
                  .finally(() => setProfileLoading(false))
              }
            } else {
              showToast(`Lead ${leadId} created`)
            }
          }}
        />
      )}

      {/* Bulk action bar */}
      {selectedLeadIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-6 py-3 flex items-center justify-between z-50 shadow-2xl">
          <span className="text-sm font-semibold">
            {selectedLeadIds.size} Lead{selectedLeadIds.size !== 1 ? 's' : ''} Selected
          </span>
          <div className="flex items-center gap-3">
            {bulkLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { handleBulkAction('stage', e.target.value); (e.target as HTMLSelectElement).value = '' } }}
              disabled={bulkLoading}
              className="bg-gray-800 border border-gray-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              <option value="" disabled>Bulk Update Status</option>
              {STAGE_ACTIONS.map(a => <option key={a.apiStage} value={a.apiStage}>{a.label}</option>)}
            </select>
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { handleBulkAction('reassign', e.target.value); (e.target as HTMLSelectElement).value = '' } }}
              disabled={bulkLoading}
              className="bg-gray-800 border border-gray-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              <option value="" disabled>Reassign Leads</option>
              {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
            </select>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
              >
                Delete Selected
              </button>
            )}
            <button
              onClick={() => setSelectedLeadIds(new Set())}
              className="text-gray-400 hover:text-white ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">
              Delete {selectedLeadIds.size} lead{selectedLeadIds.size !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This will soft-delete the selected leads. They can be recovered from the Deleted filter.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('delete', 'true')}
                disabled={bulkLoading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#422D83] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-[60]">
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ lead }: { lead: any }) {
  if (!lead) return null

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null
    return (
      <div className="flex py-1 border-b border-gray-50 last:border-0">
        <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
        <span className="text-xs text-gray-800 font-medium">{value}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-[#422D83]/10 rounded-full flex items-center justify-center text-[#422D83] font-bold flex-shrink-0">
          {getInitials(lead.name || lead.clientName || '')}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{lead.name || lead.clientName}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{lead.lead_id || lead.leadId} · Added {formatDate(lead.created_at || lead.createdAt)}</p>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</h3>
        <InfoRow label="Phone" value={`${lead.country_code || lead.countryCode || '+91'} ${lead.phone}`} />
        <InfoRow label="Alt Phone" value={lead.alternate_phone || lead.altPhone} />
        <InfoRow label="Email" value={lead.email} />
        <InfoRow label="Location" value={lead.customer_location || lead.city} />
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lead Details</h3>
        <InfoRow label="Lead Type" value={lead.lead_type || lead.leadType} />
        <InfoRow label="Source" value={lead.source} />
        <InfoRow label="Sub Source" value={lead.sub_source || lead.subSource} />
        <InfoRow label="Tags" value={lead.tags} />
        <InfoRow label="Referral" value={lead.referral_name ? `${lead.referral_name}${lead.referral_phone ? ` (${lead.referral_phone})` : ''}` : undefined} />
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Assignment</h3>
        <InfoRow label="Assigned RM" value={lead.assigned_rm || lead.assignedRM} />
      </section>
    </div>
  )
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────

function EnquiriesTab({ enquiries, leadId, onRefresh, showToast }: {
  enquiries: any[]
  leadId: string
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    projectInterest: '', propertyType: '', locationPref: '',
    minBudget: '', maxBudget: '', currency: 'INR', bedrooms: 'Any', purpose: '',
  })
  const [addSaving, setAddSaving] = useState(false)

  const [stageCardId, setStageCardId] = useState<string | null>(null)
  const [stageForm, setStageForm] = useState({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' })
  const [stageSaving, setStageSaving] = useState(false)

  async function handleSaveStage(enquiryId: string) {
    if (!stageForm.stage || !stageForm.notes.trim()) return
    setStageSaving(true)
    try {
      const res = await fetch(`/api/crm/v2/enquiries/${enquiryId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: stageForm.stage,
          subStage: stageForm.subStage,
          notes: stageForm.notes,
          scheduledAt: stageForm.scheduledAt || undefined,
          lostReason: stageForm.lostReason || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setStageCardId(null)
      setStageForm({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' })
      showToast(`Stage updated to ${stageDisplayLabel(stageForm.stage)}`)
      onRefresh()
    } catch (e: any) {
      showToast(e.message || 'Error saving stage')
    } finally {
      setStageSaving(false)
    }
  }

  async function handleSaveAdd() {
    if (!leadId) return
    setAddSaving(true)
    try {
      const res = await fetch('/api/crm/v2/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          projectName: addForm.projectInterest,
          propertyType: addForm.propertyType,
          locationPref: addForm.locationPref,
          minBudget: addForm.minBudget ? Number(addForm.minBudget) : 0,
          maxBudget: addForm.maxBudget ? Number(addForm.maxBudget) : 0,
          currency: addForm.currency,
          bedrooms: addForm.bedrooms,
          purpose: addForm.purpose,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowAdd(false)
      setAddForm({ projectInterest: '', propertyType: '', locationPref: '', minBudget: '', maxBudget: '', currency: 'INR', bedrooms: 'Any', purpose: '' })
      showToast('Enquiry added')
      onRefresh()
    } catch (e: any) {
      showToast(e.message || 'Error adding enquiry')
    } finally {
      setAddSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Enquiries ({enquiries.length})</h3>
        <button
          onClick={() => setShowAdd(p => !p)}
          className="text-xs text-[#422D83] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Enquiry
        </button>
      </div>

      {enquiries.length === 0 && !showAdd && (
        <p className="text-xs text-gray-400 py-4 text-center">No enquiries yet</p>
      )}

      {enquiries.map((enq: any) => {
        const isChangingStage = stageCardId === enq.enquiry_id
        const subStages = stageForm.stage ? (SUB_STAGES[stageForm.stage] || []) : []
        const needsSchedule = ['Callback', 'Schedule Meeting', 'Schedule Site Visit'].includes(stageForm.stage)
        const needsLostReason = ['Not Interested', 'Drop'].includes(stageForm.stage)

        return (
          <div
            key={enq.enquiry_id}
            className={`border rounded-xl overflow-hidden ${enq.status === 'active' ? 'border-[#422D83]/20' : 'border-gray-200 opacity-60'}`}
          >
            <div className={`p-3 ${enq.status === 'active' ? 'bg-[#422D83]/5' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-mono text-gray-500">{enq.enquiry_id}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${stageBadgeCls(enq.stage)}`}>
                      {stageDisplayLabel(enq.stage || 'New')}
                    </span>
                    {enq.sub_stage && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{enq.sub_stage}</span>
                    )}
                    {enq.status === 'active' && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  {enq.property_type && (
                    <p className="text-xs text-gray-600">{enq.property_type}{enq.location_pref ? ` · ${enq.location_pref}` : ''}</p>
                  )}
                  {(enq.min_budget > 0 || enq.max_budget > 0) && (
                    <p className="text-xs text-gray-500">
                      {enq.currency === 'AED' ? 'AED' : '₹'}{enq.min_budget ? Number(enq.min_budget).toLocaleString('en-IN') : '0'}
                      {' – '}
                      {enq.currency === 'AED' ? 'AED' : '₹'}{enq.max_budget ? Number(enq.max_budget).toLocaleString('en-IN') : '?'}
                    </p>
                  )}
                  {enq.scheduled_at && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Scheduled: {new Date(enq.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(enq.created_at)}</p>
                </div>
                {enq.status === 'active' && (
                  <button
                    onClick={() => {
                      if (isChangingStage) { setStageCardId(null) }
                      else { setStageCardId(enq.enquiry_id); setStageForm({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' }) }
                    }}
                    className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isChangingStage
                        ? 'bg-[#422D83] text-white border-[#422D83]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                    }`}
                  >
                    {isChangingStage ? 'Cancel' : 'Change Stage'}
                  </button>
                )}
              </div>
            </div>

            {isChangingStage && (
              <div className="border-t border-[#422D83]/10 bg-white p-3 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Move to stage</p>
                <div className="flex flex-wrap gap-1.5">
                  {STAGE_ACTIONS.map(action => (
                    <button
                      key={action.apiStage}
                      onClick={() => setStageForm(p => ({ ...p, stage: p.stage === action.apiStage ? '' : action.apiStage, subStage: '', lostReason: '' }))}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${action.color} ${
                        stageForm.stage === action.apiStage ? 'ring-2 ring-offset-1 ring-[#422D83]/30' : ''
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {subStages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {subStages.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setStageForm(p => ({ ...p, subStage: p.subStage === s ? '' : s }))}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          stageForm.subStage === s ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {needsSchedule && (
                  <input
                    type="datetime-local"
                    value={stageForm.scheduledAt}
                    onChange={e => setStageForm(p => ({ ...p, scheduledAt: e.target.value }))}
                    className={inputCls}
                  />
                )}

                {needsLostReason && (
                  <select
                    value={stageForm.lostReason}
                    onChange={e => setStageForm(p => ({ ...p, lostReason: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select reason…</option>
                    {(SUB_STAGES[stageForm.stage] || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}

                <textarea
                  value={stageForm.notes}
                  onChange={e => setStageForm(p => ({ ...p, notes: e.target.value }))}
                  className={inputCls + ' resize-none'}
                  rows={2}
                  placeholder="Notes (required)…"
                />
                <button
                  onClick={() => handleSaveStage(enq.enquiry_id)}
                  disabled={stageSaving || !stageForm.stage || !stageForm.notes.trim() || (needsLostReason && !stageForm.lostReason)}
                  className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1"
                >
                  {stageSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save Stage
                </button>
              </div>
            )}
          </div>
        )
      })}

      {showAdd && (
        <div className="border border-[#422D83]/20 rounded-xl p-4 space-y-3 bg-[#422D83]/5">
          <p className="text-xs font-semibold text-[#422D83]">New Enquiry</p>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Project of Interest</label>
            <input type="text" value={addForm.projectInterest} onChange={e => setAddForm(p => ({ ...p, projectInterest: e.target.value }))} className={inputCls} placeholder="Project name" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
              <select value={addForm.propertyType} onChange={e => setAddForm(p => ({ ...p, propertyType: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {PROPERTY_TYPES_V2.map(pt => <option key={pt}>{pt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Purpose</label>
              <select value={addForm.purpose} onChange={e => setAddForm(p => ({ ...p, purpose: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {PURPOSE_OPTIONS_V2.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">BHK</label>
            <div className="flex gap-1.5">
              {BEDROOM_OPTIONS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setAddForm(p => ({ ...p, bedrooms: b }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${addForm.bedrooms === b ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Location Preference</label>
            <input type="text" value={addForm.locationPref} onChange={e => setAddForm(p => ({ ...p, locationPref: e.target.value }))} className={inputCls} placeholder="Area / locality" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Min Budget (₹)</label>
              <input type="number" value={addForm.minBudget} onChange={e => setAddForm(p => ({ ...p, minBudget: e.target.value }))} className={inputCls} placeholder="Min" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Max Budget (₹)</label>
              <input type="number" value={addForm.maxBudget} onChange={e => setAddForm(p => ({ ...p, maxBudget: e.target.value }))} className={inputCls} placeholder="Max" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveAdd} disabled={addSaving} className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1">
              {addSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Enquiry
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Status Tab ───────────────────────────────────────────────────────────────

function StatusTab({ activeEnquiry, activeStageAction, setActiveStageAction, subStage, setSubStage, stageNotes, setStageNotes, stageScheduledAt, setStageScheduledAt, stageLostReason, setStageLostReason, bookingName, setBookingName, bookingDate, setBookingDate, agreementValue, setAgreementValue, savingStage, onSave }: any) {
  const subStages = activeStageAction ? (SUB_STAGES[activeStageAction] || []) : []
  const needsSchedule = ['Callback', 'Schedule Meeting', 'Schedule Site Visit'].includes(activeStageAction)
  const needsLostReason = ['Not Interested', 'Drop'].includes(activeStageAction)
  const isBooking = activeStageAction === 'Book'
  const canSave = stageNotes.trim() && (!needsLostReason || stageLostReason)

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-50 rounded-lg p-3">
        {activeEnquiry ? (
          <>
            <p className="text-xs text-gray-500 mb-1.5">Current Stage</p>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg inline-block ${stageBadgeCls(activeEnquiry.stage)}`}>
              {stageDisplayLabel(activeEnquiry.stage || 'New')}
            </span>
            {activeEnquiry.sub_stage && <p className="text-xs text-gray-500 mt-1">{activeEnquiry.sub_stage}</p>}
            {activeEnquiry.scheduled_at && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(activeEnquiry.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">No active enquiry — selecting an action below will create one automatically.</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Move To</p>
        <div className="flex flex-wrap gap-2">
          {STAGE_ACTIONS.map(action => (
            <button
              key={action.apiStage}
              onClick={() => setActiveStageAction(activeStageAction === action.apiStage ? '' : action.apiStage)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action.color} ${
                activeStageAction === action.apiStage ? 'ring-2 ring-offset-1 ring-[#422D83]/30' : ''
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {activeStageAction && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700">
            Moving to: <span className="text-[#422D83]">{stageDisplayLabel(activeStageAction)}</span>
          </p>

          {subStages.length > 0 && (
            <div>
              <label className="text-xs text-gray-600 mb-1.5 block">Sub Stage</label>
              <div className="flex flex-wrap gap-1.5">
                {subStages.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSubStage(subStage === s ? '' : s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      subStage === s ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsSchedule && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Schedule Date / Time</label>
              <input
                type="datetime-local"
                value={stageScheduledAt}
                onChange={e => setStageScheduledAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
              />
            </div>
          )}

          {needsLostReason && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Reason <span className="text-red-500">*</span></label>
              <select
                value={stageLostReason}
                onChange={e => setStageLostReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
              >
                <option value="">Select reason…</option>
                {(SUB_STAGES[activeStageAction] || []).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {isBooking && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Booked In Name Of</label>
                  <input type="text" value={bookingName} onChange={e => setBookingName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" placeholder="Name" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Booking Date</label>
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Agreement Value</label>
                <input type="number" value={agreementValue} onChange={e => setAgreementValue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" placeholder="e.g. 12000000" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Notes <span className="text-red-500">*</span></label>
            <textarea
              value={stageNotes}
              onChange={e => setStageNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 resize-none"
              rows={3}
              placeholder="Required: notes about this stage change…"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={savingStage || !canSave}
              className="px-4 py-2 bg-[#422D83] hover:bg-[#321f6b] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingStage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Stage
            </button>
            <button onClick={() => setActiveStageAction('')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ activity }: { activity: any[] }) {
  const [filter, setFilter] = useState<'All' | 'Status' | 'Notes'>('All')

  const filtered = activity.filter((a: any) => {
    if (filter === 'Status') return a.activity_type === 'stage_change'
    if (filter === 'Notes') return a.activity_type === 'note_added'
    return true
  })

  return (
    <div className="p-4">
      <div className="flex gap-1 mb-4">
        {(['All', 'Status', 'Notes'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              filter === f ? 'bg-[#422D83] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No activity yet</p>
      ) : (
        <div>
          {filtered.map((item: any, i: number) => {
            const Icon = ACTIVITY_ICONS[item.activity_type] || Activity
            const colorClass = ACTIVITY_COLORS[item.activity_type] || 'bg-gray-100 text-gray-600'
            return (
              <div key={item.id || i} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {i < filtered.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-1 min-h-[16px]" />}
                </div>
                <div className="flex-1 pb-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.timeAgo || timeAgo(item.created_at)}</span>
                  </div>
                  {item.activity_type === 'stage_change' && item.old_value && item.new_value && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="text-gray-400">{stageDisplayLabel(item.old_value)}</span>
                      {' → '}
                      <span className="font-medium text-gray-700">{stageDisplayLabel(item.new_value)}</span>
                    </p>
                  )}
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 italic">"{item.description}"</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{item.performed_by}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({ activity, noteText, setNoteText, savingNote, onSave }: any) {
  const notes = activity.filter((a: any) => a.activity_type === 'note_added')

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Note</h3>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 resize-none"
          rows={3}
          placeholder="Type a note…"
        />
        <button
          onClick={onSave}
          disabled={savingNote || !noteText.trim()}
          className="px-4 py-2 bg-[#422D83] hover:bg-[#321f6b] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {savingNote && <Loader2 className="w-3 h-3 animate-spin" />}
          Save Note
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Note History</h3>
        {notes.length === 0 ? (
          <p className="text-xs text-gray-400">No notes yet</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note: any, i: number) => (
              <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <p className="text-xs text-gray-700">{note.description}</p>
                <p className="text-xs text-gray-400 mt-1">{note.performed_by} · {note.timeAgo || timeAgo(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Document Tab ─────────────────────────────────────────────────────────────

function DocumentTab() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-48 text-gray-400">
      <FileText className="w-10 h-10 mb-2 opacity-30" />
      <p className="text-sm font-medium">Document upload</p>
      <p className="text-xs mt-1">Coming soon</p>
    </div>
  )
}

// ─── Listings Tab ─────────────────────────────────────────────────────────────

const LISTING_STATUS_BADGE: Record<string, string> = {
  'pending':        'bg-gray-100 text-gray-600',
  'rm_verified':    'bg-blue-100 text-blue-700',
  'admin_approved': 'bg-purple-100 text-purple-700',
  'live':           'bg-green-100 text-green-700',
}

const LISTING_STATUS_LABEL: Record<string, string> = {
  'pending':        'Pending',
  'rm_verified':    'RM Verified',
  'admin_approved': 'Admin Approved',
  'live':           'Live',
}

const BEDROOM_OPTS = ['1', '2', '3', '4', '4+']

function ListingsTab({ listings, leadId, onRefresh, showToast }: {
  listings: any[]
  leadId: string
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '', propertyType: '', address: '', city: '', locality: '',
    bedrooms: '2', bathrooms: '', areaSqft: '', askingPrice: '', sellerNotes: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!leadId || !form.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/crm/v2/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          title: form.title,
          propertyType: form.propertyType,
          address: form.address,
          city: form.city,
          locality: form.locality,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
          areaSqft: form.areaSqft ? Number(form.areaSqft) : 0,
          askingPrice: form.askingPrice ? Number(form.askingPrice) : 0,
          sellerNotes: form.sellerNotes,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowAdd(false)
      setForm({ title: '', propertyType: '', address: '', city: '', locality: '', bedrooms: '2', bathrooms: '', areaSqft: '', askingPrice: '', sellerNotes: '' })
      showToast('Listing added')
      onRefresh()
    } catch (e: any) {
      showToast(e.message || 'Error adding listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Listings ({listings.length})</h3>
        <button
          onClick={() => setShowAdd(p => !p)}
          className="text-xs text-[#422D83] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Listing
        </button>
      </div>

      {listings.length === 0 && !showAdd && (
        <p className="text-xs text-gray-400 py-4 text-center">No listings yet</p>
      )}

      {listings.map((ls: any) => {
        const statusCls = LISTING_STATUS_BADGE[ls.status] || 'bg-gray-100 text-gray-600'
        const statusLabel = LISTING_STATUS_LABEL[ls.status] || ls.status || 'Pending'
        return (
          <div key={ls.listing_id} className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-mono text-gray-500">{ls.listing_id}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusCls}`}>{statusLabel}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{ls.title || 'Untitled'}</p>
                {(ls.property_type || ls.bedrooms) && (
                  <p className="text-xs text-gray-500">{ls.bedrooms ? `${ls.bedrooms}BHK ` : ''}{ls.property_type}</p>
                )}
                {(ls.city || ls.locality) && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[ls.locality, ls.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {ls.asking_price > 0 && (
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    Asking: ₹{Number(ls.asking_price).toLocaleString('en-IN')}
                    {ls.area_sqft > 0 && <span className="text-gray-400 font-normal">  ·  {Number(ls.area_sqft).toLocaleString()} sqft</span>}
                  </p>
                )}
              </div>
              <Home className="w-8 h-8 text-gray-200 flex-shrink-0 mt-1" />
            </div>
            {ls.seller_notes && (
              <p className="text-xs text-gray-400 mt-2 italic border-t border-gray-100 pt-2">"{ls.seller_notes}"</p>
            )}
          </div>
        )
      })}

      {showAdd && (
        <div className="border border-[#422D83]/20 rounded-xl p-4 space-y-3 bg-[#422D83]/5">
          <p className="text-xs font-semibold text-[#422D83]">New Listing</p>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Property Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. 3BHK Flat, Sector 62 Noida" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
              <select value={form.propertyType} onChange={e => setForm(p => ({ ...p, propertyType: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {PROPERTY_TYPES_V2.map(pt => <option key={pt}>{pt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Bedrooms</label>
              <div className="flex gap-1 flex-wrap">
                {BEDROOM_OPTS.map(b => (
                  <button key={b} type="button" onClick={() => setForm(p => ({ ...p, bedrooms: b }))}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${form.bedrooms === b ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Address</label>
            <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputCls} placeholder="Full address" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">City</label>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="City" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Locality</label>
              <input type="text" value={form.locality} onChange={e => setForm(p => ({ ...p, locality: e.target.value }))} className={inputCls} placeholder="Area" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))} className={inputCls} placeholder="2" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Area (sqft)</label>
              <input type="number" value={form.areaSqft} onChange={e => setForm(p => ({ ...p, areaSqft: e.target.value }))} className={inputCls} placeholder="1200" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Asking Price (₹)</label>
              <input type="number" value={form.askingPrice} onChange={e => setForm(p => ({ ...p, askingPrice: e.target.value }))} className={inputCls} placeholder="5000000" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Seller Notes</label>
            <textarea value={form.sellerNotes} onChange={e => setForm(p => ({ ...p, sellerNotes: e.target.value }))} className={inputCls + ' resize-none'} rows={2} placeholder="Any notes from the seller…" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Listing
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({ tasks, leadId, onRefresh, showToast, rms }: {
  tasks: any[]
  leadId: string
  onRefresh: () => void
  showToast: (msg: string) => void
  rms: any[]
}) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', dueAt: '', priority: 'Medium', assignedTo: '' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/crm/v2/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...form }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowAdd(false)
      setForm({ title: '', dueAt: '', priority: 'Medium', assignedTo: '' })
      showToast('Task added')
      onRefresh()
    } catch (e: any) {
      showToast(e.message || 'Error adding task')
    } finally {
      setSaving(false)
    }
  }

  const priorityCls: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-700',
    High: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Tasks ({tasks.length})</h3>
        <button
          onClick={() => setShowAdd(p => !p)}
          className="text-xs text-[#422D83] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Task
        </button>
      </div>

      {tasks.length === 0 && !showAdd && (
        <p className="text-xs text-gray-400 py-4 text-center">No pending tasks</p>
      )}

      {tasks.map((task: any) => (
        <div key={task.id || task.task_id} className="border border-gray-200 rounded-xl p-3 bg-white">
          <p className="text-sm font-medium text-gray-800">{task.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityCls[task.priority] || 'bg-gray-100 text-gray-600'}`}>
              {task.priority}
            </span>
            {task.assigned_to && (
              <span className="text-xs text-gray-500">{task.assigned_to}</span>
            )}
            {task.due_at && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_at)}
              </span>
            )}
          </div>
        </div>
      ))}

      {showAdd && (
        <div className="border border-[#422D83]/20 rounded-xl p-4 space-y-3 bg-[#422D83]/5">
          <p className="text-xs font-semibold text-[#422D83]">New Task</p>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputCls}
              placeholder="Task description"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Due Date</label>
              <input
                type="date"
                value={form.dueAt}
                onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Priority</label>
              <div className="flex gap-1">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.priority === p ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Assigned To</label>
            <select
              value={form.assignedTo}
              onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select RM…</option>
              {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Task
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Lead Modal ───────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onSuccess, user, editingLead }: {
  onClose: () => void
  onSuccess: (leadId: string) => void
  user: any
  editingLead?: any
}) {
  const [form, setForm] = useState({
    name: '', phone: '', countryCode: '+91', alternatePhone: '', email: '',
    source: 'Direct', subSource: '', assignedRm: '', customerLocation: '',
    leadType: 'Buyer', tags: [] as string[],
    projectInterest: '', propertyType: '', minBudget: '', maxBudget: '',
    budgetCurrency: 'INR', bedrooms: 'Any', locationPreference: '', purpose: '',
  })
  const [saving, setSaving] = useState(false)
  const [dupWarning, setDupWarning] = useState<any>(null)
  const [forceAdd, setForceAdd] = useState(false)
  const [rms, setRms] = useState<any[]>([])
  const [checkingDup, setCheckingDup] = useState(false)

  React.useEffect(() => {
    fetch('/api/crm/v2/users')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.users) setRms(d.users) })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    if (editingLead) {
      const tags = editingLead.tags
        ? editingLead.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : []
      setForm(p => ({
        ...p,
        name: editingLead.name || '',
        phone: editingLead.phone || '',
        countryCode: editingLead.country_code || '+91',
        alternatePhone: editingLead.alternate_phone || '',
        email: editingLead.email || '',
        source: editingLead.source || 'Direct',
        subSource: editingLead.sub_source || '',
        assignedRm: editingLead.assigned_rm || '',
        customerLocation: editingLead.customer_location || '',
        leadType: editingLead.lead_type || 'Buyer',
        tags,
      }))
    }
  }, [editingLead])

  async function checkDup() {
    if (editingLead) return
    if (!form.phone || form.phone.length < 6) return
    setCheckingDup(true)
    try {
      const res = await fetch(`/api/crm/v2/leads?search=${encodeURIComponent(form.phone)}&limit=5`)
      const data = await res.json()
      if (data.leads?.length > 0) {
        const clean = form.phone.replace(/\D/g, '').slice(-10)
        const match = data.leads.find((l: any) => l.phone.replace(/\D/g, '').slice(-10) === clean)
        setDupWarning(match || null)
      } else {
        setDupWarning(null)
      }
    } catch {}
    setCheckingDup(false)
  }

  function toggleTag(tag: string) {
    setForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) return
    setSaving(true)
    try {
      const body: Record<string, any> = {
        name: form.name, phone: form.phone, countryCode: form.countryCode,
        alternatePhone: form.alternatePhone, email: form.email,
        source: form.source, subSource: form.subSource,
        assignedRm: form.assignedRm, customerLocation: form.customerLocation,
        leadType: form.leadType, tags: form.tags.join(','), forceInsert: forceAdd,
      }
      if (['Buyer', 'Both'].includes(form.leadType)) {
        Object.assign(body, {
          projectInterest: form.projectInterest, propertyType: form.propertyType,
          minBudget: form.minBudget, maxBudget: form.maxBudget,
          budgetCurrency: form.budgetCurrency, bedrooms: form.bedrooms,
          locationPreference: form.locationPreference, purpose: form.purpose,
        })
      }
      let res: Response
      let data: any
      if (editingLead) {
        res = await fetch(`/api/crm/v2/leads/${editingLead.lead_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name, phone: form.phone, countryCode: form.countryCode,
            alternatePhone: form.alternatePhone, email: form.email,
            source: form.source, subSource: form.subSource,
            customerLocation: form.customerLocation,
            leadType: form.leadType, tags: form.tags.join(','),
            assignedRm: form.assignedRm,
          }),
        })
        data = await res.json()
        if (data.success) onSuccess(editingLead.lead_id)
      } else {
        res = await fetch('/api/crm/v2/leads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        data = await res.json()
        if (data.duplicate && !forceAdd) { setDupWarning(data.existingLead); setSaving(false); return }
        if (data.success) onSuccess(data.leadId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b z-10">
          <h2 className="font-bold text-gray-900">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <h3 className="text-xs font-bold text-[#422D83] uppercase tracking-wider">Lead Info</h3>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Full name" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Primary Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select value={form.countryCode} onChange={e => setForm(p => ({ ...p, countryCode: e.target.value }))} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-28">
                <option value="+91">+91 IN</option>
                <option value="+971">+971 AE</option>
                <option value="+1">+1 US</option>
                <option value="+44">+44 UK</option>
                <option value="+65">+65 SG</option>
                <option value="+61">+61 AU</option>
              </select>
              <div className="flex-1 relative">
                <input type="tel" value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setDupWarning(null); setForceAdd(false) }} onBlur={checkDup} className={inputCls} placeholder="Phone number" />
                {checkingDup && <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />}
              </div>
            </div>
            {dupWarning && !forceAdd && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
                <p className="font-semibold">⚠️ Lead exists: {dupWarning.name} — {dupWarning.assigned_rm || 'Unassigned'}</p>
                <div className="flex gap-3 mt-1.5">
                  <button type="button" className="text-blue-600 underline font-medium" onClick={() => setDupWarning(null)}>View Existing</button>
                  <button type="button" className="text-yellow-700 underline font-semibold" onClick={() => { setForceAdd(true); setDupWarning(null) }}>Add Anyway</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Number</label>
            <input type="tel" value={form.alternatePhone} onChange={e => setForm(p => ({ ...p, alternatePhone: e.target.value }))} className={inputCls} placeholder="Optional" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="Optional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source <span className="text-red-500">*</span></label>
              <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className={inputCls}>
                {SOURCES_V2.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sub-Source</label>
              <input type="text" value={form.subSource} onChange={e => setForm(p => ({ ...p, subSource: e.target.value }))} className={inputCls} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Primary RM</label>
            <select value={form.assignedRm} onChange={e => setForm(p => ({ ...p, assignedRm: e.target.value }))} className={inputCls}>
              <option value="">Select RM…</option>
              {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Location</label>
            <input type="text" value={form.customerLocation} onChange={e => setForm(p => ({ ...p, customerLocation: e.target.value }))} className={inputCls} placeholder="City / Area" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Lead Type</label>
            <div className="flex gap-2">
              {LEAD_TYPES.map(lt => (
                <button key={lt} type="button" onClick={() => setForm(p => ({ ...p, leadType: lt }))} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${form.leadType === lt ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'}`}>
                  {lt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS_V2.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${form.tags.includes(tag) ? TAG_PILL_COLORS[tag] || 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {!editingLead && ['Buyer', 'Both'].includes(form.leadType) && (
            <>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-4">Enquiry Info</h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Project of Interest</label>
                <input type="text" value={form.projectInterest} onChange={e => setForm(p => ({ ...p, projectInterest: e.target.value }))} className={inputCls} placeholder="Project name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
                <select value={form.propertyType} onChange={e => setForm(p => ({ ...p, propertyType: e.target.value }))} className={inputCls}>
                  <option value="">Select…</option>
                  {PROPERTY_TYPES_V2.map(pt => <option key={pt}>{pt}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Budget</label>
                  <div className="flex gap-1">
                    <select value={form.budgetCurrency} onChange={e => setForm(p => ({ ...p, budgetCurrency: e.target.value }))} className="border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none w-16 flex-shrink-0">
                      <option>INR</option><option>AED</option>
                    </select>
                    <input type="number" value={form.minBudget} onChange={e => setForm(p => ({ ...p, minBudget: e.target.value }))} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" placeholder="Min" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Budget</label>
                  <input type="number" value={form.maxBudget} onChange={e => setForm(p => ({ ...p, maxBudget: e.target.value }))} className={inputCls} placeholder="Max" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Bedrooms</label>
                <div className="flex gap-2">
                  {BEDROOM_OPTIONS.map(b => (
                    <button key={b} type="button" onClick={() => setForm(p => ({ ...p, bedrooms: b }))} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${form.bedrooms === b ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location Preference</label>
                <input type="text" value={form.locationPreference} onChange={e => setForm(p => ({ ...p, locationPreference: e.target.value }))} className={inputCls} placeholder="Area / Locality" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                <select value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className={inputCls}>
                  <option value="">Select…</option>
                  {PURPOSE_OPTIONS_V2.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-5 py-3 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.phone.trim()} className="px-5 py-2 text-sm bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingLead ? 'Update Lead' : 'Save Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}
