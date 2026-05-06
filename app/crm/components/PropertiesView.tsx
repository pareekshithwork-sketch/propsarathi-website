'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Loader2, Phone, MessageCircle, Home, MapPin,
  ChevronDown, ChevronUp, Search,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'rm_verified', label: 'RM Verified' },
  { id: 'admin_approved', label: 'Admin Approved' },
  { id: 'live', label: 'Live' },
]

const LISTING_STATUS_BADGE: Record<string, string> = {
  rm_verified:    'bg-blue-100 text-blue-700',
  admin_approved: 'bg-purple-100 text-purple-700',
  live:           'bg-green-100 text-green-700',
}

const LISTING_STATUS_LABEL: Record<string, string> = {
  rm_verified:    'RM Verified',
  admin_approved: 'Admin Approved',
  live:           'Live',
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Studio', 'Other']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string): string {
  if (!price || price <= 0) return '—'
  if (currency === 'AED') return `AED ${Number(price).toLocaleString('en-IN')}`
  return `₹${Number(price).toLocaleString('en-IN')}`
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PropertiesView({ user }: { user: any }) {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch RM Verified, Admin Approved, and Live listings
      const statuses = statusFilter
        ? [statusFilter]
        : ['rm_verified', 'admin_approved', 'live']

      const settled = await Promise.allSettled(
        statuses.map(s => {
          const params = new URLSearchParams({ status: s, limit: '200' })
          if (propertyType) params.set('propertyType', propertyType)
          if (city) params.set('city', city)
          if (search) params.set('search', search)
          return fetch(`/api/crm/v2/listings?${params}`, { credentials: 'include' }).then(r => r.json())
        })
      )
      const results = settled.map(r => r.status === 'fulfilled' ? r.value : {})

      const combined: any[] = []
      const seen = new Set<string>()
      for (const res of results) {
        if (res.success) {
          for (const ls of (res.listings || [])) {
            if (!seen.has(ls.listing_id)) {
              seen.add(ls.listing_id)
              combined.push(ls)
            }
          }
        }
      }
      // Sort: live first, then admin_approved, then rm_verified, then by updated_at
      const statusOrder: Record<string, number> = { live: 0, admin_approved: 1, rm_verified: 2 }
      combined.sort((a: any, b: any) => {
        const so = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
        if (so !== 0) return so
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
      setListings(combined)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, propertyType, city, search])

  useEffect(() => { loadProperties() }, [loadProperties])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pills */}
          <div className="flex gap-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#422D83] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#422D83]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-36"
              />
            </div>

            {/* Property Type */}
            <div className="relative">
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white appearance-none"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* City */}
            <input
              type="text"
              placeholder="City…"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 w-24"
            />

            {/* Refresh */}
            <button onClick={loadProperties} className="text-gray-400 hover:text-gray-600 p-1.5" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-50 flex-shrink-0">
        {loading ? 'Loading…' : `${listings.length} propert${listings.length !== 1 ? 'ies' : 'y'}`}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Home className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No verified properties found</p>
            <p className="text-xs mt-1 text-gray-300">Properties appear here once they are RM Verified or above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((ls: any) => {
              const statusCls = LISTING_STATUS_BADGE[ls.status] || 'bg-gray-100 text-gray-600'
              const statusLabel = LISTING_STATUS_LABEL[ls.status] || ls.status || 'Verified'
              const phoneClean = (ls.lead_country_code || '+91').replace('+', '') + (ls.lead_phone || '')
              const isExpanded = expandedId === ls.listing_id

              return (
                <div key={ls.listing_id} className="border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow overflow-hidden">
                  {/* Card body */}
                  <div className="p-4">
                    {/* Status + title */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusCls}`}>{statusLabel}</span>
                        <p className="text-sm font-bold text-gray-900 mt-1 truncate">{ls.title || 'Untitled'}</p>
                      </div>
                      <Home className="w-8 h-8 text-gray-100 flex-shrink-0" />
                    </div>

                    {/* Details */}
                    <div className="space-y-1 mb-3">
                      {(ls.property_type || ls.bedrooms > 0) && (
                        <p className="text-xs text-gray-600">{ls.bedrooms > 0 ? `${ls.bedrooms} BHK · ` : ''}{ls.property_type}</p>
                      )}
                      {(ls.locality || ls.city) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[ls.locality, ls.city].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-gray-800">
                        {formatPrice(ls.asking_price, ls.currency)}
                      </p>
                      {ls.area_sqft > 0 && (
                        <p className="text-xs text-gray-400">{Number(ls.area_sqft).toLocaleString()} sqft</p>
                      )}
                    </div>

                    {/* Seller info + actions */}
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Seller: <span className="text-gray-700 font-medium">{ls.lead_name || '—'}</span></p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a href={`tel:${ls.lead_country_code || '+91'}${ls.lead_phone}`} className="text-gray-400 hover:text-blue-600">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : ls.listing_id)}
                          className="text-xs text-[#422D83] hover:underline flex items-center gap-0.5"
                        >
                          {isExpanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Details</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1.5 text-xs">
                      {ls.address && <p className="text-gray-600"><span className="text-gray-400">Address:</span> {ls.address}</p>}
                      {ls.floor_number > 0 && <p className="text-gray-600"><span className="text-gray-400">Floor:</span> {ls.floor_number}{ls.total_floors > 0 ? ` of ${ls.total_floors}` : ''}</p>}
                      {ls.possession_status && <p className="text-gray-600"><span className="text-gray-400">Possession:</span> {ls.possession_status}</p>}
                      {ls.bathrooms > 0 && <p className="text-gray-600"><span className="text-gray-400">Bathrooms:</span> {ls.bathrooms}</p>}
                      {ls.seller_notes && (
                        <p className="text-gray-500 italic mt-2 pt-2 border-t border-gray-100">"{ls.seller_notes}"</p>
                      )}
                      <p className="text-gray-400">ID: {ls.listing_id}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
