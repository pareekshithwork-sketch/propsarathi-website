'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Users, Building2, Phone, Calendar, Plus, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface Enquiry {
  enquiry_id: number
  name: string
  phone: string
  city: string
  property_interest: string
  stage: string
  created_at: string
}

interface Listing {
  listing_id: number
  owner_name: string
  phone: string
  city: string
  property_type: string
  status: string
  created_at: string
}

const STAGE_COLORS: Record<string, string> = {
  New:                      'bg-blue-100 text-blue-700',
  Callback:                 'bg-amber-100 text-amber-700',
  'Schedule Meeting':       'bg-indigo-100 text-indigo-700',
  'Schedule Site Visit':    'bg-purple-100 text-purple-700',
  'Expression Of Interest': 'bg-orange-100 text-orange-700',
  Book:                     'bg-violet-100 text-violet-700',
  'Not Interested':         'bg-gray-100 text-gray-600',
  Drop:                     'bg-red-100 text-red-700',
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Penthouse', 'Townhouse', 'Other']
const COUNTRY_CODES = ['+91', '+971', '+1', '+44', '+65', '+60', '+966', '+61']

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PartnerReferralsPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'enquiries' | 'listings'>('enquiries')
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('refer') === '1')

  // Submit form state
  const [form, setForm] = useState({
    clientName: '', phone: '', countryCode: '+91',
    email: '', city: '', propertyType: '', budget: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function loadReferrals() {
    setLoading(true)
    fetch('/api/partner/referrals')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEnquiries(d.enquiries || [])
          setListings(d.listings || [])
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReferrals() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientName.trim() || !form.phone.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/partner/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ message: 'Referral submitted successfully!', type: 'success' })
        setForm({ clientName: '', phone: '', countryCode: '+91', email: '', city: '', propertyType: '', budget: '', notes: '' })
        setShowForm(false)
        loadReferrals()
      } else {
        setToast({ message: data.message || 'Failed to submit referral', type: 'error' })
      }
    } catch {
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + Submit CTA */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Referrals</h1>
          <p className="text-sm text-gray-500">Track all clients you have referred</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Refer a Client
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('enquiries')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'enquiries' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setTab('listings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'listings' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Listings ({listings.length})
        </button>
      </div>

      {/* Enquiries tab */}
      {tab === 'enquiries' && (
        <div className="space-y-3">
          {enquiries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600 mb-1">No enquiries yet</p>
              <p className="text-xs text-gray-400 mb-4">Refer your first client to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Refer a Client
              </button>
            </div>
          )}
          {enquiries.map((e) => (
            <div key={e.enquiry_id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {e.phone}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_COLORS[e.stage] || 'bg-gray-100 text-gray-600'}`}>
                  {e.stage}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{[e.city, e.property_interest].filter(Boolean).join(' · ') || '—'}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(e.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="space-y-3">
          {listings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600 mb-1">No listings yet</p>
              <p className="text-xs text-gray-400">Property listings you refer will appear here</p>
            </div>
          )}
          {listings.map((l) => (
            <div key={l.listing_id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{l.owner_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {l.phone}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {l.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{[l.city, l.property_type].filter(Boolean).join(' · ') || '—'}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(l.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Referral Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Refer a Client</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Client Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Country Code</label>
                  <select
                    value={form.countryCode}
                    onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Dubai"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Budget</label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="e.g. ₹1.5 Cr or AED 2M"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Any context about the client's requirements…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>
            </form>
            <div className="flex gap-3 px-5 pb-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.clientName.trim() || !form.phone.trim()}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Referral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 max-w-xs ${toast.type === 'success' ? 'bg-green-700' : 'bg-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
