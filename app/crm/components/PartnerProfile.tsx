'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, Loader2, TrendingUp, Building2, Users, DollarSign, ChevronRight } from 'lucide-react'
import { TIER_COLORS } from '@/lib/partnerTier'

const STATUSES = ['Pending', 'KYC Pending', 'Training Pending', 'Active', 'Inactive', 'Suspended']
const GM_ROLES = ['gm', 'admin', 'super_admin']

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Active: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700',
    'KYC Pending': 'bg-blue-100 text-blue-700', 'Training Pending': 'bg-indigo-100 text-indigo-700',
    Inactive: 'bg-gray-100 text-gray-500', Suspended: 'bg-red-100 text-red-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
}

export function PartnerProfile({
  partnerId, user, onClose, onUpdated,
}: {
  partnerId: string
  user: any
  onClose: () => void
  onUpdated: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'enquiries' | 'listings' | 'commissions' | 'activity'>('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [toast, setToast] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [showCommForm, setShowCommForm] = useState(false)
  const [commForm, setCommForm] = useState({ dealValue: '', commType: 'percentage', commValue: '', split: '100', milestone: 'Booking', leadName: '' })

  const isGM = GM_ROLES.includes(user?.role)

  function showMsg(m: string) { setToast(m); setTimeout(() => setToast(''), 3000) }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/crm/v2/partners/${partnerId}`, { credentials: 'include' })
      const d = await res.json()
      if (d.success) {
        setData(d)
        setEditNotes(d.partner.internal_notes || '')
        setEditStatus(d.partner.status || '')
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [partnerId])

  async function saveOverview() {
    setSaving(true)
    try {
      const res = await fetch(`/api/crm/v2/partners/${partnerId}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: editNotes, status: editStatus }),
      })
      const d = await res.json()
      if (d.success) { showMsg('Saved'); load(); onUpdated() }
      else showMsg(d.error || 'Error')
    } catch { showMsg('Error') }
    finally { setSaving(false) }
  }

  async function sendInvite() {
    setInviteSending(true)
    try {
      const res = await fetch('/api/partner/auth/invite', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      })
      const d = await res.json()
      showMsg(d.success ? 'Invite email sent!' : d.error || 'Failed to send invite')
    } catch { showMsg('Failed to send invite') }
    finally { setInviteSending(false) }
  }

  async function toggleTraining() {
    if (!data) return
    const done = !data.partner.training_done
    await fetch(`/api/crm/v2/partners/${partnerId}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainingDone: done, trainingDoneAt: done ? new Date().toISOString() : null, trainingDoneBy: done ? user.name : '' }),
    })
    load(); onUpdated()
  }

  async function addCommission() {
    const dv = parseFloat(commForm.dealValue) || 0
    const cv = parseFloat(commForm.commValue) || 0
    const sp = parseFloat(commForm.split) || 100
    const res = await fetch(`/api/crm/v2/partners/${partnerId}/commissions`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealValue: dv, commissionType: commForm.commType, commissionValue: cv, splitPercentage: sp, milestone: commForm.milestone, leadName: commForm.leadName }),
    })
    const d = await res.json()
    if (d.success) { showMsg('Commission added'); setShowCommForm(false); setCommForm({ dealValue: '', commType: 'percentage', commValue: '', split: '100', milestone: 'Booking', leadName: '' }); load() }
    else showMsg(d.error || 'Error')
  }

  async function commissionAction(commissionId: string, action: 'approve' | 'paid') {
    const res = await fetch(`/api/crm/v2/partners/${partnerId}/commissions`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commissionId, action }),
    })
    const d = await res.json()
    if (d.success) { load(); onUpdated() } else showMsg(d.error || 'Error')
  }

  const p = data?.partner
  const calcAmount = () => {
    const dv = parseFloat(commForm.dealValue) || 0
    const cv = parseFloat(commForm.commValue) || 0
    const sp = parseFloat(commForm.split) || 100
    return commForm.commType === 'percentage' ? (dv * cv / 100 * sp / 100) : (cv * sp / 100)
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'enquiries', label: `Enquiries (${data?.enquiries?.length ?? 0})` },
    { id: 'listings', label: `Listings (${data?.listings?.length ?? 0})` },
    { id: 'commissions', label: `Commissions (${data?.commissions?.length ?? 0})` },
    { id: 'activity', label: 'Activity' },
  ] as const

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex-1 min-w-0">
          {p && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">{p.name}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{p.partner_id}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[p.tier] || TIER_COLORS.Bronze}`}>{p.tier}</span>
              <StatusBadge status={p.status} />
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'border-b-2 border-[#422D83] text-[#422D83]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* OVERVIEW */}
          {tab === 'overview' && p && (
            <>
              {/* Scorecard */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total Referred', value: data.stats.totalReferred, icon: Users },
                  { label: 'Bookings', value: data.stats.totalBookings, icon: TrendingUp },
                  { label: 'Conversion', value: `${data.stats.conversionRate}%`, icon: Building2 },
                  { label: 'Earned', value: `₹${Number(data.stats.totalCommissionEarned).toLocaleString('en-IN')}`, icon: DollarSign },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <s.icon className="w-4 h-4 text-[#422D83]" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Training */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" checked={!!p.training_done} onChange={toggleTraining}
                  className="rounded" id="training-done" />
                <label htmlFor="training-done" className="text-sm text-gray-700 cursor-pointer flex-1">Training completed</label>
                {p.training_done_at && <span className="text-xs text-gray-400">{new Date(p.training_done_at).toLocaleDateString()}</span>}
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Internal notes <span className="text-gray-400 font-normal">(not visible to partner)</span></label>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"
                  placeholder="Add internal notes…" />
              </div>

              <div className="flex gap-2">
                <button onClick={saveOverview} disabled={saving}
                  className="flex-1 py-2 bg-[#422D83] text-white rounded-lg text-sm font-medium hover:bg-[#321f6b] disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                </button>
                {data?.partner?.email && (
                  <button onClick={sendInvite} disabled={inviteSending}
                    className="flex-1 py-2 border border-[#422D83] text-[#422D83] rounded-lg text-sm font-medium hover:bg-violet-50 disabled:opacity-50 flex items-center justify-center gap-2">
                    {inviteSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send Invite
                  </button>
                )}
              </div>
            </>
          )}

          {/* ENQUIRIES */}
          {tab === 'enquiries' && (
            <div className="space-y-2">
              {(data?.enquiries || []).length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No enquiries referred yet</p>
                : (data.enquiries || []).map((e: any) => (
                  <div key={e.enquiry_id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{e.lead_name || e.lead_id}</span>
                      {e.partner_link_click && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">via link</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{e.stage}</span>
                      <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* LISTINGS */}
          {tab === 'listings' && (
            <div className="space-y-2">
              {(data?.listings || []).length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No listings referred yet</p>
                : (data.listings || []).map((l: any) => (
                  <div key={l.listing_id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800">{l.title || l.property_type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{l.lead_name} · {new Date(l.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
          )}

          {/* COMMISSIONS */}
          {tab === 'commissions' && (
            <div className="space-y-3">
              {/* Summary */}
              {data?.commissions?.length > 0 && (() => {
                const comms = data.commissions
                const pending = comms.filter((c: any) => c.status === 'Pending').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
                const approved = comms.filter((c: any) => c.status === 'Approved').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
                const paid = comms.filter((c: any) => c.status === 'Paid').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
                return (
                  <div className="grid grid-cols-3 gap-2">
                    {[{ l: 'Pending', v: pending, cls: 'text-yellow-600' }, { l: 'Approved', v: approved, cls: 'text-blue-600' }, { l: 'Paid', v: paid, cls: 'text-green-600' }].map(s => (
                      <div key={s.l} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className={`text-sm font-bold ${s.cls}`}>₹{s.v.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-500">{s.l}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {isGM && !showCommForm && (
                <button onClick={() => setShowCommForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm hover:border-[#422D83] hover:text-[#422D83] transition-colors">
                  + Add Commission
                </button>
              )}

              {showCommForm && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
                  <p className="text-xs font-semibold text-gray-700">New Commission</p>
                  <input placeholder="Lead name" value={commForm.leadName} onChange={e => setCommForm(f => ({ ...f, leadName: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none" />
                  <input type="number" placeholder="Deal value (₹)" value={commForm.dealValue} onChange={e => setCommForm(f => ({ ...f, dealValue: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none" />
                  <div className="flex gap-2">
                    <select value={commForm.commType} onChange={e => setCommForm(f => ({ ...f, commType: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none">
                      <option value="percentage">Percentage %</option>
                      <option value="flat">Flat ₹</option>
                    </select>
                    <input type="number" placeholder={commForm.commType === 'percentage' ? '% value' : '₹ amount'} value={commForm.commValue}
                      onChange={e => setCommForm(f => ({ ...f, commValue: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Split %" value={commForm.split} onChange={e => setCommForm(f => ({ ...f, split: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none" />
                    <select value={commForm.milestone} onChange={e => setCommForm(f => ({ ...f, milestone: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none">
                      <option value="Booking">Booking</option>
                      <option value="Registration">Registration</option>
                    </select>
                  </div>
                  {commForm.dealValue && commForm.commValue && (
                    <p className="text-xs text-[#422D83] font-semibold">Commission: ₹{calcAmount().toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={addCommission} className="flex-1 py-1.5 bg-[#422D83] text-white text-xs rounded hover:bg-[#321f6b]">Add</button>
                    <button onClick={() => setShowCommForm(false)} className="flex-1 py-1.5 bg-gray-200 text-gray-600 text-xs rounded">Cancel</button>
                  </div>
                </div>
              )}

              {(data?.commissions || []).map((c: any) => (
                <div key={c.commission_id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.lead_name || c.commission_id}</p>
                      <p className="text-xs text-gray-500">{c.milestone} · ₹{Number(c.commission_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.status === 'Paid' ? 'bg-green-100 text-green-700' : c.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  {isGM && c.status === 'Pending' && (
                    <button onClick={() => commissionAction(c.commission_id, 'approve')}
                      className="mt-2 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Approve</button>
                  )}
                  {isGM && c.status === 'Approved' && (
                    <button onClick={() => commissionAction(c.commission_id, 'paid')}
                      className="mt-2 text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Mark Paid</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ACTIVITY */}
          {tab === 'activity' && (
            <div className="space-y-2">
              {(data?.activity || []).length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
                : (data.activity || []).map((a: any) => (
                  <div key={a.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#422D83]/40 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">{a.title}</p>
                      {a.description && <p className="text-[10px] text-gray-400">{a.description}</p>}
                      <p className="text-[10px] text-gray-400">{a.performed_by} · {new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="absolute bottom-4 left-4 right-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg text-center">
          {toast}
        </div>
      )}
    </div>
  )
}
