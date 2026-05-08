'use client'

import { useEffect, useState } from 'react'
import { Users, Building2, Phone, Calendar } from 'lucide-react'

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
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  'Site Visit': 'bg-purple-100 text-purple-700',
  Negotiation: 'bg-orange-100 text-orange-700',
  Book: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PartnerReferralsPage() {
  const [tab, setTab] = useState<'enquiries' | 'listings'>('enquiries')
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/partner/referrals')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEnquiries(d.enquiries || [])
          setListings(d.listings || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Referrals</h1>
        <p className="text-sm text-gray-500">Track all clients you have referred</p>
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
            <div className="text-center py-12 text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No enquiries yet</p>
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
                <span>{e.city} · {e.property_interest}</span>
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
            <div className="text-center py-12 text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No listings yet</p>
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
                <span>{l.city} · {l.property_type}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(l.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
