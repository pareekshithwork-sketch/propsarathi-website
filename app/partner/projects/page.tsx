'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Share2, Copy, Check, Building2, MapPin, X } from 'lucide-react'

interface Project {
  id: number
  slug: string
  name: string
  developer: string
  city: string
  location: string
  project_type: string
  status: string
  min_price: number
  max_price: number
  currency: string
  cover_image: string | null
  highlights: string[] | null
  is_featured: boolean
}

function fmtPrice(n: number, currency: string) {
  if (!n) return ''
  if (currency === 'AED') return `AED ${(n / 100000).toFixed(0)}L`
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`
  return `₹${n}`
}

function ShareModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const [shareUrl, setShareUrl] = useState('')
  const [fullUrl, setFullUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/partner/share-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: project.slug }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setShareUrl(d.shareUrl); setFullUrl(d.fullUrl) }
      })
      .finally(() => setLoading(false))
  }, [project.slug])

  function copyLink() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Check out ${project.name} by ${project.developer} in ${project.city}! ${fullUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Share {project.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
          </div>
        ) : shareUrl ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <p className="text-xs text-gray-600 flex-1 truncate">{fullUrl}</p>
              <button onClick={copyLink} className="shrink-0 p-1 rounded hover:bg-gray-200">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
            <button
              onClick={shareWhatsApp}
              className="w-full bg-green-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Share on WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="w-full border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-red-500">Could not generate link. Try again.</p>
        )}
      </div>
    </div>
  )
}

export default function PartnerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState<Project | null>(null)

  useEffect(() => {
    fetch('/api/partner/projects')
      .then((r) => r.json())
      .then((d) => { if (d.success) setProjects(d.projects) })
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
        <h1 className="text-xl font-bold text-gray-900">Projects & Properties</h1>
        <p className="text-sm text-gray-500">Browse and share active projects with your clients</p>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects available</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {p.cover_image ? (
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={p.cover_image}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
                {p.is_featured && (
                  <span className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-violet-300" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">{p.name}</h3>
                <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{p.developer}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <MapPin className="h-3 w-3" />
                {p.location}, {p.city}
              </div>
              {(p.min_price || p.max_price) && (
                <p className="text-sm font-semibold text-violet-700 mt-2">
                  {fmtPrice(p.min_price, p.currency)}
                  {p.max_price && p.max_price !== p.min_price && ` – ${fmtPrice(p.max_price, p.currency)}`}
                </p>
              )}
              <button
                onClick={() => setSharing(p)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 border border-violet-200 text-violet-700 rounded-lg py-2 text-xs font-semibold hover:bg-violet-50 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share with Client
              </button>
            </div>
          </div>
        ))}
      </div>

      {sharing && <ShareModal project={sharing} onClose={() => setSharing(null)} />}
    </div>
  )
}
