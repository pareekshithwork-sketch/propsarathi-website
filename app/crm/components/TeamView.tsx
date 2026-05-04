'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Loader2, Check, Users } from 'lucide-react'

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  rm: 'bg-blue-100 text-blue-700',
}

const ROLE_AVATAR: Record<string, string> = {
  super_admin: 'bg-red-500',
  admin: 'bg-orange-500',
  rm: 'bg-[#422D83]',
}

export function TeamView({ user }: { user: any }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const [createdUser, setCreatedUser] = useState<any>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'rm', passwordEnv: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/v2/users', { credentials: 'include' })
      const data = await res.json()
      if (data.success) setMembers(data.users)
    } catch {}
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleAdd() {
    setFormError('')
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/crm/v2/users', { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        setFormError(data.error || 'Failed to add member')
        return
      }
      setCreatedUser(data.user)
      setForm({ name: '', email: '', phone: '', role: 'rm', passwordEnv: '' })
      setShowAdd(false)
      await loadMembers()
      showToast(`${data.user.name} added (${data.user.user_id})`)
    } catch {
      setFormError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(member: any) {
    try {
      const res = await fetch('/api/crm/v2/users', { credentials: 'include', 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.user_id, isActive: !member.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        setMembers(prev => prev.map(m => m.user_id === member.user_id ? { ...m, is_active: !m.is_active } : m))
        showToast(`${member.name} ${!member.is_active ? 'activated' : 'deactivated'}`)
      }
    } catch {}
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40"

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500 mt-0.5">{members.filter(m => m.is_active).length} active member{members.filter(m => m.is_active).length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setFormError(''); setCreatedUser(null) }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No team members yet</p>
                  </td>
                </tr>
              )}
              {members.map(member => (
                <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${!member.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${ROLE_AVATAR[member.role] || 'bg-gray-400'}`}>
                        {getInitials(member.name)}
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{member.user_id}</td>
                  <td className="px-4 py-3 text-gray-600">{member.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{member.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[member.role] || 'bg-gray-100 text-gray-600'}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {member.is_active
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(member)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          member.is_active
                            ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-900">Add Team Member</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                  placeholder="name@propsarathi.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className={inputCls}
                >
                  <option value="rm">RM (Relationship Manager)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password Env Var</label>
                <input
                  type="text"
                  value={form.passwordEnv}
                  onChange={e => setForm(p => ({ ...p, passwordEnv: e.target.value }))}
                  className={inputCls}
                  placeholder={form.role === 'rm' ? 'CRM_RM_PASSWORD (default)' : 'CRM_ADMIN_PASSWORD (default)'}
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use the default shared {form.role === 'rm' ? 'RM' : 'Admin'} password.</p>
              </div>
              {formError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.name.trim() || !form.email.trim()}
                className="px-5 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success credentials display */}
      {createdUser && (
        <div className="fixed bottom-6 right-6 bg-white border border-green-200 rounded-xl shadow-lg p-4 z-50 max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-700">Team member added!</p>
              <p className="text-xs text-gray-600 mt-1">{createdUser.name} · {createdUser.user_id}</p>
              <p className="text-xs text-gray-500">{createdUser.email}</p>
            </div>
            <button onClick={() => setCreatedUser(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#422D83] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-[60]">
          {toast}
        </div>
      )}
    </div>
  )
}
