'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw, X } from 'lucide-react'
import { ScopeToggle, type Scope } from '@/app/crm/components/ScopeToggle'
import { PartnersList } from '@/app/crm/components/PartnersList'
import { PartnerProfile } from '@/app/crm/components/PartnerProfile'

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'KYC Pending', 'Training Pending', 'Inactive', 'Suspended']
const PROFESSION_TYPES = ['Individual', 'Real Estate Broker', 'Corporate Employee', 'Financial Advisor', 'Interior Designer', 'NRI', 'Other']
const SOURCES = ['Self Registration', 'RM Added', 'Referral']

const EMPTY_FORM = {
  name: '', phone: '', countryCode: '+91', alternatePhone: '', email: '',
  professionType: 'Individual', companyName: '', designation: '', experienceYears: '',
  city: '', locality: '', areasCovered: '',
  assignedRmName: '', source: 'RM Added', referrerPartnerId: '',
  status: 'Pending', internalNotes: '',
}

export function PartnersView({ user }: { user: any }) {
  const [partners, setPartners] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<Scope>(() => {
    try { return (localStorage.getItem('crm_scope_preference') as Scope) || 'my' } catch { return 'my' }
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [rms, setRms] = useState<any[]>([])

  function showMsg(m: string) { setToast(m); setTimeout(() => setToast(''), 3500) }

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ scope, limit: '100', offset: '0' })
      if (search) params.set('search', search)
      if (statusFilter !== 'All') params.set('status', statusFilter)
      const res = await fetch(`/api/crm/v2/partners?${params}`, { credentials: 'include' })
      const d = await res.json()
      if (d.success) { setPartners(d.partners); setTotal(d.total) }
    } catch {}
    finally { setLoading(false) }
  }, [scope, search, statusFilter])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  useEffect(() => {
    fetch('/api/crm/v2/users', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.users) setRms(d.users.filter((u: any) => u.is_active)) })
      .catch(() => {})
  }, [])

  async function handleAddPartner() {
    if (!form.name || !form.phone) { showMsg('Name and phone are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/crm/v2/partners', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, countryCode: form.countryCode,
          alternatePhone: form.alternatePhone, email: form.email,
          professionType: form.professionType, companyName: form.companyName,
          designation: form.designation, experienceYears: Number(form.experienceYears) || 0,
          city: form.city, locality: form.locality, areasCovered: form.areasCovered,
          assignedRmName: form.assignedRmName, source: form.source,
          referrerPartnerId: form.referrerPartnerId,
          status: form.status, internalNotes: form.internalNotes,
        }),
      })
      const d = await res.json()
      if (d.success) {
        showMsg(`Partner ${d.partner.name} added — ID: ${d.partner.partner_id}`)
        setShowAdd(false)
        setForm(EMPTY_FORM)
        fetchPartners()
      } else showMsg(d.error || 'Error adding partner')
    } catch { showMsg('An error occurred') }
    finally { setSaving(false) }
  }

  const f = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: list panel */}
      <div className={`${selectedPartnerId ? 'w-[420px] flex-shrink-0' : 'flex-1'} flex flex-col bg-white border-r border-gray-200 overflow-hidden`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Partners</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{total}</span>
          <div className="flex-1" />
          <ScopeToggle scope={scope} role={user?.role || 'rm'} onChange={s => { setScope(s); try { localStorage.setItem('crm_scope_preference', s) } catch {} }} />
          <button onClick={fetchPartners} className="p-1.5 text-gray-400 hover:text-gray-600" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </button>
        </div>

        {/* Search + Status filters */}
        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, phone, ID…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" />
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${statusFilter === s ? 'bg-[#422D83] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <PartnersList partners={partners} loading={loading} onSelect={p => setSelectedPartnerId(p.partner_id)} />
      </div>

      {/* Right: profile panel */}
      {selectedPartnerId && (
        <PartnerProfile
          partnerId={selectedPartnerId}
          user={user}
          onClose={() => setSelectedPartnerId(null)}
          onUpdated={fetchPartners}
        />
      )}

      {/* Add Partner Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Add Partner</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-600 mb-1 block">Full Name *</label>
                    <input value={form.name} onChange={f('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" placeholder="Partner name" /></div>
                  <div><label className="text-xs text-gray-600 mb-1 block">Phone *</label>
                    <div className="flex gap-1">
                      <input value={form.countryCode} onChange={f('countryCode')} className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none" placeholder="+91" />
                      <input value={form.phone} onChange={f('phone')} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40" placeholder="Phone number" />
                    </div>
                  </div>
                </div>
                <div><label className="text-xs text-gray-600 mb-1 block">Email</label>
                  <input value={form.email} onChange={f('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="email@example.com" /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Alternate Phone</label>
                  <input value={form.alternatePhone} onChange={f('alternatePhone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Alternate number" /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Profession Type</label>
                  <select value={form.professionType} onChange={f('professionType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                    {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Company Name</label>
                  <input value={form.companyName} onChange={f('companyName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Company / firm name" /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">City</label>
                  <input value={form.city} onChange={f('city')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="City" /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Locality / Area</label>
                  <input value={form.locality} onChange={f('locality')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="e.g. Whitefield" /></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Assigned RM</label>
                  <select value={form.assignedRmName} onChange={f('assignedRmName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="">— Auto assign —</option>
                    {rms.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select></div>
                <div><label className="text-xs text-gray-600 mb-1 block">Source</label>
                  <select value={form.source} onChange={f('source')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
                {form.source === 'Referral' && (
                  <div><label className="text-xs text-gray-600 mb-1 block">Referrer Partner ID</label>
                    <input value={form.referrerPartnerId} onChange={f('referrerPartnerId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="PS-P-001" /></div>
                )}
                <div className="col-span-2"><label className="text-xs text-gray-600 mb-1 block">Internal Notes</label>
                  <textarea value={form.internalNotes} onChange={f('internalNotes')} rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none" placeholder="Internal notes (not visible to partner)" /></div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAddPartner} disabled={saving}
                className="flex-1 py-2.5 bg-[#422D83] hover:bg-[#321f6b] text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Add Partner
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
