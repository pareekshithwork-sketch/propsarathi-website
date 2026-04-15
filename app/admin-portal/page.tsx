"use client"

import { useState, useEffect, useCallback } from "react"
import { Building2, Users, MessageSquare, LogOut, Plus, Pencil, Trash2, X, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { LogoCompact } from "@/components/Logo"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number
  name: string; slug: string; developer: string; city: string; location: string
  address: string; projectType: string; status: string; totalAreaAcres: number|null
  numTowers: number|null; numFloors: number|null; numUnits: number|null
  minPrice: number|null; maxPrice: number|null; currency: string; possessionDate: string
  reraNumber: string; latitude: number|null; longitude: number|null
  metroStation: string; metroDistanceKm: number|null
  airportDistanceKm: number|null; techParkDistanceKm: number|null; nearbyLandmarks: string
  description: string; amenities: string; highlights: string
  coverImage: string; brochureUrl: string; videoUrl: string
  seoTitle: string; seoDescription: string; paymentPlan: string
  isFeatured: boolean; isActive: boolean
}

const EMPTY_PROJECT: Omit<Project, 'id'> = {
  name: '', slug: '', developer: '', city: 'Bangalore', location: '', address: '',
  projectType: 'Apartment', status: 'Pre-Launch', totalAreaAcres: null,
  numTowers: null, numFloors: null, numUnits: null, minPrice: null, maxPrice: null,
  currency: 'INR', possessionDate: '', reraNumber: '',
  latitude: null, longitude: null,
  metroStation: '', metroDistanceKm: null, airportDistanceKm: null, techParkDistanceKm: null,
  nearbyLandmarks: '', description: '', amenities: '', highlights: '',
  coverImage: '', brochureUrl: '', videoUrl: '', seoTitle: '', seoDescription: '',
  paymentPlan: '', isFeatured: false, isActive: true,
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token)
        onLogin(data.token)
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-2">
          <LogoCompact />
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-sm">Admin Portal</h1>
            <p className="text-xs text-gray-400">Secure access</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6b56c0]"
              placeholder="Username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6b56c0] pr-10"
                placeholder="Password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#422D83] hover:bg-[#2d1a60] text-white font-medium rounded-xl transition text-sm disabled:opacity-50">
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Project Form Modal ───────────────────────────────────────────────────────
function ProjectModal({
  project, onSave, onClose
}: {
  project: Partial<Project> | null
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const isNew = !project?.id
  const [form, setForm] = useState<any>(project || { ...EMPTY_PROJECT })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: any) {
    setForm((f: any) => {
      const updated = { ...f, [key]: value }
      if (key === 'name' && isNew) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.city) {
      setError('Name, slug, and city are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: string, type = 'text', opts?: { placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={e => set(key, type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
        placeholder={opts?.placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6b56c0]"
      />
    </div>
  )

  const select = (label: string, key: string, options: string[]) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={form[key] ?? ''} onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6b56c0] bg-white">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const textarea = (label: string, key: string, placeholder?: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea value={form[key] ?? ''} onChange={e => set(key, e.target.value)} rows={3}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6b56c0] resize-none" />
    </div>
  )

  const checkbox = (label: string, key: string) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)}
        className="w-4 h-4 accent-emerald-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isNew ? 'Add Project' : 'Edit Project'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {field('Project Name *', 'name')}
            {field('Slug *', 'slug')}
            {field('Developer', 'developer')}
            {select('City *', 'city', ['Bangalore', 'Dubai', 'Mumbai', 'Hyderabad'])}
            {field('Location', 'location')}
            {field('Address', 'address')}
            {select('Project Type', 'projectType', ['Apartment', 'Villa', 'Plots', 'Farmland', 'Townhouse', 'Villament'])}
            {select('Status', 'status', ['Pre-Launch', 'Just Launched', 'Under Construction', 'Ready to Move'])}
            {field('Total Area (Acres)', 'totalAreaAcres', 'number')}
            {field('Num Towers', 'numTowers', 'number')}
            {field('Num Floors', 'numFloors', 'number')}
            {field('Num Units', 'numUnits', 'number')}
            {field('Min Price', 'minPrice', 'number')}
            {field('Max Price', 'maxPrice', 'number')}
            {select('Currency', 'currency', ['INR', 'AED', 'USD'])}
            {field('Possession Date', 'possessionDate', 'text', { placeholder: 'e.g. Dec 2026' })}
            {field('RERA Number', 'reraNumber')}
            {field('Latitude', 'latitude', 'number', { placeholder: 'e.g. 13.3916 (for map pin)' })}
            {field('Longitude', 'longitude', 'number', { placeholder: 'e.g. 77.7117 (for map pin)' })}
            {field('Metro Station', 'metroStation')}
            {field('Metro Distance (km)', 'metroDistanceKm', 'number')}
            {field('Airport Distance (km)', 'airportDistanceKm', 'number')}
            {field('Tech Park Distance (km)', 'techParkDistanceKm', 'number')}
            {field('Nearby Landmarks', 'nearbyLandmarks', 'text', { placeholder: 'Comma separated' })}
            {field('Cover Image URL', 'coverImage')}
            {field('Brochure URL', 'brochureUrl')}
            {field('Video URL', 'videoUrl')}
            {field('SEO Title', 'seoTitle')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {textarea('Description', 'description')}
            {textarea('Amenities', 'amenities', 'Pipe-separated: Swimming Pool|Gym|...')}
            {textarea('Highlights', 'highlights', 'Pipe-separated: Great Views|Prime Location|...')}
            {textarea('SEO Description', 'seoDescription')}
            {textarea('Payment Plan', 'paymentPlan', 'e.g. 30:70, 10:80:10...')}
          </div>
          <div className="flex gap-6 mt-4">
            {checkbox('Is Featured', 'isFeatured')}
            {checkbox('Is Active', 'isActive')}
          </div>
          {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-sm bg-[#422D83] hover:bg-[#2d1a60] text-white font-medium rounded-xl transition disabled:opacity-50">
            {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ adminKey }: { adminKey: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; project: Partial<Project> | null }>({ open: false, project: null })
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', { headers: { 'x-admin-key': adminKey } })
      const data = await res.json()
      setProjects(data.projects || [])
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  async function handleSave(form: any) {
    if (form.id) {
      await fetch(`/api/admin/projects/${form.id}`, {
        method: 'PUT',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed')
    }
    await fetchProjects()
  }

  async function handleDelete(id: number) {
    if (!confirm('Archive this project?')) return
    setDeleting(id)
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } })
    await fetchProjects()
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Projects ({projects.length})</h2>
        <div className="flex gap-2">
          <button onClick={fetchProjects}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setModal({ open: true, project: null })}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#422D83] hover:bg-[#2d1a60] text-white font-medium rounded-xl transition">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No projects found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">City</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Featured</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.developer}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.city}</td>
                  <td className="px-4 py-3 text-gray-600">{p.projectType}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f5f3fd] text-[#371f6e]">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.minPrice ? `${p.currency} ${(p.minPrice/100000).toFixed(0)}L` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {p.isFeatured ? <span className="text-[#422D83] font-medium">Yes</span> : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ open: true, project: p })}
                        className="p-1.5 hover:bg-[#f5f3fd] text-[#422D83] rounded-lg transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <ProjectModal
          project={modal.project}
          onSave={handleSave}
          onClose={() => setModal({ open: false, project: null })}
        />
      )}
    </div>
  )
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────
function EnquiriesTab({ adminKey }: { adminKey: string }) {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/enquiry', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => setEnquiries(d.enquiries || []))
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Enquiries ({enquiries.length})</h2>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No enquiries found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{e.project_name || e.project_slug || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {e.type || 'enquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Viewers Tab ──────────────────────────────────────────────────────────────
function ViewersTab({ adminKey }: { adminKey: string }) {
  const [viewers, setViewers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/viewers', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => setViewers(d.viewers || []))
      .catch(() => setViewers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Viewers ({viewers.length})</h2>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : viewers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No viewers found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Last Seen</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">CRM Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {viewers.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.country_code}{v.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{v.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {v.last_seen ? new Date(v.last_seen).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#371f6e]">{v.crm_lead_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPortalPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [tab, setTab] = useState<'projects' | 'enquiries' | 'viewers'>('projects')

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    setAdminKey(stored)
  }, [])

  function handleLogin(token: string) {
    setAdminKey(token)
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    setAdminKey(null)
  }

  if (adminKey === null) return null // waiting for localStorage check

  if (!adminKey) return <LoginScreen onLogin={handleLogin} />

  const tabs = [
    { id: 'projects' as const, label: 'Projects', icon: Building2 },
    { id: 'enquiries' as const, label: 'Enquiries', icon: MessageSquare },
    { id: 'viewers' as const, label: 'Viewers', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#422D83] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">PropSarathi Admin</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition ${
                    tab === t.id
                      ? 'border-emerald-600 text-[#371f6e]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'projects' && <ProjectsTab adminKey={adminKey} />}
        {tab === 'enquiries' && <EnquiriesTab adminKey={adminKey} />}
        {tab === 'viewers' && <ViewersTab adminKey={adminKey} />}
      </main>
    </div>
  )
}
