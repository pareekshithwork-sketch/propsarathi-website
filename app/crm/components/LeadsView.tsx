'use client'

import React from 'react'
import {
  Users, AlertCircle, Clock, ArrowLeft, Edit2, Trash2,
  Phone, MessageCircle, Mail, Calendar, Check, Loader2,
} from 'lucide-react'
import type { Lead, HistoryEntry } from '../types'
import { CALLBACK_SUBS, MEETING_SUBS, SITE_VISIT_SUBS, NOT_INTERESTED_SUBS, DROP_SUBS, EOI_SUBS, STATUS_DOT } from '../constants'
import { TagBadge, StatusBadge, RMInitial } from './shared'

export function LeadsView({
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
