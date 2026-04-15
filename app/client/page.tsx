'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, User, LogOut, ChevronRight, Building2 } from 'lucide-react'

interface ClientUser {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
}

interface SavedProperty {
  slug: string
  savedAt: string
}

interface Enquiry {
  id: number
  propertySlug: string
  message: string
  status: string
  createdAt: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'saved' | 'enquiries' | 'profile'>('saved')
  const [saved, setSaved] = useState<SavedProperty[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [enquiriesLoading, setEnquiriesLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    fetch('/api/auth/client/me').then(r => r.json()).then(({ user }) => {
      if (!user) { router.replace('/client/login'); return }
      setUser(user)
      setProfileForm({ name: user.name, phone: user.phone || '' })
      setLoading(false)
    }).catch(() => { router.replace('/client/login') })
  }, [router])

  useEffect(() => {
    if (!user) return
    if (tab === 'saved') {
      setSavedLoading(true)
      fetch('/api/client/saved-properties').then(r => r.json()).then(({ saved }) => {
        setSaved(saved || [])
        setSavedLoading(false)
      }).catch(() => setSavedLoading(false))
    }
    if (tab === 'enquiries') {
      setEnquiriesLoading(true)
      fetch('/api/client/enquiries').then(r => r.json()).then(({ enquiries }) => {
        setEnquiries(enquiries || [])
        setEnquiriesLoading(false)
      }).catch(() => setEnquiriesLoading(false))
    }
  }, [tab, user])

  async function unsave(slug: string) {
    setSaved(s => s.filter(p => p.slug !== slug))
    await fetch(`/api/client/saved-properties/${slug}`, { method: 'DELETE' })
  }

  async function logout() {
    await fetch('/api/auth/client/logout', { method: 'POST' })
    router.push('/')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    try {
      const res = await fetch('/api/auth/client/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      if (res.ok) {
        setUser(u => u ? { ...u, ...profileForm } : u)
        setProfileMsg('Profile updated.')
      } else {
        setProfileMsg('Could not save changes.')
      }
    } catch {
      setProfileMsg('Could not save changes.')
    }
    setProfileSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#422D83]" />
      </div>
    )
  }

  const TABS = [
    { id: 'saved' as const, label: 'Saved Properties', icon: Heart },
    { id: 'enquiries' as const, label: 'My Enquiries', icon: MessageSquare },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#422D83]">PropSarathi</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">Hi, {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={16} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">My Account</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white text-[#422D83] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon size={15} />
                <span className="hidden sm:block">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Saved Properties Tab */}
        {tab === 'saved' && (
          <div>
            {savedLoading ? (
              <div className="text-center py-16 text-gray-400">Loading…</div>
            ) : saved.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No saved properties yet</p>
                <p className="text-gray-400 text-sm mt-1">Browse properties and tap the heart icon to save them here.</p>
                <Link href="/properties" className="inline-block mt-4 bg-[#422D83] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#2d1a60] transition-colors">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {saved.map(p => (
                  <div key={p.slug} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-[#422D83]/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#422D83]/10 rounded-lg flex items-center justify-center">
                        <Building2 size={18} className="text-[#422D83]" />
                      </div>
                      <div>
                        <Link href={`/properties/${p.slug}`} className="font-medium text-gray-800 hover:text-[#422D83] transition-colors capitalize">
                          {p.slug.replace(/-/g, ' ')}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">Saved {new Date(p.savedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/properties/${p.slug}`} className="text-[#422D83] hover:text-[#2d1a60]">
                        <ChevronRight size={18} />
                      </Link>
                      <button onClick={() => unsave(p.slug)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enquiries Tab */}
        {tab === 'enquiries' && (
          <div>
            {enquiriesLoading ? (
              <div className="text-center py-16 text-gray-400">Loading…</div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No enquiries yet</p>
                <p className="text-gray-400 text-sm mt-1">When you submit enquiry forms, they&apos;ll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map(eq => (
                  <div key={eq.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {eq.propertySlug ? (
                          <Link href={`/properties/${eq.propertySlug}`} className="font-medium text-gray-800 hover:text-[#422D83] capitalize">
                            {eq.propertySlug.replace(/-/g, ' ')}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-800">General Enquiry</span>
                        )}
                        {eq.message && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{eq.message}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(eq.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${eq.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' : eq.status === 'Responded' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {eq.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-5">Your Details</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 focus:border-[#422D83]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98800 00000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 focus:border-[#422D83]"
                />
              </div>
              {profileMsg && <p className={`text-sm ${profileMsg.includes('not') ? 'text-red-600' : 'text-green-600'}`}>{profileMsg}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-[#422D83] hover:bg-[#2d1a60] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
