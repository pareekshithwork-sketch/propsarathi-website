'use client'

import React, { useState } from 'react'
import { RefreshCw, Plus, Loader2, Building2, X, Edit2, Trash2 } from 'lucide-react'
import { EMPTY_PROJECT_FORM, PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, CITY_OPTIONS } from '../constants'

export function ProjectsView({ projects, loading, onRefresh, onUpdate, onDelete, onCreate }: {
  projects: any[]; loading: boolean; onRefresh: () => void
  onUpdate: (id: number, data: any) => Promise<any>
  onDelete: (id: number) => Promise<any>
  onCreate: (data: any) => Promise<any>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY_PROJECT_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterCity, setFilterCity] = useState('All')

  function openAdd() { setForm({ ...EMPTY_PROJECT_FORM }); setEditingProject(null); setShowForm(true) }
  function openEdit(p: any) {
    setForm({
      name: p.name || '', developer: p.developer || '', city: p.city || 'Bangalore',
      location: p.location || '', projectType: p.projectType || 'Apartment',
      status: p.status || 'Pre-Launch', currency: p.currency || 'INR',
      minPrice: p.minPrice || '', maxPrice: p.maxPrice || '',
      coverImage: p.coverImage || '', description: p.description || '',
      highlights: p.highlights || '', amenities: p.amenities || '',
      possessionDate: p.possessionDate || '', reraNumber: p.reraNumber || '',
      numUnits: p.numUnits || '', isFeatured: p.isFeatured || false, isActive: p.isActive !== false,
      // Payment plan
      paymentPlanBooking: p.paymentPlanBooking ?? '',
      paymentPlanConstruction: p.paymentPlanConstruction ?? '',
      paymentPlanPossession: p.paymentPlanPossession ?? '',
      paymentPlanNote: p.paymentPlanNote || '',
      paymentPlanEmi: p.paymentPlanEmi || false,
      // Developer info
      developerDescription: p.developerDescription || '',
      developerLogo: p.developerLogo || '',
      developerFounded: p.developerFounded || '',
      developerProjectsCount: p.developerProjectsCount ?? '',
      developerWebsite: p.developerWebsite || '',
      // Content (JSON)
      floorPlans: p.floorPlans || '',
      nearbyLocations: p.nearbyLocations || '',
    })
    setEditingProject(p)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.city) return
    setSaving(true)
    const payload = {
      ...form,
      minPrice: form.minPrice ? Number(form.minPrice) : null,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
      numUnits: form.numUnits ? Number(form.numUnits) : null,
      paymentPlanBooking: form.paymentPlanBooking !== '' ? Number(form.paymentPlanBooking) : null,
      paymentPlanConstruction: form.paymentPlanConstruction !== '' ? Number(form.paymentPlanConstruction) : null,
      paymentPlanPossession: form.paymentPlanPossession !== '' ? Number(form.paymentPlanPossession) : null,
      developerProjectsCount: form.developerProjectsCount !== '' ? Number(form.developerProjectsCount) : null,
    }
    try {
      if (editingProject) {
        await onUpdate(editingProject.id, payload)
      } else {
        await onCreate(payload)
      }
      setShowForm(false)
    } catch {}
    setSaving(false)
  }

  const filtered = projects.filter(p => {
    if (filterActive === 'active' && !p.isActive) return false
    if (filterActive === 'inactive' && p.isActive) return false
    if (filterCity !== 'All' && p.city !== filterCity) return false
    return true
  })

  const fmtPrice = (p: any) => {
    if (!p.minPrice) return '—'
    if (p.currency === 'AED') return `AED ${(p.minPrice / 1000000).toFixed(1)}M`
    if (p.minPrice >= 10000000) return `₹${(p.minPrice / 10000000).toFixed(1)} Cr`
    return `₹${(p.minPrice / 100000).toFixed(0)} L`
  }

  const STATUS_CHIP: Record<string, string> = {
    'Pre-Launch': 'bg-amber-100 text-amber-700',
    'Just Launched': 'bg-purple-100 text-purple-700',
    'Under Construction': 'bg-blue-100 text-blue-700',
    'Ready to Move': 'bg-green-100 text-green-700',
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button key={f} onClick={() => setFilterActive(f)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${filterActive === f ? 'bg-[#422D83] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            {['All', 'Bangalore', 'Dubai'].map(c => (
              <button key={c} onClick={() => setFilterCity(c)}
                className={`px-3 py-1 rounded-md font-medium transition ${filterCity === c ? 'bg-[#422D83] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {c}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} projects</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#422D83] hover:bg-[#2d1a60] text-white text-sm font-medium px-4 py-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Project" to add your first listing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Project</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">City</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">Price from</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Featured</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Live</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt="" className="w-10 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.developer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600">{p.city}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{p.projectType}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CHIP[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-700">{fmtPrice(p)}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onUpdate(p.id, { isFeatured: !p.isFeatured })}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${p.isFeatured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {p.isFeatured ? '★ Yes' : '☆ No'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onUpdate(p.id, { isActive: !p.isActive })}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${p.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                      {p.isActive ? 'Live' : 'Off'}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-blue-600 transition" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { onDelete(p.id); setDeleteConfirm(null) }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Project Name *</label>
                  <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sobha City" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Developer</label>
                  <input value={form.developer} onChange={e => setForm((f: any) => ({ ...f, developer: e.target.value }))}
                    placeholder="e.g. Sobha Limited" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                  <select value={form.city} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value, currency: e.target.value === 'Dubai' ? 'AED' : 'INR' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {CITY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location / Micro-market</label>
                  <input value={form.location} onChange={e => setForm((f: any) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Devanahalli, North Bangalore" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Property Type</label>
                  <select value={form.projectType} onChange={e => setForm((f: any) => ({ ...f, projectType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {PROJECT_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    {PROJECT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm((f: any) => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 bg-white">
                    <option>INR</option><option>AED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Total Units</label>
                  <input type="number" value={form.numUnits} onChange={e => setForm((f: any) => ({ ...f, numUnits: e.target.value }))}
                    placeholder="e.g. 500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Min Price ({form.currency})</label>
                  <input type="number" value={form.minPrice} onChange={e => setForm((f: any) => ({ ...f, minPrice: e.target.value }))}
                    placeholder={form.currency === 'AED' ? 'e.g. 1500000' : 'e.g. 7500000'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Max Price ({form.currency})</label>
                  <input type="number" value={form.maxPrice} onChange={e => setForm((f: any) => ({ ...f, maxPrice: e.target.value }))}
                    placeholder={form.currency === 'AED' ? 'e.g. 8000000' : 'e.g. 25000000'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Possession Date</label>
                  <input value={form.possessionDate} onChange={e => setForm((f: any) => ({ ...f, possessionDate: e.target.value }))}
                    placeholder="e.g. December 2027" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">RERA Number</label>
                  <input value={form.reraNumber} onChange={e => setForm((f: any) => ({ ...f, reraNumber: e.target.value }))}
                    placeholder="RERA / Applied / NA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Cover Image URL</label>
                  <input value={form.coverImage} onChange={e => setForm((f: any) => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                  {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" />}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Brief description of the project..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Highlights <span className="font-normal text-gray-400">(separate with |)</span></label>
                  <input value={form.highlights} onChange={e => setForm((f: any) => ({ ...f, highlights: e.target.value }))}
                    placeholder="Near Metro|Premium Location|RERA Registered" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Amenities <span className="font-normal text-gray-400">(separate with |)</span></label>
                  <input value={form.amenities} onChange={e => setForm((f: any) => ({ ...f, amenities: e.target.value }))}
                    placeholder="Clubhouse|Swimming Pool|Gym|Children Play Area" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-[#422D83]" />
                    <span className="text-sm text-gray-700">Featured on homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-700">Live on website</span>
                  </label>
                </div>

                {/* ── PAYMENT PLAN ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">💰 Payment Plan</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Booking %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanBooking}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanBooking: e.target.value }))}
                        placeholder="e.g. 20" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Construction %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanConstruction}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanConstruction: e.target.value }))}
                        placeholder="e.g. 60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Possession %</label>
                      <input type="number" min="0" max="100" value={form.paymentPlanPossession}
                        onChange={e => setForm((f: any) => ({ ...f, paymentPlanPossession: e.target.value }))}
                        placeholder="e.g. 20" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                  </div>
                  <input value={form.paymentPlanNote}
                    onChange={e => setForm((f: any) => ({ ...f, paymentPlanNote: e.target.value }))}
                    placeholder="Payment plan note (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 mb-2" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.paymentPlanEmi} onChange={e => setForm((f: any) => ({ ...f, paymentPlanEmi: e.target.checked }))} className="w-4 h-4 accent-[#422D83]" />
                    <span className="text-sm text-gray-700">EMI Available</span>
                  </label>
                </div>

                {/* ── DEVELOPER INFO ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🏢 Developer Info</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Founded Year</label>
                      <input value={form.developerFounded}
                        onChange={e => setForm((f: any) => ({ ...f, developerFounded: e.target.value }))}
                        placeholder="e.g. 1995" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Projects Delivered</label>
                      <input type="number" value={form.developerProjectsCount}
                        onChange={e => setForm((f: any) => ({ ...f, developerProjectsCount: e.target.value }))}
                        placeholder="e.g. 45" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input value={form.developerLogo}
                      onChange={e => setForm((f: any) => ({ ...f, developerLogo: e.target.value }))}
                      placeholder="Developer Logo URL (https://...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    <input value={form.developerWebsite}
                      onChange={e => setForm((f: any) => ({ ...f, developerWebsite: e.target.value }))}
                      placeholder="Developer Website (https://...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30" />
                    <textarea value={form.developerDescription}
                      onChange={e => setForm((f: any) => ({ ...f, developerDescription: e.target.value }))}
                      rows={3} placeholder="Brief description of the developer..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                  </div>
                </div>

                {/* ── FLOOR PLANS (JSON) ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">📐 Floor Plans <span className="font-normal normal-case text-gray-400">(JSON array)</span></p>
                  <p className="text-xs text-gray-400 mb-2">Format: {`[{"name":"2BHK Type A","bedrooms":2,"size_sqft":1250,"price_from":8500000,"image_url":"https://..."}]`}</p>
                  <textarea value={form.floorPlans}
                    onChange={e => setForm((f: any) => ({ ...f, floorPlans: e.target.value }))}
                    rows={3} placeholder='[{"name":"2BHK","bedrooms":2,"size_sqft":1200,"price_from":8000000}]'
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>

                {/* ── NEARBY LOCATIONS (JSON) ── */}
                <div className="col-span-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">📍 Nearby Locations <span className="font-normal normal-case text-gray-400">(JSON array)</span></p>
                  <p className="text-xs text-gray-400 mb-2">Categories: Airport | Metro | School | Hospital | Mall | IT Park | Beach | Park. Format: {`[{"name":"Kempegowda Airport","distance_km":8,"category":"Airport","travel_mins":15}]`}</p>
                  <textarea value={form.nearbyLocations}
                    onChange={e => setForm((f: any) => ({ ...f, nearbyLocations: e.target.value }))}
                    rows={3} placeholder='[{"name":"Metro Station","distance_km":1.2,"category":"Metro","travel_mins":5}]'
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 resize-none" />
                </div>

              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.city}
                className="px-6 py-2 text-sm bg-[#422D83] hover:bg-[#2d1a60] text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingProject ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
