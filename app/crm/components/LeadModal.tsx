'use client'

import React from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Lead } from '../types'
import { RM_LIST, SOURCE_OPTIONS } from '../constants'
import { FormField, Input, Select, Textarea } from './shared'
import { PhoneInput } from '@/components/PhoneInput'

export function LeadModal({ editingLead, leadForm, setLeadForm, addLeadTab, setAddLeadTab, savingLead, onSave, onClose }: any) {
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
                  <PhoneInput
                    value={leadForm.phone || ""}
                    onChange={v => upd("phone", v)}
                    countryCode={leadForm.countryCode || "+91"}
                    onCountryChange={v => upd("countryCode", v)}
                    placeholder="Phone number"
                  />
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
