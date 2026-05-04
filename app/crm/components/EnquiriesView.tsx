'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  RefreshCw, Loader2, Phone, MessageCircle, Check, X,
  Calendar, Search, ChevronDown,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_TABS = [
  { id: '', label: 'All' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function stageBadgeCls(stage: string | null | undefined): string {
  if (!stage) return 'bg-gray-100 text-gray-500'
  return STAGE_BADGE[stage] || 'bg-gray-100 text-gray-600'
}

function stageDisplayLabel(stage: string | null | undefined): string {
  if (!stage) return 'New'
  return STAGE_LABEL[stage] || stage
}

function formatScheduled(dateStr: string | null | undefined): { text: string; cls: string } {
  if (!dateStr) return { text: '—', cls: 'text-gray-400' }
  const d = new Date(dateStr)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const text = d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  if (d < now) return { text, cls: 'text-red-600 font-medium' }
  if (d >= todayStart && d < todayEnd) return { text, cls: 'text-amber-600 font-medium' }
  return { text, cls: 'text-gray-600' }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EnquiriesView({ user, highlightId, onClearHighlight }: {
  user: any
  highlightId?: string
  onClearHighlight?: () => void
}) {
  const [rawEnquiries, setRawEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stageFilter, setStageFilter] = useState('')
  const [overdue, setOverdue] = useState(false)
  const [dueToday, setDueToday] = useState(false)
  const [search, setSearch] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [sort, setSort] = useState('updated_at')
  const [rms, setRms] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!highlightId) return
    setExpandedId(highlightId)
    const t = setTimeout(() => { if (onClearHighlight) onClearHighlight() }, 100)
    return () => clearTimeout(t)
  }, [highlightId, onClearHighlight])
  const [stageForm, setStageForm] = useState({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' })
  const [stageSaving, setStageSaving] = useState(false)
  const [toast, setToast] = useState('')

  const enquiries = useMemo(() => {
    if (!stageFilter) return rawEnquiries
    return rawEnquiries.filter((e: any) =>
      stageFilter === 'New' ? (!e.stage || e.stage === 'New') : e.stage === stageFilter
    )
  }, [rawEnquiries, stageFilter])

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    rawEnquiries.forEach((e: any) => {
      const s = e.stage || 'New'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [rawEnquiries])

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: 'all', limit: '500' })
      if (assignedTo) params.set('assignedTo', assignedTo)
      if (search) params.set('search', search)
      if (overdue) params.set('overdue', 'true')
      if (dueToday) params.set('dueToday', 'true')
      const res = await fetch(`/api/crm/v2/enquiries?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        let list: any[] = data.enquiries || []

        // Client-side overdue / due today filters (since API may not support them)
        if (overdue) {
          const now = new Date()
          list = list.filter((e: any) => e.scheduled_at && new Date(e.scheduled_at) < now && e.status === 'active')
        }
        if (dueToday) {
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          list = list.filter((e: any) => {
            if (!e.scheduled_at) return false
            const d = new Date(e.scheduled_at)
            return d >= todayStart && d < todayEnd
          })
        }
        if (search) {
          const q = search.toLowerCase()
          list = list.filter((e: any) => (e.lead_name || '').toLowerCase().includes(q))
        }
        if (assignedTo) {
          list = list.filter((e: any) => e.assigned_rm === assignedTo)
        }

        // Sort
        list.sort((a: any, b: any) => {
          if (sort === 'scheduled_at') {
            return (b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0) - (a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0)
          }
          if (sort === 'created_at') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        })

        setRawEnquiries(list)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [assignedTo, search, overdue, dueToday, sort])

  useEffect(() => { loadEnquiries() }, [loadEnquiries])

  useEffect(() => {
    fetch('/api/crm/v2/users', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.users) setRms(d.users) })
      .catch(() => {})
  }, [])

  async function handleSaveStage(enquiryId: string) {
    if (!stageForm.stage || !stageForm.notes.trim()) return
    const needsLostReason = ['Not Interested', 'Drop'].includes(stageForm.stage)
    if (needsLostReason && !stageForm.lostReason) return
    setStageSaving(true)
    try {
      const res = await fetch(`/api/crm/v2/enquiries/${enquiryId}/stage`, { credentials: 'include', 
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
      setExpandedId(null)
      setStageForm({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' })
      showToast(`Stage updated to ${stageDisplayLabel(stageForm.stage)}`)
      loadEnquiries()
    } catch (e: any) {
      showToast(e.message || 'Error saving stage')
    } finally {
      setStageSaving(false)
    }
  }

  const subStages = stageForm.stage ? (SUB_STAGES[stageForm.stage] || []) : []
  const needsSchedule = ['Callback', 'Schedule Meeting', 'Schedule Site Visit'].includes(stageForm.stage)
  const needsLostReason = ['Not Interested', 'Drop'].includes(stageForm.stage)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2.5 flex-shrink-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {STAGE_TABS.map(tab => {
              const count = tab.id === '' ? rawEnquiries.length : (stageCounts[tab.id] || 0)
              return (
                <button
                  key={tab.id}
                  onClick={() => setStageFilter(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                    stageFilter === tab.id
                      ? 'bg-[#422D83] text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#422D83]'
                  }`}
                >
                  {tab.label}{count > 0 ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Overdue toggle */}
            <button
              onClick={() => { setOverdue(p => !p); setDueToday(false) }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                overdue ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
              }`}
            >
              Overdue
            </button>

            {/* Due Today toggle */}
            <button
              onClick={() => { setDueToday(p => !p); setOverdue(false) }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                dueToday ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
              }`}
            >
              Due Today
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lead name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-44"
              />
            </div>

            {/* Assigned To */}
            <div className="relative">
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white appearance-none"
              >
                <option value="">All RMs</option>
                {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white appearance-none"
              >
                <option value="updated_at">Modified</option>
                <option value="scheduled_at">Scheduled</option>
                <option value="created_at">Created</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button onClick={loadEnquiries} className="text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-50 flex-shrink-0">
        {loading ? 'Loading…' : `${enquiries.length} enquir${enquiries.length !== 1 ? 'ies' : 'y'}`}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Calendar className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No enquiries found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-900 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">Lead Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-32">Enquiry ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-36">Project / Location</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-36">Budget</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-40">Stage</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-36">Scheduled</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide w-28">Assigned RM</th>
                <th className="px-3 py-3 w-32 text-left text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq: any) => {
                const phoneClean = (enq.lead_country_code || '+91').replace('+', '') + (enq.lead_phone || '')
                const isExpanded = expandedId === enq.enquiry_id
                const scheduled = formatScheduled(enq.scheduled_at)

                return (
                  <React.Fragment key={enq.enquiry_id}>
                    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-purple-50' : ''}`}>
                      {/* Lead Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(enq.lead_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs truncate">{enq.lead_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <a href={`tel:${enq.lead_country_code || '+91'}${enq.lead_phone}`} className="text-gray-400 hover:text-blue-600">
                                <Phone className="w-3 h-3" />
                              </a>
                              <span className="text-[10px] text-gray-400">{enq.lead_phone}</span>
                              <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Enquiry ID */}
                      <td className="px-3 py-3 w-32">
                        <p className="text-xs font-mono text-gray-500">{enq.enquiry_id}</p>
                        <p className="text-[10px] text-gray-400">{enq.lead_id}</p>
                      </td>

                      {/* Project / Location */}
                      <td className="px-3 py-3 w-36">
                        <p className="text-xs text-gray-700 truncate max-w-[130px]">{enq.property_type || '—'}</p>
                        {enq.location_pref && <p className="text-[10px] text-gray-400 truncate max-w-[130px]">{enq.location_pref}</p>}
                      </td>

                      {/* Budget */}
                      <td className="px-3 py-3 w-36">
                        {(enq.min_budget > 0 || enq.max_budget > 0) ? (
                          <p className="text-xs text-gray-700">
                            {enq.currency === 'AED' ? 'AED ' : '₹'}
                            {enq.min_budget ? Number(enq.min_budget).toLocaleString('en-IN') : '0'}
                            {' – '}
                            {enq.max_budget ? Number(enq.max_budget).toLocaleString('en-IN') : '?'}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">—</p>
                        )}
                      </td>

                      {/* Stage */}
                      <td className="px-3 py-3 w-40">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(enq.stage)}`}>
                          {stageDisplayLabel(enq.stage || 'New')}
                        </span>
                        {enq.sub_stage && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{enq.sub_stage}</p>
                        )}
                      </td>

                      {/* Scheduled */}
                      <td className="px-3 py-3 w-36">
                        <p className={`text-xs ${scheduled.cls}`}>{scheduled.text}</p>
                      </td>

                      {/* Assigned RM */}
                      <td className="px-3 py-3 w-28">
                        <p className="text-xs text-gray-600 truncate max-w-[100px]">{enq.assigned_rm || 'Unassigned'}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 w-32">
                        {enq.status === 'active' && (
                          <button
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedId(null)
                              } else {
                                setExpandedId(enq.enquiry_id)
                                setStageForm({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' })
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                              isExpanded
                                ? 'bg-[#422D83] text-white border-[#422D83]'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                            }`}
                          >
                            {isExpanded ? 'Cancel' : 'Change Stage'}
                          </button>
                        )}
                        {enq.status !== 'active' && (
                          <span className="text-xs text-gray-400 italic">{enq.status}</span>
                        )}
                      </td>
                    </tr>

                    {/* Inline stage changer */}
                    {isExpanded && (
                      <tr className="bg-purple-50 border-b border-purple-100">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold text-gray-700">Move to stage</p>

                            {/* Stage pills */}
                            <div className="flex flex-wrap gap-1.5">
                              {STAGE_ACTIONS.map(action => (
                                <button
                                  key={action.apiStage}
                                  onClick={() => setStageForm(p => ({
                                    ...p,
                                    stage: p.stage === action.apiStage ? '' : action.apiStage,
                                    subStage: '',
                                    lostReason: '',
                                  }))}
                                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${action.color} ${
                                    stageForm.stage === action.apiStage ? 'ring-2 ring-offset-1 ring-[#422D83]/30' : ''
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>

                            {/* Sub stages */}
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

                            {/* Scheduled datetime */}
                            {needsSchedule && (
                              <input
                                type="datetime-local"
                                value={stageForm.scheduledAt}
                                onChange={e => setStageForm(p => ({ ...p, scheduledAt: e.target.value }))}
                                className={inputCls}
                              />
                            )}

                            {/* Lost reason */}
                            {needsLostReason && (
                              <select
                                value={stageForm.lostReason}
                                onChange={e => setStageForm(p => ({ ...p, lostReason: e.target.value }))}
                                className={inputCls}
                              >
                                <option value="">Select reason…</option>
                                {(SUB_STAGES[stageForm.stage] || []).map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            )}

                            {/* Notes */}
                            <textarea
                              value={stageForm.notes}
                              onChange={e => setStageForm(p => ({ ...p, notes: e.target.value }))}
                              className={inputCls + ' resize-none'}
                              rows={2}
                              placeholder="Notes (required)…"
                            />

                            {/* Save / Cancel */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveStage(enq.enquiry_id)}
                                disabled={stageSaving || !stageForm.stage || !stageForm.notes.trim() || (needsLostReason && !stageForm.lostReason)}
                                className="px-3 py-1.5 bg-[#422D83] text-white text-xs rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1"
                              >
                                {stageSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Save
                              </button>
                              <button
                                onClick={() => { setExpandedId(null); setStageForm({ stage: '', subStage: '', notes: '', scheduledAt: '', lostReason: '' }) }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#422D83] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-[60]">
          {toast}
        </div>
      )}
    </div>
  )
}
