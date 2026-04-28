'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Users, AlertCircle, Clock, ArrowLeft, Edit2, Trash2,
  Phone, MessageCircle, Mail, Calendar, Check, Loader2,
  MoreHorizontal, X,
} from 'lucide-react'
import type { Lead, HistoryEntry } from '../types'
import { CALLBACK_SUBS, MEETING_SUBS, SITE_VISIT_SUBS, NOT_INTERESTED_SUBS, DROP_SUBS, EOI_SUBS, STATUS_DOT } from '../constants'
import { TagBadge, StatusBadge, RMInitial } from './shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(d: string): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch { return d }
}

function mapV2ToLead(v2: any): Lead {
  return {
    leadId: v2.lead_id || '',
    clientName: v2.name || '',
    phone: v2.phone || '',
    countryCode: v2.country_code || '+91',
    altPhone: v2.alternate_phone || '',
    email: v2.email || '',
    source: v2.source || '',
    subSource: v2.sub_source || '',
    assignedRM: v2.assigned_rm || '',
    secondaryOwner: v2.secondary_rm || '',
    status: 'New',
    subStatus: '',
    tags: v2.tags || '',
    isDuplicate: v2.is_duplicate || false,
    isDeleted: v2.is_deleted || false,
    createdAt: v2.created_at ? new Date(v2.created_at).toLocaleString('en-IN') : '',
    lastUpdated: v2.updated_at ? new Date(v2.updated_at).toLocaleString('en-IN') : '',
    lastNote: '',
    notes: '',
    landline: '',
    partnerName: '',
    partnerId: '',
    referralName: v2.referral_name || '',
    referralPhone: v2.referral_phone || '',
    referralEmail: '',
    profession: '',
    company: '',
    designation: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    sourcingManager: '',
    closingManager: '',
    possessionDate: '',
    enquiredLocation: '',
    purpose: '',
    buyer: '',
    paymentPlan: '',
    affiliatePartner: v2.affiliate_name || '',
    carpetArea: '',
    saleableArea: '',
    enquiredFor: '',
    projectEnquired: '',
    scheduledAt: '',
    bookedName: '',
    bookedDate: '',
    agreementValue: '',
    propertyType: '',
    budget: '',
    minBudget: '',
    maxBudget: '',
    city: v2.customer_location || '',
  }
}

const V2_STAGE_TABS = [
  { id: 'All Active', label: 'All Active' },
  { id: 'New', label: 'New' },
  { id: 'Callback', label: 'Callback' },
  { id: 'Meeting', label: 'Meeting' },
  { id: 'Site Visit', label: 'Site Visit' },
  { id: 'EOI', label: 'EOI' },
  { id: 'Booked', label: 'Booked' },
  { id: 'Not Interested', label: 'Not Interested' },
  { id: 'Dropped', label: 'Drop' },
]

const TAG_COLORS: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700',
  Warm: 'bg-orange-100 text-orange-700',
  Cold: 'bg-blue-100 text-blue-700',
  Escalated: 'bg-purple-100 text-purple-700',
  Highlighted: 'bg-yellow-100 text-yellow-700',
}

// ─── Main LeadsView ────────────────────────────────────────────────────────────

export function LeadsView({
  leads, filteredLeads, selectedLead, leadHistory, detailTab, setDetailTab,
  leadFilter, setLeadFilter, activeLeadTab, setActiveLeadTab,
  showStatusAction, setShowStatusAction, selectedSubStatus, setSelectedSubStatus,
  statusNote, setStatusNote, statusSchedule, setStatusSchedule,
  bookingForm, setBookingForm, savingStatus,
  addNoteText, setAddNoteText, savingNote,
  onSelectLead, onEditLead, onDeleteLead, onSaveStatus, onSaveNote, onAddLead, user,
  useV2, setUseV2, v2Leads, showAddLeadV2, setShowAddLeadV2, onV2LeadsReload,
}: any) {

  const [v2StageTab, setV2StageTab] = useState('All Active')
  const [v2Toast, setV2Toast] = useState('')

  const filteredV2Leads = useMemo(() => {
    const active = (v2Leads || []).filter((l: any) => !l.is_deleted)
    if (v2StageTab === 'All Active') return active
    return active.filter((l: any) => (l.stage || 'New') === v2StageTab)
  }, [v2Leads, v2StageTab])

  function showToast(msg: string) {
    setV2Toast(msg)
    setTimeout(() => setV2Toast(''), 3000)
  }

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

  const v1Tabs = [
    { id: "All", label: "All" },
    { id: "New", label: "New" },
    { id: "Pending", label: "Pending" },
    { id: "Scheduled", label: "Scheduled" },
    { id: "Overdue", label: "Overdue" },
    { id: "EOI", label: "EOI" },
    { id: "Booked", label: "Booked" },
  ]

  const filters = ["All", "My Leads", "Team's", "Unassigned", "Duplicate", "Deleted"]

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const DONE_STATUSES = ['Booked', 'Dropped', 'Not Interested']
  const remindersToday = leads.filter((l: Lead) => {
    if (!l.scheduledAt || DONE_STATUSES.includes(l.status)) return false
    const d = new Date(l.scheduledAt); d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })
  const remindersOverdue = leads.filter((l: Lead) => {
    if (!l.scheduledAt || DONE_STATUSES.includes(l.status)) return false
    const d = new Date(l.scheduledAt); d.setHours(0, 0, 0, 0)
    return d < today
  })

  const listCount = useV2 ? filteredV2Leads.length : filteredLeads.length

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Lead list ── */}
      <div className={`${selectedLead ? "w-96 flex-shrink-0" : "flex-1"} flex flex-col border-r border-gray-200 bg-white overflow-hidden`}>

        {/* Follow-up reminders banner (v1 only) */}
        {!useV2 && (remindersToday.length > 0 || remindersOverdue.length > 0) && (
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
          {useV2 ? (
            /* v2 stage tabs */
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {V2_STAGE_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setV2StageTab(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                    v2StageTab === tab.id
                      ? "bg-[#422D83] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            /* v1 tabs + filter row */
            <>
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {v1Tabs.map(tab => (
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
            </>
          )}
        </div>

        {/* Count row + toggle pill */}
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50 flex items-center justify-between">
          <span>{listCount} leads</span>
          <button
            onClick={() => setUseV2((v: boolean) => !v)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              useV2
                ? 'bg-[#422D83] text-white border-[#422D83]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#422D83]'
            }`}
          >
            {useV2 ? '✓ New CRM' : 'Switch to New CRM'}
          </button>
        </div>

        {/* Lead list */}
        <div className={`flex-1 overflow-y-auto ${useV2 ? 'overflow-x-auto' : ''}`}>
          {useV2 ? (
            /* ── v2 list ── */
            filteredV2Leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No leads found</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-3 py-2 w-48 font-medium">Lead</th>
                    <th className="text-left px-2 py-2 w-40 font-medium">Modified</th>
                    <th className="text-left px-2 py-2 w-36 font-medium">Phone</th>
                    <th className="text-left px-2 py-2 w-20 font-medium">Enquiries</th>
                    <th className="text-left px-2 py-2 w-28 font-medium">Source</th>
                    <th className="text-left px-2 py-2 w-32 font-medium">Tags</th>
                    <th className="px-2 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredV2Leads.map((lead: any) => {
                    const tags = lead.tags
                      ? lead.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                      : []
                    const phoneClean = (lead.country_code || '+91').replace('+', '') + (lead.phone || '')
                    const waMsg = encodeURIComponent(
                      `Hi ${lead.name}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`
                    )
                    return (
                      <tr
                        key={lead.lead_id || lead.id}
                        onClick={() => onSelectLead(mapV2ToLead(lead))}
                        className="border-b border-gray-100 hover:bg-purple-50/30 cursor-pointer transition-colors"
                      >
                        {/* Col 1: Lead name */}
                        <td className="px-3 py-3 w-48">
                          <div className="flex items-start gap-2">
                            <div className="w-9 h-9 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {getInitials(lead.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{lead.name}</p>
                              <p className="text-xs text-gray-400">{lead.lead_id}</p>
                              {lead.is_duplicate && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 rounded font-bold">DC</span>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Col 2: Modified */}
                        <td className="px-2 py-3 w-40">
                          <p className="text-sm text-gray-700 truncate">{lead.assigned_rm || '—'}</p>
                          <p className="text-xs text-gray-400">At {formatDate(lead.updated_at)}</p>
                        </td>
                        {/* Col 3: Phone */}
                        <td className="px-2 py-3 w-36">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${lead.country_code || '+91'}${lead.phone}`}
                              onClick={e => e.stopPropagation()}
                              className="text-gray-500 hover:text-blue-600"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <span className="text-xs text-gray-600 truncate max-w-[72px]">{lead.phone}</span>
                            <a
                              href={`https://wa.me/${phoneClean}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-green-600 hover:text-green-700"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        {/* Col 4: Enquiries */}
                        <td className="px-2 py-3 w-20">
                          {Number(lead.active_enquiry_count) > 0 ? (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              {lead.active_enquiry_count}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">0</span>
                          )}
                        </td>
                        {/* Col 5: Source */}
                        <td className="px-2 py-3 w-28">
                          <span className="text-sm text-gray-600 truncate block max-w-[104px]">{lead.source || '—'}</span>
                        </td>
                        {/* Col 6: Tags */}
                        <td className="px-2 py-3 w-32">
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag: string) => (
                              <span
                                key={tag}
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Col 7: Actions */}
                        <td className="px-2 py-3 w-10" onClick={e => e.stopPropagation()}>
                          <button className="text-gray-300 hover:text-gray-600 p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : (
            /* ── v1 list ── */
            filteredLeads.length === 0 ? (
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
                    const waMsg = encodeURIComponent(
                      `Hi ${lead.clientName}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`
                    )
                    const waNum = (lead.countryCode || '+91').replace('+', '') + lead.phone
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
                            <a
                              href={`tel:${lead.countryCode}${lead.phone}`}
                              onClick={e => e.stopPropagation()}
                              className="hover:text-blue-500"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <span>{lead.countryCode} {lead.phone}</span>
                            <a
                              href={`https://wa.me/${waNum}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-green-500 hover:text-green-600 ml-0.5"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                            {lead.altPhone && <span className="text-gray-400 ml-0.5">· {lead.altPhone}</span>}
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
            )
          )}
        </div>
      </div>

      {/* ── Right: Lead detail panel ── */}
      {selectedLead && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
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
              onClick={() => window.open(`https://wa.me/${(selectedLead.countryCode || '+91').replace('+', '')}${selectedLead.phone}?text=${encodeURIComponent(`Hi ${selectedLead.clientName}, this is ${user?.name || 'PropSarathi Team'} from PropSarathi.`)}`)}
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

      {/* v2 Add Lead Modal */}
      {showAddLeadV2 && (
        <AddLeadV2Modal
          user={user}
          onClose={() => setShowAddLeadV2(false)}
          onSuccess={(leadId: string) => {
            setShowAddLeadV2(false)
            onV2LeadsReload?.()
            showToast(`Lead ${leadId} created`)
          }}
        />
      )}

      {/* Toast */}
      {v2Toast && (
        <div className="fixed bottom-6 right-6 bg-[#422D83] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-[60]">
          {v2Toast}
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

      {lead.lastNote && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">Last Note</p>
          <p className="text-xs text-gray-700">{lead.lastNote}</p>
        </div>
      )}

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

// ─── Add Lead V2 Modal ─────────────────────────────────────────────────────────

const SOURCES_V2 = ['Direct', 'Website', 'Referral', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'Affiliate', 'Other']
const PROPERTY_TYPES_V2 = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Other']
const PURPOSE_OPTIONS_V2 = ['Investment', 'Self Use', 'Rental']
const TAG_OPTIONS_V2 = ['Hot', 'Warm', 'Cold', 'Escalated', 'Highlighted']
const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4+']
const LEAD_TYPES = ['Buyer', 'Seller', 'Both']

const TAG_PILL_COLORS: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700 border-red-200',
  Warm: 'bg-orange-100 text-orange-700 border-orange-200',
  Cold: 'bg-blue-100 text-blue-700 border-blue-200',
  Escalated: 'bg-purple-100 text-purple-700 border-purple-200',
  Highlighted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

function AddLeadV2Modal({ onClose, onSuccess, user }: {
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

  useEffect(() => {
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
        const match = data.leads.find((l: any) =>
          l.phone.replace(/\D/g, '').slice(-10) === clean
        )
        setDupWarning(match || null)
      } else {
        setDupWarning(null)
      }
    } catch {}
    setCheckingDup(false)
  }

  function toggleTag(tag: string) {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) return
    setSaving(true)
    try {
      const body: Record<string, any> = {
        name: form.name,
        phone: form.phone,
        countryCode: form.countryCode,
        alternatePhone: form.alternatePhone,
        email: form.email,
        source: form.source,
        subSource: form.subSource,
        assignedRm: form.assignedRm,
        customerLocation: form.customerLocation,
        leadType: form.leadType,
        tags: form.tags.join(','),
        forceInsert: forceAdd,
      }

      if (['Buyer', 'Both'].includes(form.leadType)) {
        body.projectInterest = form.projectInterest
        body.propertyType = form.propertyType
        body.minBudget = form.minBudget
        body.maxBudget = form.maxBudget
        body.budgetCurrency = form.budgetCurrency
        body.bedrooms = form.bedrooms
        body.locationPreference = form.locationPreference
        body.purpose = form.purpose
      }

      const res = await fetch('/api/crm/v2/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.duplicate && !forceAdd) {
        setDupWarning(data.existingLead)
        setSaving(false)
        return
      }

      if (data.success) {
        onSuccess(data.leadId)
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

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-200 z-10">
          <h2 className="font-bold text-gray-900 text-base">Add New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* ── Lead Info section ── */}
          <h3 className="text-xs font-bold text-[#422D83] uppercase tracking-wider">Lead Info</h3>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={inputCls}
              placeholder="Full name"
            />
          </div>

          {/* Primary Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Primary Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.countryCode}
                onChange={e => setForm(p => ({ ...p, countryCode: e.target.value }))}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-28"
              >
                <option value="+91">+91 IN</option>
                <option value="+971">+971 AE</option>
                <option value="+1">+1 US</option>
                <option value="+44">+44 UK</option>
                <option value="+65">+65 SG</option>
                <option value="+61">+61 AU</option>
              </select>
              <div className="flex-1 relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setDupWarning(null); setForceAdd(false) }}
                  onBlur={checkDup}
                  className={inputCls}
                  placeholder="Phone number"
                />
                {checkingDup && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
            {dupWarning && !forceAdd && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
                <p className="font-semibold">⚠️ Lead exists: {dupWarning.name} — {dupWarning.assigned_rm || 'Unassigned'}</p>
                <div className="flex gap-3 mt-1.5">
                  <button
                    type="button"
                    className="text-blue-600 underline font-medium"
                    onClick={() => setDupWarning(null)}
                  >
                    View Existing
                  </button>
                  <button
                    type="button"
                    className="text-yellow-700 underline font-semibold"
                    onClick={() => { setForceAdd(true); setDupWarning(null) }}
                  >
                    Add Anyway
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alternate Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Number</label>
            <input
              type="tel"
              value={form.alternatePhone}
              onChange={e => setForm(p => ({ ...p, alternatePhone: e.target.value }))}
              className={inputCls}
              placeholder="Optional"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={inputCls}
              placeholder="Optional"
            />
          </div>

          {/* Source + Sub-Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Source <span className="text-red-500">*</span>
              </label>
              <select
                value={form.source}
                onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                className={inputCls}
              >
                {SOURCES_V2.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sub-Source</label>
              <input
                type="text"
                value={form.subSource}
                onChange={e => setForm(p => ({ ...p, subSource: e.target.value }))}
                className={inputCls}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Primary RM */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Primary RM</label>
            <select
              value={form.assignedRm}
              onChange={e => setForm(p => ({ ...p, assignedRm: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select RM…</option>
              {rms.map(rm => <option key={rm.id} value={rm.name}>{rm.name}</option>)}
            </select>
          </div>

          {/* Customer Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Location</label>
            <input
              type="text"
              value={form.customerLocation}
              onChange={e => setForm(p => ({ ...p, customerLocation: e.target.value }))}
              className={inputCls}
              placeholder="City / Area"
            />
          </div>

          {/* Lead Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Lead Type</label>
            <div className="flex gap-2">
              {LEAD_TYPES.map(lt => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, leadType: lt }))}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.leadType === lt
                      ? 'bg-[#422D83] text-white border-[#422D83]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS_V2.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    form.tags.includes(tag)
                      ? TAG_PILL_COLORS[tag] || 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── Enquiry Info (Buyer / Both) ── */}
          {['Buyer', 'Both'].includes(form.leadType) && (
            <>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-4">Enquiry Info</h3>
              </div>

              {/* Project of Interest */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Project of Interest</label>
                <input
                  type="text"
                  value={form.projectInterest}
                  onChange={e => setForm(p => ({ ...p, projectInterest: e.target.value }))}
                  className={inputCls}
                  placeholder="Project name"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={e => setForm(p => ({ ...p, propertyType: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {PROPERTY_TYPES_V2.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Budget</label>
                  <div className="flex gap-1">
                    <select
                      value={form.budgetCurrency}
                      onChange={e => setForm(p => ({ ...p, budgetCurrency: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none w-16 flex-shrink-0"
                    >
                      <option>INR</option>
                      <option>AED</option>
                    </select>
                    <input
                      type="number"
                      value={form.minBudget}
                      onChange={e => setForm(p => ({ ...p, minBudget: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
                      placeholder="Min"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Budget</label>
                  <input
                    type="number"
                    value={form.maxBudget}
                    onChange={e => setForm(p => ({ ...p, maxBudget: e.target.value }))}
                    className={inputCls}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Bedrooms</label>
                <div className="flex gap-2">
                  {BEDROOM_OPTIONS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, bedrooms: b }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        form.bedrooms === b
                          ? 'bg-[#422D83] text-white border-[#422D83]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Preference */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location Preference</label>
                <input
                  type="text"
                  value={form.locationPreference}
                  onChange={e => setForm(p => ({ ...p, locationPreference: e.target.value }))}
                  className={inputCls}
                  placeholder="Area / Locality"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  value={form.purpose}
                  onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {PURPOSE_OPTIONS_V2.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !form.name.trim() || !form.phone.trim()}
            className="px-5 py-2 text-sm bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Lead
          </button>
        </div>
      </div>
    </div>
  )
}
