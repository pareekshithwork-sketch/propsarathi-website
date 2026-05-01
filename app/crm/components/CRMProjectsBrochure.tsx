'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Building2, MapPin, Share2, Check } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  'Pre-Launch':         'bg-violet-100 text-violet-700',
  'Launched':           'bg-blue-100 text-blue-700',
  'Under Construction': 'bg-amber-100 text-amber-700',
  'Ready to Move':      'bg-green-100 text-green-700',
  'Sold Out':           'bg-gray-100 text-gray-600',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CRMProjectsBrochure({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/crm/projects')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.projects) setProjects(data.projects) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleShare(project: any) {
    const name = project.name || 'this project'
    const city = project.city || ''
    const status = project.status || ''
    const price = project.minPrice
    const currency = project.currency || 'INR'
    const priceStr = price
      ? `\nPrice from: ${currency === 'AED' ? 'AED ' : '₹'}${Number(price).toLocaleString('en-IN')}`
      : ''
    const msg = `Hi! I wanted to share details about *${name}* in ${city}. ${status ? `Status: ${status}.` : ''}${priceStr}\n\nFor more details, contact PropSarathi.`
    try {
      await navigator.clipboard.writeText(msg)
      setCopiedId(project.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = msg
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedId(project.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8">
        <Building2 className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-base font-medium">No projects yet</p>
        <p className="text-sm mt-1 text-center text-gray-300">Projects will be added via the admin panel.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900">Projects Brochure</h2>
        <p className="text-xs text-gray-400 mt-0.5">Tap "Share Info" to copy a WhatsApp message for any project</p>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => {
            const isCopied = copiedId === project.id
            const statusCls = STATUS_BADGE[project.status] || 'bg-gray-100 text-gray-600'

            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                {/* Cover image */}
                {project.coverImage ? (
                  <div className="h-36 bg-gray-100 overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.target.style.display = 'none' }}
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-[#422D83]/10 to-[#422D83]/5 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-[#422D83]/20" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{project.name}</h3>
                    {project.status && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusCls}`}>
                        {project.status}
                      </span>
                    )}
                  </div>

                  {project.developer && (
                    <p className="text-xs text-gray-500 mb-1">by {project.developer}</p>
                  )}

                  {(project.city || project.location) && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {[project.location, project.city].filter(Boolean).join(', ')}
                    </p>
                  )}

                  {/* Price */}
                  {project.minPrice > 0 && (
                    <p className="text-sm font-semibold text-[#422D83] mb-3">
                      {(project.currency || 'INR') === 'AED' ? 'AED ' : '₹'}
                      {Number(project.minPrice).toLocaleString('en-IN')}
                      {project.maxPrice > 0 && (
                        <span className="text-xs text-gray-400 font-normal">
                          {' – '}
                          {(project.currency || 'INR') === 'AED' ? 'AED ' : '₹'}
                          {Number(project.maxPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  )}

                  {/* Description preview */}
                  {project.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                  )}

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(project)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-[#422D83] hover:bg-[#321f6b] text-white'
                    }`}
                  >
                    {isCopied ? (
                      <><Check className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Share2 className="w-4 h-4" /> Share Info</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
