'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Loader2, Phone, MessageCircle, Search, Plus,
  X, Check, Home, MapPin, ChevronDown,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'rm_verified', label: 'RM Verified' },
  { id: 'admin_approved', label: 'Admin Approved' },
  { id: 'live', label: 'Live' },
]

const LISTING_STATUS_BADGE: Record<string, string> = {
  pending:        'bg-gray-100 text-gray-600',
  rm_verified:    'bg-blue-100 text-blue-700',
  admin_approved: 'bg-purple-100 text-purple-700',
  live:           'bg-green-100 text-green-700',
}

const LISTING_STATUS_LABEL: Record<string, string> = {
  pending:        'Pending',
  rm_verified:    'RM Verified',
  admin_approved: 'Admin Approved',
  live:           'Live',
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Studio', 'Other']
const BEDROOM_OPTS = ['1', '2', '3', '4', '4+']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatPrice(price: number, currency: string): string {
  if (!price || price <= 0) return '—'
  if (currency === 'AED') return `AED ${Number(price).toLocaleString('en-IN')}`
  return `₹${Number(price).toLocaleString('en-IN')}`
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ListingsView({ user }: { user: any }) {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [city, setCity] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [toast, setToast] = useState('')

  // Status update inline state
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updatingLoading, setUpdatingLoading] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (city) params.set('city', city)
      if (propertyType) params.set('propertyType', propertyType)
      const res = await fetch(`/api/crm/v2/listings?${params}`)
      const data = await res.json()
      if (data.success) setListings(data.listings || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, city, propertyType])

  useEffect(() => { loadListings() }, [loadListings])

  async function updateListingStatus(listingId: string, newStatus: string) {
    setUpdatingLoading(true)
    try {
      const res = await fetch(`/api/crm/v2/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setUpdatingId(null)
      showToast(`Status updated to ${LISTING_STATUS_LABEL[newStatus] || newStatus}`)
      loadListings()
    } catch (e: any) {
      showToast(e.message || 'Error updating status')
    } finally {
      setUpdatingLoading(false)
    }
  }

  function getNextStatuses(currentStatus: string, isAdmin: boolean): { value: string; label: string }[] {
    if (currentStatus === 'pending') return [{ value: 'rm_verified', label: 'Mark RM Verified' }]
    if (currentStatus === 'rm_verified' && isAdmin) return [{ value: 'admin_approved', label: 'Admin Approve' }]
    if (currentStatus === 'admin_approved' && isAdmin) return [{ value: 'live', label: 'Go Live' }]
    return []
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#422D83] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#422D83]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-40"
              />
            </div>

            {/* Property Type */}
            <div className="relative">
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white appearance-none"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* City */}
            <input
              type="text"
              placeholder="City…"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-24"
            />

            {/* Refresh */}
            <button onClick={loadListings} className="text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Add Listing */}
            <button
              onClick={() => setShowAddPanel(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-50 flex-shrink-0">
        {loading ? 'Loading…' : `${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Card grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Home className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No listings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {listings.map((ls: any) => {
                const statusCls = LISTING_STATUS_BADGE[ls.status] || 'bg-gray-100 text-gray-600'
                const statusLabel = LISTING_STATUS_LABEL[ls.status] || ls.status || 'Pending'
                const phoneClean = (ls.lead_country_code || '+91').replace('+', '') + (ls.lead_phone || '')
                const nextStatuses = getNextStatuses(ls.status, isAdmin)
                const isUpdating = updatingId === ls.listing_id

                return (
                  <div key={ls.listing_id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-gray-400">{ls.listing_id}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusCls}`}>{statusLabel}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">{ls.title || 'Untitled'}</p>
                      </div>
                      <Home className="w-8 h-8 text-gray-100 flex-shrink-0 mt-1" />
                    </div>

                    {/* Details */}
                    <div className="space-y-1 mb-3">
                      {(ls.property_type || ls.bedrooms > 0) && (
                        <p className="text-xs text-gray-600">{ls.bedrooms > 0 ? `${ls.bedrooms} BHK ` : ''}{ls.property_type}</p>
                      )}
                      {(ls.locality || ls.city) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[ls.locality, ls.city].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {ls.asking_price > 0 && (
                        <p className="text-xs font-semibold text-gray-800">
                          {formatPrice(ls.asking_price, ls.currency)}
                          {ls.area_sqft > 0 && <span className="text-gray-400 font-normal ml-1">· {Number(ls.area_sqft).toLocaleString()} sqft</span>}
                        </p>
                      )}
                    </div>

                    {/* Lead info */}
                    <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Lead: <span className="text-gray-700 font-medium">{ls.lead_name}</span></p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a href={`tel:${ls.lead_country_code || '+91'}${ls.lead_phone}`} className="text-gray-400 hover:text-blue-600">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Status update */}
                    {nextStatuses.length > 0 && (
                      <div className="mt-3">
                        {isUpdating ? (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-600">Move to:</p>
                            {nextStatuses.map(ns => (
                              <button
                                key={ns.value}
                                onClick={() => updateListingStatus(ls.listing_id, ns.value)}
                                disabled={updatingLoading}
                                className="text-xs px-2.5 py-1 bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-1"
                              >
                                {updatingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                {ns.label}
                              </button>
                            ))}
                            <button
                              onClick={() => setUpdatingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setUpdatingId(ls.listing_id)}
                            className="text-xs px-2.5 py-1 border border-gray-300 text-gray-600 rounded-lg hover:border-[#422D83] hover:text-[#422D83] transition-colors"
                          >
                            Update Status
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Listing Slide-In Panel */}
        {showAddPanel && (
          <AddListingPanel
            user={user}
            onClose={() => setShowAddPanel(false)}
            onSuccess={() => { setShowAddPanel(false); showToast('Listing added'); loadListings() }}
          />
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

// ─── Add Listing Panel ────────────────────────────────────────────────────────

function AddListingPanel({ user, onClose, onSuccess }: {
  user: any
  onClose: () => void
  onSuccess: () => void
}) {
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  const [leadSearch, setLeadSearch] = useState('')
  const [leadResults, setLeadResults] = useState<any[]>([])
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [leadSearchLoading, setLeadSearchLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    propertyType: '',
    city: '',
    locality: '',
    address: '',
    bedrooms: '2',
    bathrooms: '',
    areaSqft: '',
    floorNumber: '',
    totalFloors: '',
    possessionStatus: 'Ready to Move',
    askingPrice: '',
    currency: 'INR',
    sellerNotes: '',
  })
  const [saving, setSaving] = useState(false)

  const showBedrooms = !['Plot', 'Commercial', 'Office'].includes(form.propertyType)

  async function searchLeads(q: string) {
    if (q.length < 2) { setLeadResults([]); return }
    setLeadSearchLoading(true)
    try {
      const res = await fetch(`/api/crm/v2/leads?search=${encodeURIComponent(q)}&limit=10`)
      const data = await res.json()
      if (data.leads) setLeadResults(data.leads)
    } catch {}
    setLeadSearchLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(() => searchLeads(leadSearch), 300)
    return () => clearTimeout(t)
  }, [leadSearch])

  async function handleSave() {
    if (!selectedLead || !form.title.trim() || !form.city.trim()) return
    setSaving(true)
    try {
      const body: Record<string, any> = {
        leadId: selectedLead.lead_id,
        title: form.title,
        propertyType: form.propertyType,
        city: form.city,
        locality: form.locality,
        address: form.address,
        bedrooms: form.bedrooms && showBedrooms ? Number(form.bedrooms) : 0,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
        areaSqft: form.areaSqft ? Number(form.areaSqft) : 0,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : 0,
        currency: form.currency,
        sellerNotes: form.sellerNotes,
      }
      const res = await fetch('/api/crm/v2/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onSuccess()
    } catch (e: any) {
      alert(e.message || 'Error saving listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-[480px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-bold text-gray-900">Add Listing</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Lead Section */}
        <div>
          <p className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-3">Lead</p>
          {selectedLead ? (
            <div className="flex items-center gap-2 p-2.5 bg-purple-50 border border-[#422D83]/20 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#422D83]/10 text-[#422D83] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {getInitials(selectedLead.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{selectedLead.name}</p>
                <p className="text-xs text-gray-500">{selectedLead.phone} · {selectedLead.lead_id}</p>
              </div>
              <button onClick={() => { setSelectedLead(null); setLeadSearch('') }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lead by name or phone…"
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-full"
                />
                {leadSearchLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
              </div>
              {leadResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {leadResults.map((lead: any) => (
                    <button
                      key={lead.lead_id}
                      onClick={() => { setSelectedLead(lead); setLeadSearch(''); setLeadResults([]) }}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.phone} · {lead.lead_id}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basic Section */}
        <div>
          <p className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-3">Basic Info</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Property Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls}
                placeholder="e.g. 3BHK Flat, Indiranagar"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
              <div className="relative">
                <select
                  value={form.propertyType}
                  onChange={e => setForm(p => ({ ...p, propertyType: e.target.value }))}
                  className={inputCls + ' appearance-none pr-8'}
                >
                  <option value="">Select…</option>
                  {['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Studio', 'Other'].map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="City" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Locality / Area</label>
                <input type="text" value={form.locality} onChange={e => setForm(p => ({ ...p, locality: e.target.value }))} className={inputCls} placeholder="Area" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className={inputCls + ' resize-none'}
                rows={2}
                placeholder="Full address"
              />
            </div>
          </div>
        </div>

        {/* Property Details Section */}
        <div>
          <p className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-3">Property Details</p>
          <div className="space-y-3">
            {showBedrooms && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Bedrooms</label>
                <div className="flex gap-1.5 flex-wrap">
                  {BEDROOM_OPTS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, bedrooms: b }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.bedrooms === b ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))} className={inputCls} placeholder="2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Area (sqft)</label>
                <input type="number" value={form.areaSqft} onChange={e => setForm(p => ({ ...p, areaSqft: e.target.value }))} className={inputCls} placeholder="1200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                <input type="number" value={form.floorNumber} onChange={e => setForm(p => ({ ...p, floorNumber: e.target.value }))} className={inputCls} placeholder="3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Possession Status</label>
              <div className="flex gap-2">
                {['Ready to Move', 'Under Construction'].map(ps => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, possessionStatus: ps }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.possessionStatus === ps ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'}`}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div>
          <p className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-3">Financial</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Asking Price</label>
              <input type="number" value={form.askingPrice} onChange={e => setForm(p => ({ ...p, askingPrice: e.target.value }))} className={inputCls} placeholder="e.g. 5000000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Currency</label>
              <div className="flex gap-2">
                {['INR', 'AED'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, currency: c }))}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.currency === c ? 'bg-[#422D83] text-white border-[#422D83]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#422D83]'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <p className="text-xs font-bold text-[#422D83] uppercase tracking-wider mb-3">Notes</p>
          <textarea
            value={form.sellerNotes}
            onChange={e => setForm(p => ({ ...p, sellerNotes: e.target.value }))}
            className={inputCls + ' resize-none'}
            rows={3}
            placeholder="Seller notes, special conditions, etc."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-3 flex justify-end gap-3 flex-shrink-0">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !selectedLead || !form.title.trim() || !form.city.trim()}
          className="px-5 py-2 text-sm bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Listing
        </button>
      </div>
    </div>
  )
}
