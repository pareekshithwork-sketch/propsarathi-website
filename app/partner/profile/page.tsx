'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'

interface Profile {
  partnerId: string
  name: string
  email: string
  phone: string
  status: string
  tier: string
  kyc_status: string
  assigned_rm_name: string | null
  company_name: string | null
  rera_number: string | null
  city: string | null
  experience_years: number | null
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/partner/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.partner) setProfile(d.partner) })
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/partner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: profile.company_name,
          rera_number: profile.rera_number,
          city: profile.city,
          experience_years: profile.experience_years,
        }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const field = (label: string, value: string, readOnly = false, key?: keyof Profile) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={String(value ?? '')}
        readOnly={readOnly}
        onChange={key && !readOnly ? (e) => setProfile((p) => ({ ...p, [key]: e.target.value })) : undefined}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none ${
          readOnly
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
            : 'border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-500'
        }`}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">View and update your partner information</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
            {(profile.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{profile.tier} Partner</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                profile.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{profile.status}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account Info (read-only)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Full Name', profile.name || '', true)}
          {field('Email', profile.email || '', true)}
          {field('Phone', profile.phone || '', true)}
          {field('Assigned RM', profile.assigned_rm_name || '—', true)}
        </div>

        <hr className="border-gray-100" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Business Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Company / Agency Name', profile.company_name || '', false, 'company_name')}
          {field('RERA Number', profile.rera_number || '', false, 'rera_number')}
          {field('City', profile.city || '', false, 'city')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={50}
              value={profile.experience_years ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-violet-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
