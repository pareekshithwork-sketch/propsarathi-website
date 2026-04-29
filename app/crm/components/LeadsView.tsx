'use client'

import React, { useState, useMemo } from 'react'
import {
  Users, Phone, MessageCircle, Mail, RefreshCw, Plus, Search,
  X, Check, Loader2, MoreHorizontal, Trash2, Calendar, FileText,
  Activity, TrendingUp, Building2,
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

// ─── Main LeadsView ────────────────────────────────────────────────────────────

export function LeadsView({ v2Leads, user, onReload }: {
  v2Leads: any[]
  user: any
  onReload: () => void
}) {
  // ── List filters ──
  const [stageTab, setStageTab] = useState('All')
  const [search, setSearch] = useState('')

  // ── Panel ──
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTab, setDetailTab] = useState<'overview' | 'enquiries' | 'status' | 'history' | 'notes' | 'document'>('overview')

  // ── Add Lead modal ──
  const [showAddLead, setShowAddLead] = useState(false)

  // ── Toast ──
  const [toast, setToast] = useState('')

  // ── Stage form ──
  const [activeStageAction, setActiveStageAction] = useState('')
  const [subStage, setSubStage] = useState('')
  const [stageNotes, setStageNotes] = useState('')
  const [stageScheduledAt, setStageScheduledAt] = useState('')
  const [stageLostReason, setStageLostReason] = useState('')
  const [bookingName, setBookingName] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [agreementValue, setAgreementValue] = useState('')
  const [savingStage, setSavingStage] = useState(false)

  // ── Notes ──
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // ── Enquiry form ──
  const [showAddEnquiry, setShowAddEnquiry] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    propertyType: '', locationPref: '', minBudget: '', maxBudget: '', currency: 'INR', bedrooms: 'Any', purpose: '',
  })
  const [savingEnquiry, setSavingEnquiry] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

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

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((l: any) =>
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.email?.toLowerCase().includes(q)
      )
    }

    return result
  }, [v2Leads, stageTab, search])

  async function loadDetail(leadId: string) {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/crm/v2/leads/${leadId}`)
      const data = await res.json()
      if (data.success) setDetail(data)
    } catch {}
    setDetailLoading(false)
  }

  function selectLead(lead: any) {
    setSelectedLead(lead)
    setDetailTab('overview')
    setActiveStageAction('')
    setStageNotes('')
    setSubStage('')
    setStageScheduledAt('')
    setStageLostReason('')
    setNoteText('')
    setShowAddEnquiry(false)
    loadDetail(lead.lead_id)
  }

  function closePanel() {
    setSelectedLead(null)
    setDetail(null)
  }

  async function handleStageChange() {
    if (!activeStageAction || !stageNotes.trim() || !selectedLead) return
    const needsLostReason = activeStageAction === 'Not Interested' || activeStageAction === 'Drop'
    if (needsLostReason && !stageLostReason) return

    setSavingStage(true)
    try {
      let enquiryId = detail?.enquiries?.find((e: any) => e.status === 'active')?.enquiry_id

      if (!enquiryId) {
        const enqRes = await fetch('/api/crm/v2/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: selectedLead.lead_id }),
        })
        const enqData = await enqRes.json()
        if (!enqData.success) throw new Error('Failed to create enquiry')
        enquiryId = enqData.enquiryId
      }

      const body: any = {
        stage: activeStageAction,
        subStage,
        notes: stageNotes,
        scheduledAt: stageScheduledAt || undefined,
        lostReason: stageLostReason || undefined,
      }
      if (activeStageAction === 'Book') {
        body.bookingName = bookingName
        body.bookingDate = bookingDate
        body.agreementValue = agreementValue ? parseFloat(agreementValue) : undefined
      }

      const res = await fetch(`/api/crm/v2/enquiries/${enquiryId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Stage change failed')

      setActiveStageAction('')
      setSubStage('')
      setStageNotes('')
      setStageScheduledAt('')
      setStageLostReason('')
      setBookingName('')
      setBookingDate('')
      setAgreementValue('')
      showToast(`Stage updated to ${stageDisplayLabel(activeStageAction)}`)
      await loadDetail(selectedLead.lead_id)
      onReload()
    } catch (e: any) {
      showToast(e.message || 'Error saving stage')
    } finally {
      setSavingStage(false)
    }
  }

  async function handleSaveNote() {
    if (!noteText.trim() || !selectedLead) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/crm/v2/activity/${selectedLead.lead_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setNoteText('')
      showToast('Note saved')
      await loadDetail(selectedLead.lead_id)
    } catch (e: any) {
      showToast(e.message || 'Error saving note')
    } finally {
      setSavingNote(false)
    }
  }

  async function handleAddEnquiry() {
    if (!selectedLead) return
    setSavingEnquiry(true)
    try {
      const res = await fetch('/api/crm/v2/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.lead_id,
          propertyType: enquiryForm.propertyType,
          locationPref: enquiryForm.locationPref,
          minBudget: enquiryForm.minBudget ? Number(enquiryForm.minBudget) : 0,
          maxBudget: enquiryForm.maxBudget ? Number(enquiryForm.maxBudget) : 0,
          currency: enquiryForm.currency,
          bedrooms: enquiryForm.bedrooms,
          purpose: enquiryForm.purpose,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowAddEnquiry(false)
      setEnquiryForm({ propertyType: '', locationPref: '', minBudget: '', maxBudget: '', currency: 'INR', bedrooms: 'Any', purpose: '' })
      showToast('Enquiry added')
      await loadDetail(selectedLead.lead_id)
      onReload()
    } catch (e: any) {
      showToast(e.message || 'Error adding enquiry')
    } finally {
      setSavingEnquiry(false)
    }
  }

  async function handleDelete() {
    if (!selectedLead || user?.role !== 'admin') return
    const typed = prompt(`Type DELETE to confirm removing "${selectedLead.name}":`)
    if (typed !== 'DELETE') return
    try {
      await fetch(`/api/crm/v2/leads/${selectedLead.lead_id}`, { method: 'DELETE' })
      closePanel()
      showToast('Lead deleted')
      onReload()
    } catch {}
  }

  const activeEnquiry = detail?.enquiries?.find((e: any) => e.status === 'active')

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Lead list (full width or 55%) ── */}
      <div className={`${selectedLead ? 'w-[55%]' : 'flex-1'} flex flex-col border-r border-gray-200 bg-white overflow-hidden transition-all duration-200`}>

        {/* Top bar: stage tabs + search + Add Lead + Refresh */}
        <div className="border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide">
            {STAGE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStageTab(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  stageTab === tab.id ? 'bg-[#422D83] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-40"
            />
          </div>
          <button
            onClick={() => setShowAddLead(true)}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </button>
          <button onClick={onReload} className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Lead count */}
        <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-50 flex-shrink-0">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-800 text-gray-200 sticky top-0 z-10">
                <tr className="text-xs uppercase tracking-wide">
                  <th className="px-3 py-2.5 w-8 font-medium text-left">
                    <input type="checkbox" className="rounded opacity-40" />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">Lead Name</th>
                  <th className="px-3 py-2.5 w-24 text-left font-medium">Modified</th>
                  <th className="px-3 py-2.5 w-32 text-left font-medium">Phone</th>
                  <th className="px-3 py-2.5 w-36 text-left font-medium">Notes</th>
                  <th className="px-3 py-2.5 w-24 text-left font-medium">Assigned To</th>
                  <th className="px-3 py-2.5 w-20 text-left font-medium">Source</th>
                  <th className="px-3 py-2.5 w-32 text-left font-medium">Status</th>
                  <th className="px-3 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead: any) => {
                  const isSelected = selectedLead?.lead_id === lead.lead_id
                  const tags = lead.tags ? lead.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
                  const phoneClean = (lead.country_code || '+91').replace('+', '') + (lead.phone || '')
                  const waMsg = encodeURIComponent(`Hi ${lead.name}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`)

                  return (
                    <tr
                      key={lead.lead_id}
                      onClick={() => selectLead(lead)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-3 py-3 w-8" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(lead.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.lead_id}</p>
                            {tags.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className={`text-[10px] px-1.5 rounded-full font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 w-24">
                        <p className="text-xs text-gray-600">{formatDate(lead.updated_at)}</p>
                      </td>
                      <td className="px-3 py-3 w-32">
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
                      <td className="px-3 py-3 w-36">
                        <p className="text-xs text-gray-500 truncate max-w-[128px]">{lead.last_note || '—'}</p>
                      </td>
                      <td className="px-3 py-3 w-24">
                        <p className="text-xs text-gray-600 truncate max-w-[88px]">{lead.assigned_rm || '—'}</p>
                      </td>
                      <td className="px-3 py-3 w-20">
                        <p className="text-xs text-gray-600 truncate max-w-[72px]">{lead.source || '—'}</p>
                      </td>
                      <td className="px-3 py-3 w-32">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(lead.latest_enquiry_stage)}`}>
                          {stageDisplayLabel(lead.latest_enquiry_stage)}
                        </span>
                      </td>
                      <td className="px-3 py-3 w-10" onClick={e => e.stopPropagation()}>
                        <button className="text-gray-300 hover:text-gray-600 p-1">
                          <MoreHorizontal className="w-4 h-4" />
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

      {/* ── Detail Panel (45%) ── */}
      {selectedLead && (
        <div className="w-[45%] flex flex-col overflow-hidden bg-white">

          {/* Panel header */}
          <div className="border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-start gap-2">
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 mt-0.5 flex-shrink-0 p-0.5">
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-gray-900 text-base leading-tight">{selectedLead.name}</h2>
                  {(activeEnquiry?.stage) && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(activeEnquiry.stage)}`}>
                      {stageDisplayLabel(activeEnquiry.stage)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{selectedLead.lead_id} · {selectedLead.assigned_rm || 'Unassigned'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={`tel:${selectedLead.country_code || '+91'}${selectedLead.phone}`} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg" title="Call">
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://wa.me/${(selectedLead.country_code || '+91').replace('+', '')}${selectedLead.phone}?text=${encodeURIComponent(`Hi ${selectedLead.name}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                {selectedLead.email && (
                  <a href={`mailto:${selectedLead.email}`} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg" title="Email">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
                {user?.role === 'admin' && (
                  <button onClick={handleDelete} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 flex overflow-x-auto flex-shrink-0 scrollbar-hide">
            {(['overview', 'enquiries', 'status', 'history', 'notes', 'document'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors capitalize ${
                  detailTab === tab ? 'border-[#422D83] text-[#422D83]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : (
              <>
                {detailTab === 'overview' && <OverviewTab lead={detail?.lead || selectedLead} />}
                {detailTab === 'enquiries' && (
                  <EnquiriesTab
                    enquiries={detail?.enquiries || []}
                    showAddEnquiry={showAddEnquiry}
                    setShowAddEnquiry={setShowAddEnquiry}
                    enquiryForm={enquiryForm}
                    setEnquiryForm={setEnquiryForm}
                    savingEnquiry={savingEnquiry}
                    onAddEnquiry={handleAddEnquiry}
                  />
                )}
                {detailTab === 'status' && (
                  <StatusTab
                    activeEnquiry={activeEnquiry}
                    activeStageAction={activeStageAction}
                    setActiveStageAction={(s: string) => { setActiveStageAction(s); setSubStage(''); setStageNotes(''); setStageLostReason('') }}
                    subStage={subStage}
                    setSubStage={setSubStage}
                    stageNotes={stageNotes}
                    setStageNotes={setStageNotes}
                    stageScheduledAt={stageScheduledAt}
                    setStageScheduledAt={setStageScheduledAt}
                    stageLostReason={stageLostReason}
                    setStageLostReason={setStageLostReason}
                    bookingName={bookingName}
                    setBookingName={setBookingName}
                    bookingDate={bookingDate}
                    setBookingDate={setBookingDate}
                    agreementValue={agreementValue}
                    setAgreementValue={setAgreementValue}
                    savingStage={savingStage}
                    onSave={handleStageChange}
                  />
                )}
                {detailTab === 'history' && <HistoryTab activity={detail?.activity || []} />}
                {detailTab === 'notes' && (
                  <NotesTab
                    activity={detail?.activity || []}
                    noteText={noteText}
                    setNoteText={setNoteText}
                    savingNote={savingNote}
                    onSave={handleSaveNote}
                  />
                )}
                {detailTab === 'document' && <DocumentTab />}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <AddLeadModal
          user={user}
          onClose={() => setShowAddLead(false)}
          onSuccess={(leadId: string) => {
            setShowAddLead(false)
            onReload()
            showToast(`Lead ${leadId} created`)
          }}
        />
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

function EnquiriesTab({ enquiries, showAddEnquiry, setShowAddEnquiry, enquiryForm, setEnquiryForm, savingEnquiry, onAddEnquiry }: any) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Enquiries ({enquiries.length})</h3>
        <button onClick={() => setShowAddEnquiry(true)} className="text-xs text-[#422D83] hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {enquiries.length === 0 && !showAddEnquiry && (
        <p className="text-xs text-gray-400 py-4 text-center">No enquiries yet</p>
      )}

      {enquiries.map((enq: any) => (
        <div key={enq.enquiry_id} className={`border rounded-lg p-3 ${enq.status === 'active' ? 'border-[#422D83]/20 bg-[#422D83]/5' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700">{enq.enquiry_id}</p>
              {enq.property_type && (
                <p className="text-xs text-gray-500">{enq.property_type}{enq.location_pref ? ` · ${enq.location_pref}` : ''}</p>
              )}
              {(enq.min_budget > 0 || enq.max_budget > 0) && (
                <p className="text-xs text-gray-500">{enq.currency} {enq.min_budget ? enq.min_budget.toLocaleString() : '0'}–{enq.max_budget ? enq.max_budget.toLocaleString() : '?'}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(enq.created_at)}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${stageBadgeCls(enq.stage)}`}>
              {stageDisplayLabel(enq.stage || 'New')}
            </span>
          </div>
        </div>
      ))}

      {showAddEnquiry && (
        <div className="border border-[#422D83]/20 rounded-lg p-3 space-y-3 bg-[#422D83]/5">
          <p className="text-xs font-semibold text-[#422D83]">New Enquiry</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
              <select value={enquiryForm.propertyType} onChange={e => setEnquiryForm((p: any) => ({ ...p, propertyType: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {PROPERTY_TYPES_V2.map(pt => <option key={pt}>{pt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Purpose</label>
              <select value={enquiryForm.purpose} onChange={e => setEnquiryForm((p: any) => ({ ...p, purpose: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {PURPOSE_OPTIONS_V2.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Location Preference</label>
            <input type="text" value={enquiryForm.locationPref} onChange={e => setEnquiryForm((p: any) => ({ ...p, locationPref: e.target.value }))} className={inputCls} placeholder="Area / locality" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Min Budget</label>
              <input type="number" value={enquiryForm.minBudget} onChange={e => setEnquiryForm((p: any) => ({ ...p, minBudget: e.target.value }))} className={inputCls} placeholder="Min" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Max Budget</label>
              <input type="number" value={enquiryForm.maxBudget} onChange={e => setEnquiryForm((p: any) => ({ ...p, maxBudget: e.target.value }))} className={inputCls} placeholder="Max" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onAddEnquiry} disabled={savingEnquiry} className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1">
              {savingEnquiry ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
            <button onClick={() => setShowAddEnquiry(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">Cancel</button>
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
      {/* Current status */}
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

      {/* Stage action buttons */}
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

      {/* Action form */}
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

// ─── Add Lead Modal ───────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onSuccess, user }: {
  onClose: () => void
  onSuccess: (leadId: string) => void
  user: any
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

  async function checkDup() {
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
      const res = await fetch('/api/crm/v2/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.duplicate && !forceAdd) { setDupWarning(data.existingLead); setSaving(false); return }
      if (data.success) onSuccess(data.leadId)
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
          <h2 className="font-bold text-gray-900">Add New Lead</h2>
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

          {['Buyer', 'Both'].includes(form.leadType) && (
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
            Save Lead
          </button>
        </div>
      </div>
    </div>
  )
}
