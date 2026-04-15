"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin, Building2, Home, ArrowLeft, Share2, Phone, Mail,
  ChevronRight, CheckCircle, Train, Plane, Briefcase, Star,
  Calendar, Shield, Users, Ruler, Layers, Hash, Copy,
  MessageCircle, Linkedin, Twitter, X, ChevronLeft, ChevronRight as ChevronR,
  ExternalLink, Download, Play, Eye
} from "lucide-react"
import { usePortal } from "./PortalProvider"
import { formatPrice } from "@/lib/portalAuth"
import Logo from "@/components/Logo"
import SavePropertyButton from "@/components/SavePropertyButton"

interface Unit {
  id: number; unitType: string; bedrooms: number; bathrooms: number
  minAreaSqft: number; maxAreaSqft: number; minPrice: number; maxPrice: number
  availableUnits: number; totalUnits: number; floorPlanUrl: string
}

interface Image { id: number; url: string; caption: string; mediaType: string }

interface Project {
  id: number; slug: string; name: string; developer: string; city: string
  location: string; address: string; projectType: string; status: string
  totalAreaAcres: number; numTowers: number; numFloors: number; numUnits: number
  minPrice: number; maxPrice: number; currency: string; possessionDate: string
  reraNumber: string; metroStation: string; metroDistanceKm: number
  airportDistanceKm: number; techParkDistanceKm: number
  nearbyLandmarks: string; description: string; amenities: string[]
  highlights: string[]; coverImage: string; brochureUrl: string; videoUrl: string
  units: Unit[]; images: Image[]
  seoTitle: string; seoDescription: string
}

const STATUS_COLOR: Record<string, string> = {
  'Pre-Launch': 'bg-amber-500 text-white',
  'Just Launched': 'bg-[#422D83] text-white',
  'Under Construction': 'bg-blue-500 text-white',
  'Ready to Move': 'bg-purple-500 text-white',
}

export default function ProjectDetailClient({ project }: { project: Project }) {
  const { viewer, isLoggedIn, showLoginModal, trackTime, stopTracking } = usePortal()
  const [activeTab, setActiveTab] = useState<"overview" | "units" | "amenities" | "location" | "gallery">("overview")
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({ name: viewer?.name || '', phone: viewer?.phone || '', countryCode: '+91', email: '', message: '' })
  const [enquirySent, setEnquirySent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef(Date.now())

  // Track time on this page
  useEffect(() => {
    trackTime(project.slug, project.name)
    startTimeRef.current = Date.now()
    return () => { stopTracking() }
  }, [project.slug])

  // Prefill form if logged in
  useEffect(() => {
    if (viewer) setEnquiryForm(f => ({ ...f, name: viewer.name || '', phone: viewer.phone || '' }))
  }, [viewer])

  const allImages = [
    ...(project.coverImage ? [{ url: project.coverImage, caption: project.name, mediaType: 'image' }] : []),
    ...(project.images || [])
  ]

  async function submitEnquiry(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      await fetch('/api/forms/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryForm.name,
          phone: enquiryForm.phone,
          email: enquiryForm.email,
          message: enquiryForm.message,
          propertySlug: project.slug,
          source: 'Property Page',
        })
      })
      setEnquirySent(true)
    } catch {}
    setSubmitting(false)
  }

  function handleShare(platform: string) {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out ${project.name} by ${project.developer} in ${project.location}! Starting ${formatPrice(project.minPrice, project.currency)} - via PropSarathi`)
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href)
      setShareOpen(false)
      return
    }
    window.open(links[platform], '_blank')
    setShareOpen(false)
  }

  const landmarks = project.nearbyLandmarks ? project.nearbyLandmarks.split('|') : []

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <Logo size="sm" href="" className="hidden sm:flex" />
            <span className="text-sm font-medium sm:hidden">All Properties</span>
          </Link>
          <div className="flex-1 min-w-0 text-center hidden md:block">
            <p className="text-sm font-semibold text-gray-800 truncate">{project.name}</p>
            <p className="text-xs text-gray-400">{project.developer} · {project.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <SavePropertyButton slug={project.slug} />
            <div className="relative">
              <button onClick={() => setShareOpen(!shareOpen)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                <Share2 className="w-4 h-4" /><span className="hidden sm:block">Share</span>
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl w-48 overflow-hidden z-50">
                  <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
                    <MessageCircle className="w-4 h-4 text-green-500" />WhatsApp
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
                    <Linkedin className="w-4 h-4 text-blue-600" />LinkedIn
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
                    <Twitter className="w-4 h-4 text-sky-500" />Twitter / X
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition border-t border-gray-100">
                    <Copy className="w-4 h-4 text-gray-500" />Copy Link
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => {
              if (!isLoggedIn) { showLoginModal(false, project.name); return }
              setEnquiryOpen(true)
            }}
              className="px-4 py-2 bg-[#F17322] hover:bg-[#d4621a] text-white text-sm font-semibold rounded-xl transition">
              Enquire Now
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">

          {/* ── LEFT MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 mb-6 cursor-pointer h-72 md:h-96"
              onClick={() => setGalleryOpen(true)}>
              {allImages[0] && (
                <img src={allImages[galleryIdx]?.url || allImages[0].url} alt={project.name}
                  className="w-full h-full object-cover" />
              )}
              <div className={`absolute top-4 left-4 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-xs font-bold px-3 py-1.5 rounded-full`}>
                {project.status}
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setGalleryIdx(Math.max(0, galleryIdx - 1)) }}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setGalleryIdx(Math.min(allImages.length - 1, galleryIdx + 1)) }}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition">
                    <ChevronR className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 rounded-full transition">
                    <Eye className="w-3.5 h-3.5" />{allImages.length} Photos
                  </button>
                </div>
              )}
            </div>

            {/* Title block */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[#422D83] font-semibold text-sm mb-1">{project.developer}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.name}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                    <MapPin className="w-4 h-4 text-[#422D83] shrink-0" />
                    <span>{project.address || `${project.location}, ${project.city}`}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Price Range</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(project.minPrice, project.currency)}</p>
                  <p className="text-sm text-gray-400">onwards</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
                {[
                  { label: "Total Area", value: project.totalAreaAcres ? `${project.totalAreaAcres} Acres` : '—', icon: <Layers className="w-4 h-4" /> },
                  { label: "Towers", value: project.numTowers || '—', icon: <Building2 className="w-4 h-4" /> },
                  { label: "Floors", value: project.numFloors ? `G + ${project.numFloors}` : '—', icon: <Hash className="w-4 h-4" /> },
                  { label: "Total Units", value: project.numUnits?.toLocaleString() || '—', icon: <Home className="w-4 h-4" /> },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center text-[#422D83] mb-1">{s.icon}</div>
                    <p className="font-bold text-gray-800 text-lg">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {(["overview", "units", "amenities", "location", "gallery"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-5 py-3.5 text-sm font-medium capitalize transition border-b-2 ${activeTab === tab ? 'border-[#422D83] text-[#422D83] bg-[#f5f3fd]/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">About {project.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                    </div>

                    {project.highlights?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Project Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.highlights.map((h: string) => (
                            <div key={h} className="flex items-center gap-2 bg-[#f5f3fd] rounded-lg px-3 py-2.5">
                              <CheckCircle className="w-4 h-4 text-[#422D83] shrink-0" />
                              <span className="text-sm text-gray-700">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Details Table */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Project Details</h3>
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        {[
                          { label: "Developer", value: project.developer },
                          { label: "Project Type", value: project.projectType },
                          { label: "Status", value: project.status },
                          { label: "Total Land", value: project.totalAreaAcres ? `${project.totalAreaAcres} Acres` : null },
                          { label: "No. of Towers", value: project.numTowers },
                          { label: "No. of Floors", value: project.numFloors ? `G + ${project.numFloors}` : null },
                          { label: "Total Units", value: project.numUnits?.toLocaleString() },
                          { label: "Possession Date", value: project.possessionDate },
                          { label: "RERA No.", value: project.reraNumber },
                          { label: "Location", value: `${project.location}, ${project.city}` },
                        ].filter(r => r.value).map((row, i) => (
                          <div key={row.label} className={`flex items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <span className="w-40 text-gray-500 shrink-0">{row.label}</span>
                            <span className="font-medium text-gray-800">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="flex flex-wrap gap-3">
                      {project.brochureUrl && (
                        <a href={project.brochureUrl} target="_blank"
                          className="flex items-center gap-2 px-4 py-2.5 border border-[#8b78d4] text-[#371f6e] rounded-xl text-sm font-medium hover:bg-[#f5f3fd] transition">
                          <Download className="w-4 h-4" />Download Brochure
                        </a>
                      )}
                      {project.videoUrl && (
                        <a href={project.videoUrl} target="_blank"
                          className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50 transition">
                          <Play className="w-4 h-4" />Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* UNITS */}
                {activeTab === "units" && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Unit Configurations & Pricing</h3>
                    {project.units?.length > 0 ? (
                      <div className="space-y-3">
                        {project.units.map((unit: Unit) => (
                          <div key={unit.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#c4b8ef] transition">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{unit.unitType}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                  {unit.bedrooms !== null && unit.bedrooms !== undefined && (
                                    <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bed`}</span>
                                  )}
                                  {unit.bathrooms && (
                                    <span>{unit.bathrooms} Bath</span>
                                  )}
                                  {unit.minAreaSqft && (
                                    <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />
                                      {unit.minAreaSqft === unit.maxAreaSqft
                                        ? `${unit.minAreaSqft.toLocaleString()} sqft`
                                        : `${unit.minAreaSqft.toLocaleString()} - ${unit.maxAreaSqft.toLocaleString()} sqft`
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 text-lg">
                                  {unit.minPrice === unit.maxPrice
                                    ? formatPrice(unit.minPrice, project.currency)
                                    : `${formatPrice(unit.minPrice, project.currency)} - ${formatPrice(unit.maxPrice, project.currency)}`
                                  }
                                </p>
                                {unit.totalUnits && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {unit.availableUnits} / {unit.totalUnits} available
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              {unit.minAreaSqft && unit.minPrice && (
                                <p className="text-xs text-gray-400">
                                  ~{formatPrice(Math.round(unit.minPrice / unit.minAreaSqft), project.currency)}/sqft
                                </p>
                              )}
                              <button onClick={() => setEnquiryOpen(true)}
                                className="text-xs text-[#422D83] font-medium hover:underline">
                                Enquire for this unit →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Unit details coming soon. <button onClick={() => setEnquiryOpen(true)} className="text-[#422D83] font-medium hover:underline">Enquire for pricing</button></p>
                      </div>
                    )}
                  </div>
                )}

                {/* AMENITIES */}
                {activeTab === "amenities" && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Amenities</h3>
                    {project.amenities?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {project.amenities.map((a: string) => (
                          <div key={a} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                            <CheckCircle className="w-4 h-4 text-[#422D83] shrink-0" />
                            <span className="text-sm text-gray-700">{a}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Amenities details coming soon.</p>
                    )}
                  </div>
                )}

                {/* LOCATION */}
                {activeTab === "location" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Connectivity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {project.metroStation && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Train className="w-4 h-4" />
                              <span className="text-xs font-medium">Metro</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{project.metroStation}</p>
                            {project.metroDistanceKm && <p className="text-xs text-gray-400 mt-0.5">{project.metroDistanceKm} km away</p>}
                          </div>
                        )}
                        {project.airportDistanceKm && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-amber-600 mb-1">
                              <Plane className="w-4 h-4" />
                              <span className="text-xs font-medium">Airport</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">International Airport</p>
                            <p className="text-xs text-gray-400 mt-0.5">{project.airportDistanceKm} km away</p>
                          </div>
                        )}
                        {project.techParkDistanceKm && (
                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                              <Briefcase className="w-4 h-4" />
                              <span className="text-xs font-medium">Tech Park</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">Nearest Tech Hub</p>
                            <p className="text-xs text-gray-400 mt-0.5">{project.techParkDistanceKm} km away</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {landmarks.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Nearby Landmarks</h3>
                        <div className="flex flex-wrap gap-2">
                          {landmarks.map((l: string) => (
                            <span key={l} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                              <MapPin className="w-3.5 h-3.5 text-[#422D83]" />{l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Map placeholder */}
                    <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border border-gray-200">
                      <div className="text-center text-gray-400">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">{project.location}, {project.city}</p>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(project.address || project.location + ' ' + project.city)}`}
                          target="_blank"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-[#422D83] hover:underline">
                          <ExternalLink className="w-3 h-3" />Open in Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* GALLERY */}
                {activeTab === "gallery" && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Photo Gallery</h3>
                    {allImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {allImages.map((img: any, i: number) => (
                          <div key={i} onClick={() => { setGalleryIdx(i); setGalleryOpen(true) }}
                            className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-gray-100">
                            <img src={img.url} alt={img.caption || project.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-8">Gallery photos coming soon.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-80 shrink-0 space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20">
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-0.5">Starting Price</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(project.minPrice, project.currency)}</p>
                {project.maxPrice > project.minPrice && (
                  <p className="text-sm text-gray-400">Up to {formatPrice(project.maxPrice, project.currency)}</p>
                )}
              </div>

              <div className="space-y-2 text-sm mb-5">
                {project.possessionDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Possession</span>
                    <span className="font-medium text-gray-700">{project.possessionDate}</span>
                  </div>
                )}
                {project.reraNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />RERA</span>
                    <span className="font-medium text-gray-700 text-xs">{project.reraNumber.length > 20 ? project.reraNumber.slice(0, 20) + '...' : project.reraNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Type</span>
                  <span className="font-medium text-gray-700">{project.projectType}</span>
                </div>
              </div>

              <button onClick={() => {
                if (!isLoggedIn) { showLoginModal(true, project.name); return }
                setEnquiryOpen(true)
              }}
                className="w-full bg-[#F17322] hover:bg-[#d4621a] text-white font-semibold rounded-xl py-3 text-sm transition mb-2">
                Enquire Now — Free
              </button>
              <a href="tel:+917090303535"
                className="w-full border border-gray-200 text-gray-700 font-medium rounded-xl py-3 text-sm transition hover:bg-gray-50 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />Call Our Expert
              </a>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4 shrink-0 text-[#422D83]" />
                <p>Zero brokerage. Direct developer pricing. We are authorised affiliate partners.</p>
              </div>
            </div>

            {/* RERA info */}
            {project.reraNumber && (
              <div className="bg-[#f5f3fd] border border-[#ede9f8] rounded-2xl p-4 text-sm">
                <div className="flex items-center gap-2 text-[#371f6e] font-semibold mb-1">
                  <Shield className="w-4 h-4" />RERA Registered
                </div>
                <p className="text-xs text-gray-500 break-all">{project.reraNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN GALLERY ── */}
      {galleryOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
          <button onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setGalleryIdx(Math.max(0, galleryIdx - 1))}
            className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setGalleryIdx(Math.min(allImages.length - 1, galleryIdx + 1))}
            className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
            <ChevronR className="w-5 h-5" />
          </button>
          <img src={allImages[galleryIdx].url} alt="" className="max-h-screen max-w-full object-contain px-16" />
          <p className="absolute bottom-4 text-white/60 text-sm">{galleryIdx + 1} / {allImages.length}</p>
        </div>
      )}

      {/* ── ENQUIRY MODAL ── */}
      {enquiryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#422D83] p-5 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Enquire About</h2>
                <p className="text-[#ede9f8] text-sm">{project.name} · {project.developer}</p>
              </div>
              <button onClick={() => setEnquiryOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            {enquirySent ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-14 h-14 text-[#422D83] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Enquiry Sent!</h3>
                <p className="text-gray-500 text-sm">Our expert will contact you within 24 hours.</p>
                <button onClick={() => setEnquiryOpen(false)} className="mt-6 px-6 py-2.5 bg-[#422D83] text-white rounded-xl text-sm font-medium hover:bg-[#2d1a60] transition">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitEnquiry} className="p-5 space-y-3">
                <input required placeholder="Your Name *" value={enquiryForm.name}
                  onChange={e => setEnquiryForm({...enquiryForm, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <div className="flex gap-2">
                  <select value={enquiryForm.countryCode} onChange={e => setEnquiryForm({...enquiryForm, countryCode: e.target.value})}
                    className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm w-20 focus:outline-none">
                    {['+91', '+971', '+1', '+44', '+65'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input required type="tel" placeholder="Phone Number *" value={enquiryForm.phone}
                    onChange={e => setEnquiryForm({...enquiryForm, phone: e.target.value})}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                </div>
                <input type="email" placeholder="Email (optional)" value={enquiryForm.email}
                  onChange={e => setEnquiryForm({...enquiryForm, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <textarea placeholder="Message (optional)" value={enquiryForm.message}
                  onChange={e => setEnquiryForm({...enquiryForm, message: e.target.value})} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] resize-none" />
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#422D83] hover:bg-[#2d1a60] text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-60">
                  {submitting ? 'Sending...' : 'Submit Enquiry'}
                </button>
                <p className="text-xs text-gray-400 text-center">Our advisor will call you within 24 hours</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
