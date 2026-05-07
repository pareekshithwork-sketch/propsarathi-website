'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Loader2, Check, Users, Pencil } from 'lucide-react'

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  gm: 'bg-indigo-100 text-indigo-700',
  rm: 'bg-blue-100 text-blue-700',
  marketing: 'bg-pink-100 text-pink-700',
  finance: 'bg-emerald-100 text-emerald-700',
  hr: 'bg-cyan-100 text-cyan-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const ROLE_AVATAR: Record<string, string> = {
  super_admin: 'bg-red-500',
  admin: 'bg-orange-500',
  gm: 'bg-indigo-500',
  rm: 'bg-[#422D83]',
  marketing: 'bg-pink-500',
  finance: 'bg-emerald-500',
  hr: 'bg-cyan-500',
  viewer: 'bg-gray-400',
}

const ALL_ROLES = ['super_admin', 'admin', 'gm', 'rm', 'marketing', 'finance', 'hr', 'viewer']
const ALL_DEPARTMENTS = ['Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Tech', 'Management']

const EMPTY_FORM = {
  name: '', email: '', phone: '', role: 'rm', department: '', managerId: '', teamId: '',
}

export function TeamView({ user }: { user: any }) {
  const [members, setMembers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [createdUser, setCreatedUser] = useState<any>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/v2/users', { credentials: 'include' })
      const data = await res.json()
      if (data.success) setMembers(data.users)
    } catch {}
    setLoading(false)
  }

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openAdd() {
    setEditingMember(null)
    setForm({ ...EMPTY_FORM })
    setFormError('')
    setCreatedUser(null)
    setShowAdd(true)
  }

  function openEdit(member: any) {
    setEditingMember(member)
    setForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'rm',
      department: member.department || '',
      managerId: member.manager_id ? String(member.manager_id) : '',
      teamId: member.team_id ? String(member.team_id) : '',
    })
    setFormError('')
    setShowAdd(true)
  }

  async function handleSave() {
    setFormError('')
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required')
      return
    }
    setSaving(true)
    try {
      if (editingMember) {
        // Edit: only role, department, managerId, teamId (not email)
        const res = await fetch('/api/crm/v2/users', {
          credentials: 'include',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingMember.user_id,
            role: form.role,
            department: form.department,
            managerId: form.managerId || null,
            teamId: form.teamId || null,
          }),
        })
        const data = await res.json()
        if (!data.success) { setFormError(data.error || 'Failed to update'); return }
        setShowAdd(false)
        await loadMembers()
        showToastMsg(`${editingMember.name} updated`)
      } else {
        // Add new member
        const res = await fetch('/api/crm/v2/users', {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!data.success) { setFormError(data.error || 'Failed to add member'); return }
        setCreatedUser(data.user)
        setForm({ ...EMPTY_FORM })
        setShowAdd(false)
        await loadMembers()
        showToastMsg(`${data.user.name} added`)
      }
    } catch {
      setFormError('Network error')
    }
    setSaving(false)
  }

  async function toggleActive(member: any) {
    try {
      const res = await fetch('/api/crm/v2/users', {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.user_id, isActive: !member.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        await loadMembers()
        showToastMsg(`${member.name} ${!member.is_active ? 'activated' : 'deactivated'}`)
      }
    } catch {}
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/40'
  const gms = members.filter(m => m.role === 'gm' || m.role === 'admin' || m.role === 'super_admin')

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {members.filter(m => m.is_active !== false).length} active member{members.filter(m => m.is_active !== false).length !== 1 ? 's' : ''}
            {' · '}Login via Google using their @propsarathi.com email
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <button
            onClick={openAdd}
            className="bg-[#422D83] hover:bg-[#321f6b] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
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
                {['Member', 'Email', 'Role', 'Dept', 'Manager', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">{h}</th>
                ))}
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
                <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${member.is_active === false ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${ROLE_AVATAR[member.role] || 'bg-gray-400'}`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs font-mono text-gray-400">{member.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{member.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[member.role] || 'bg-gray-100 text-gray-600'}`}>
                      {(member.role || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{member.department || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {member.manager_id ? (members.find(m => m.id === member.manager_id)?.name || `#${member.manager_id}`) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {member.is_active !== false
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(member)}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:border-[#422D83] hover:text-[#422D83] flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => toggleActive(member)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                            member.is_active !== false
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {member.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-900">{editingMember ? `Edit: ${editingMember.name}` : 'Add Team Member'}</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {!editingMember && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">— this whitelists their Google login</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="name@propsarathi.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="Optional" />
                  </div>
                </>
              )}

              {editingMember && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
                  Email: <strong>{editingMember.email}</strong> (cannot be changed — it&apos;s their login identity)
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={inputCls}>
                  <option value="">— Select department —</option>
                  {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager (optional)</label>
                <select value={form.managerId} onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))} className={inputCls}>
                  <option value="">— No manager —</option>
                  {gms.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>

              {teams.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Team (optional)</label>
                  <select value={form.teamId} onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))} className={inputCls}>
                    <option value="">— No team —</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.email.trim()}
                className="px-5 py-2 text-sm bg-[#422D83] text-white rounded-lg hover:bg-[#321f6b] disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {createdUser && (
        <div className="fixed bottom-6 right-6 bg-white border border-green-200 rounded-xl shadow-lg p-4 z-50 max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-700">Team member added!</p>
              <p className="text-xs text-gray-600 mt-1">{createdUser.name} can now log in with their Google account at <strong>{createdUser.email}</strong></p>
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
