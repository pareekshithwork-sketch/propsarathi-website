"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  MapPin, Building2, Home, ArrowLeft, Phone,
  ChevronRight, CheckCircle, Train, Plane, Briefcase,
  Calendar, Shield, Ruler, Layers, Hash,
  X, ChevronLeft, ChevronRight as ChevronR,
  ExternalLink, Download, Play, Eye, ZoomIn, Globe
} from "lucide-react"
import { usePortal } from "./PortalProvider"
import { formatPrice } from "@/lib/portalAuth"
import { LogoCompact } from "@/components/Logo"
import SavePropertyButton from "@/components/SavePropertyButton"
import SecureDocumentViewer from "@/components/SecureDocumentViewer"
import ReferralTimer from "@/components/ReferralTimer"
import ShareButton from "@/components/ShareButton"
import PhoneVerificationScreen from "@/components/PhoneVerificationScreen"
import { ActivityTracker } from "@/lib/activityTracker"
import { captureReferral } from "@/lib/referral"
import { getDeviceFingerprint } from "@/lib/deviceAuth"

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Unit {
  id: number; unitType: string; bedrooms: number; bathrooms: number
  minAreaSqft: number; maxAreaSqft: number; minPrice: number; maxPrice: number
  availableUnits: number; totalUnits: number; floorPlanUrl: string
}

interface ProjectImage { id: number; url: string; caption: string; mediaType: string }

interface FloorPlan {
  name: string; image_url?: string; size_sqft?: number; bedrooms?: number; price_from?: number
}

interface NearbyLocation {
  name: string; distance_km: number; category: string; travel_mins?: number
}

interface Project {
  id: number; slug: string; name: string; developer: string; city: string
  location: string; address: string; projectType: string; status: string
  totalAreaAcres: number; numTowers: number; numFloors: number; numUnits: number
  minPrice: number; maxPrice: number; currency: string; possessionDate: string
  reraNumber: string; metroStation: string; metroDistanceKm: number
  airportDistanceKm: number; techParkDistanceKm: number
  nearbyLandmarks: string; description: string; amenities: string[]
  highlights: string[]; coverImage: string; brochureUrl: string; videoUrl: string
  units: Unit[]; images: ProjectImage[]
  seoTitle: string; seoDescription: string
  // Payment plan
  paymentPlanBooking: number | null; paymentPlanConstruction: number | null
  paymentPlanPossession: number | null; paymentPlanNote: string; paymentPlanEmi: boolean
  // Floor plans & developer
  floorPlans: string
  developerDescription: string; developerLogo: string; developerFounded: string
  developerProjectsCount: number | null; developerWebsite: string
  // Nearby locations (structured)
  nearbyLocations: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'units', label: 'Units' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'payment-plan', label: 'Payment Plan' },
  { id: 'floor-plans', label: 'Floor Plans' },
  { id: 'developer', label: 'Developer' },
  { id: 'location', label: 'Location' },
  { id: 'brochure', label: 'Brochure' },
  { id: 'gallery', label: 'Gallery' },
]

const NAV_LINKS = [
  { id: 'overview', icon: '📋', label: 'Overview' },
  { id: 'units', icon: '🏠', label: 'Unit Types & Sizes' },
  { id: 'amenities', icon: '✅', label: 'Amenities' },
  { id: 'payment-plan', icon: '💰', label: 'Payment Plan' },
  { id: 'floor-plans', icon: '📐', label: 'Floor Plans' },
  { id: 'developer', icon: '🏢', label: 'About Developer' },
  { id: 'location', icon: '📍', label: 'Location & Nearby' },
  { id: 'brochure', icon: '📄', label: 'Brochure' },
  { id: 'gallery', icon: '🖼️', label: 'Gallery' },
]

const STATUS_COLOR: Record<string, string> = {
  'Pre-Launch': 'bg-amber-500 text-white',
  'Just Launched': 'bg-[#422D83] text-white',
  'Under Construction': 'bg-blue-500 text-white',
  'Ready to Move': 'bg-purple-500 text-white',
}

const CATEGORY_ICONS: Record<string, string> = {
  Airport: '✈️', Metro: '🚇', School: '🏫', Hospital: '🏥',
  Mall: '🛍️', 'IT Park': '💻', Beach: '🏖️', Park: '🌳',
  Temple: '🛕', Restaurant: '🍽️', Highway: '🛣️', Railway: '🚂',
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      style={{ scrollMarginTop: '120px' }}
      className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
    >
      <h2 className="font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </section>
  )
}

// ─── WhatsApp CTA helper ──────────────────────────────────────────────────────

function WAButton({ text }: { text: string }) {
  const msg = encodeURIComponent(text)
  return (
    <a
      href={`https://wa.me/917090303535?text=${msg}`}
      target="_blank"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold rounded-xl transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {text}
    </a>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectDetailClient({ project }: { project: Project }) {
  const { viewer, isLoggedIn, showLoginModal, trackTime, stopTracking } = usePortal()
  const [activeSection, setActiveSection] = useState('overview')
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({ name: viewer?.name || '', phone: viewer?.phone || '', countryCode: '+91', email: '', message: '' })
  const [enquirySent, setEnquirySent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Referral + secure docs state
  const [clientUser, setClientUser] = useState<{ clientId: number; email: string; name: string } | null | undefined>(undefined)
  const [isDeviceVerified, setIsDeviceVerified] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [refSharerName, setRefSharerName] = useState<string | null>(null)
  const [refRmName, setRefRmName] = useState<string | null>(null)
  const trackerRef = useRef<ActivityTracker | null>(null)
  const fpRef = useRef<string>('')
  const startTimeRef = useRef(Date.now())
  const tabBarRef = useRef<HTMLDivElement>(null)

  // Track time on this page
  useEffect(() => {
    trackTime(project.slug, project.name)
    startTimeRef.current = Date.now()
    return () => { stopTracking() }
  }, [project.slug])

  // Init referral capture, activity tracker, client session, device check
  useEffect(() => {
    trackerRef.current = new ActivityTracker()
    fpRef.current = getDeviceFingerprint()

    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      captureReferral(ref)
      setRefCode(ref)
      fetch('/api/share/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref }),
      }).then(r => r.json()).then(d => {
        if (d.sharerName) setRefSharerName(d.sharerName)
        if (d.rmName) setRefRmName(d.rmName)
      }).catch(() => {})
      trackerRef.current.track({ eventType: 'referral_visit', projectSlug: project.slug, shareCode: ref })
    }

    // Fetch client session + device status
    fetch('/api/auth/client/me').then(r => {
      if (!r.ok) { setClientUser(null); return null }
      return r.json()
    }).then(user => {
      if (!user) { setClientUser(null); return }
      setClientUser({ clientId: user.id, email: user.email, name: user.name })
      fetch('/api/auth/client/check-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fpRef.current }),
      }).then(r => r.json()).then(d => { setIsDeviceVerified(!!d.verified) }).catch(() => {})
    }).catch(() => { setClientUser(null) })

    // Listen for verify trigger from SecureDocumentViewer locked state
    const onShowVerify = () => setShowVerify(true)
    document.addEventListener('ps:show-verify', onShowVerify)

    return () => {
      trackerRef.current?.destroy()
      document.removeEventListener('ps:show-verify', onShowVerify)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prefill form if logged in
  useEffect(() => {
    if (viewer) setEnquiryForm(f => ({ ...f, name: viewer.name || '', phone: viewer.phone || '' }))
  }, [viewer])

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const sectionIds = TABS.map(t => t.id)
    const visible = new Set<string>()

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })
        const active = sectionIds.find(id => visible.has(id))
        if (active) setActiveSection(active)
      },
      { rootMargin: '-120px 0px -50% 0px', threshold: 0 }
    )

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [])

  // Scroll active tab into view in the tab bar
  useEffect(() => {
    const bar = tabBarRef.current
    if (!bar) return
    const btn = bar.querySelector(`[data-tab="${activeSection}"]`) as HTMLElement | null
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeSection])

  // Keyboard navigation for gallery lightbox
  useEffect(() => {
    if (!galleryOpen) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setGalleryIdx(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setGalleryIdx(i => Math.min(allImages.length - 1, i + 1))
      if (e.key === 'Escape') setGalleryOpen(false)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [galleryOpen]) // allImages.length stable per render

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 120
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  function openLightbox(idx: number) {
    setGalleryIdx(idx)
    setGalleryOpen(true)
  }

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
          name: enquiryForm.name, phone: enquiryForm.phone,
          email: enquiryForm.email, message: enquiryForm.message,
          propertySlug: project.slug, source: 'Property Page',
          shareCode: refCode ?? undefined,
        })
      })
      setEnquirySent(true)
    } catch {}
    setSubmitting(false)
  }

  // Parse JSON fields safely
  const floorPlans: FloorPlan[] = (() => {
    try { return project.floorPlans ? JSON.parse(project.floorPlans) : [] } catch { return [] }
  })()

  const nearbyLocations: NearbyLocation[] = (() => {
    try { return project.nearbyLocations ? JSON.parse(project.nearbyLocations) : [] } catch { return [] }
  })()

  const nearbyByCategory = nearbyLocations.reduce<Record<string, NearbyLocation[]>>((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = []
    acc[loc.category].push(loc)
    return acc
  }, {})

  const hasPaymentPlan = project.paymentPlanBooking != null || project.paymentPlanConstruction != null || project.paymentPlanPossession != null
  const landmarks = project.nearbyLandmarks ? project.nearbyLandmarks.split('|') : []

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── MAIN HEADER (sticky z-40) ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <LogoCompact href="" className="hidden sm:flex" />
            <span className="text-sm font-medium sm:hidden">All Properties</span>
          </Link>
          <div className="flex-1 min-w-0 text-center hidden md:block">
            <p className="text-sm font-semibold text-gray-800 truncate">{project.name}</p>
            <p className="text-xs text-gray-400">{project.developer} · {project.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <SavePropertyButton slug={project.slug} />
            <ShareButton
              projectSlug={project.slug}
              projectName={project.name}
              isLoggedIn={clientUser !== null && clientUser !== undefined}
              redirectPath={`/properties/${project.slug}`}
            />
            <button
              onClick={() => { if (!isLoggedIn) { showLoginModal(false, project.name); return } setEnquiryOpen(true) }}
              className="px-4 py-2 bg-[#F17322] hover:bg-[#d4621a] text-white text-sm font-semibold rounded-xl transition">
              Enquire Now
            </button>
          </div>
        </div>
      </header>

      {/* ── STICKY TAB BAR (z-30, sits below header) ── */}
      <div ref={tabBarRef} className="sticky top-14 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeSection === tab.id
                    ? 'border-[#422D83] text-[#422D83] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">

          {/* ── LEFT: SCROLLABLE SECTIONS ── */}
          <div className="flex-1 min-w-0">

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 mb-5 cursor-pointer h-72 md:h-96 group"
              onClick={() => openLightbox(0)}>
              {allImages[0] && (
                <img src={allImages[galleryIdx]?.url || allImages[0].url} alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              )}
              <div className={`absolute top-4 left-4 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-xs font-bold px-3 py-1.5 rounded-full`}>
                {project.status}
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button onClick={e => { e.stopPropagation(); setGalleryIdx(Math.max(0, galleryIdx - 1)) }}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setGalleryIdx(Math.min(allImages.length - 1, galleryIdx + 1)) }}
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
            <div style={{ scrollMarginTop: '120px' }} className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
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

            {/* ══════════════════════════════════════════════════
                SECTION 1 — OVERVIEW
            ══════════════════════════════════════════════════ */}
            <Section id="overview" title="Overview">
              <div className="space-y-5">
                {project.description && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">About {project.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                  </div>
                )}
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
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 2 — UNITS
            ══════════════════════════════════════════════════ */}
            <Section id="units" title="Unit Configurations & Pricing">
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
                            {unit.bathrooms && <span>{unit.bathrooms} Bath</span>}
                            {unit.minAreaSqft && (
                              <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />
                                {unit.minAreaSqft === unit.maxAreaSqft
                                  ? `${unit.minAreaSqft.toLocaleString()} sqft`
                                  : `${unit.minAreaSqft.toLocaleString()} – ${unit.maxAreaSqft.toLocaleString()} sqft`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {unit.minPrice === unit.maxPrice
                              ? formatPrice(unit.minPrice, project.currency)
                              : `${formatPrice(unit.minPrice, project.currency)} – ${formatPrice(unit.maxPrice, project.currency)}`}
                          </p>
                          {unit.totalUnits && (
                            <p className="text-xs text-gray-400 mt-0.5">{unit.availableUnits} / {unit.totalUnits} available</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        {unit.minAreaSqft && unit.minPrice && (
                          <p className="text-xs text-gray-400">~{formatPrice(Math.round(unit.minPrice / unit.minAreaSqft), project.currency)}/sqft</p>
                        )}
                        <button onClick={() => setEnquiryOpen(true)} className="text-xs text-[#422D83] font-medium hover:underline ml-auto">
                          Enquire for this unit →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Unit details coming soon.{' '}
                    <button onClick={() => setEnquiryOpen(true)} className="text-[#422D83] font-medium hover:underline">Enquire for pricing</button>
                  </p>
                </div>
              )}
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 3 — AMENITIES
            ══════════════════════════════════════════════════ */}
            <Section id="amenities" title="Amenities">
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
                <p className="text-gray-400 text-sm text-center py-6">Amenities details coming soon.</p>
              )}
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 4 — PAYMENT PLAN
            ══════════════════════════════════════════════════ */}
            <Section id="payment-plan" title="Payment Plan">
              {/* Secure payment plan document */}
              {clientUser !== undefined && (
                <div className="mb-5">
                  <SecureDocumentViewer
                    projectSlug={project.slug}
                    docType="payment_plan"
                    title="Payment Plan Document"
                    isLoggedIn={clientUser !== null}
                    isDeviceVerified={isDeviceVerified}
                    redirectPath={`/properties/${project.slug}`}
                  />
                </div>
              )}
              {hasPaymentPlan ? (
                <div className="space-y-5">
                  {/* Three-step visual */}
                  <div className="relative flex items-start justify-between gap-2">
                    {/* Connector line behind steps */}
                    <div className="absolute top-7 left-[16.7%] right-[16.7%] h-0.5 bg-gray-200 z-0" />
                    {[
                      { label: 'Booking', pct: project.paymentPlanBooking, color: 'bg-[#422D83]', text: 'text-[#422D83]' },
                      { label: 'During Construction', pct: project.paymentPlanConstruction, color: 'bg-blue-500', text: 'text-blue-600' },
                      { label: 'On Possession', pct: project.paymentPlanPossession, color: 'bg-green-500', text: 'text-green-700' },
                    ].map((step, i) => (
                      <div key={i} className="relative z-10 flex-1 flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-md`}>
                          {step.pct != null ? `${step.pct}%` : '—'}
                        </div>
                        <p className="text-xs text-center text-gray-600 font-medium leading-tight">{step.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* EMI badge */}
                  {project.paymentPlanEmi && (
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4" /> EMI Available
                    </div>
                  )}

                  {/* Note */}
                  {project.paymentPlanNote && (
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-4 leading-relaxed">
                      {project.paymentPlanNote}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-gray-400 text-sm">Contact us for payment plan details, EMI options, and bank tie-ups.</p>
                  <WAButton text={`Hi, I'd like to know the payment plan for ${project.name}`} />
                </div>
              )}
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 5 — FLOOR PLANS
            ══════════════════════════════════════════════════ */}
            <Section id="floor-plans" title="Floor Plans">
              {/* Secure uploaded floor plan documents */}
              {clientUser !== undefined && (
                <div className="mb-5">
                  <SecureDocumentViewer
                    projectSlug={project.slug}
                    docType="floor_plan"
                    title="Floor Plans"
                    isLoggedIn={clientUser !== null}
                    isDeviceVerified={isDeviceVerified}
                    redirectPath={`/properties/${project.slug}`}
                  />
                </div>
              )}
              {/* Static floor plan images from JSON (legacy/fallback) */}
              {floorPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {floorPlans.map((fp, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:border-[#c4b8ef] hover:shadow-sm transition">
                      {fp.image_url && (
                        <div
                          className="relative h-44 bg-gray-100 cursor-pointer group overflow-hidden"
                          onClick={() => {
                            const imgIdx = allImages.findIndex(img => img.url === fp.image_url)
                            if (imgIdx >= 0) openLightbox(imgIdx)
                            else {
                              // Temporarily open with this image
                              setGalleryIdx(0)
                              setGalleryOpen(true)
                            }
                          }}
                        >
                          <img src={fp.image_url} alt={fp.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
                          </div>
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-800">{fp.name}</h4>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                          {fp.bedrooms != null && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{fp.bedrooms === 0 ? 'Studio' : `${fp.bedrooms} BHK`}</span>}
                          {fp.size_sqft && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{fp.size_sqft.toLocaleString()} sqft</span>}
                          {fp.price_from && <span className="font-semibold text-[#422D83]">{formatPrice(fp.price_from, project.currency)} onwards</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-gray-400 text-sm">Floor plans will be updated soon. Contact us to get the latest floor plans.</p>
                  <WAButton text={`Hi, I'd like to see the floor plans for ${project.name}`} />
                </div>
              )}
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 6 — DEVELOPER
            ══════════════════════════════════════════════════ */}
            <Section id="developer" title="About the Developer">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {project.developerLogo && (
                    <img src={project.developerLogo} alt={project.developer} className="w-16 h-16 object-contain rounded-xl border border-gray-100 bg-white p-2 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.developer}</h3>
                    {(project.developerFounded || project.developerProjectsCount) && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {project.developerFounded && (
                          <div className="text-center">
                            <p className="font-bold text-[#422D83]">{project.developerFounded}</p>
                            <p className="text-xs text-gray-400">Founded</p>
                          </div>
                        )}
                        {project.developerProjectsCount && (
                          <div className="text-center">
                            <p className="font-bold text-[#422D83]">{project.developerProjectsCount}+</p>
                            <p className="text-xs text-gray-400">Projects Delivered</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {project.developerDescription ? (
                  <p className="text-sm text-gray-600 leading-relaxed">{project.developerDescription}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">More developer information coming soon.</p>
                )}
                {project.developerWebsite && (
                  <a href={project.developerWebsite} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    <Globe className="w-4 h-4" />Visit Developer Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 7 — LOCATION & NEARBY
            ══════════════════════════════════════════════════ */}
            <Section id="location" title="Location & Nearby">
              <div className="space-y-5">
                {/* Connectivity cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {project.metroStation && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1"><Train className="w-4 h-4" /><span className="text-xs font-medium">Metro</span></div>
                      <p className="font-semibold text-gray-800 text-sm">{project.metroStation}</p>
                      {project.metroDistanceKm && <p className="text-xs text-gray-400 mt-0.5">{project.metroDistanceKm} km away</p>}
                    </div>
                  )}
                  {project.airportDistanceKm && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-600 mb-1"><Plane className="w-4 h-4" /><span className="text-xs font-medium">Airport</span></div>
                      <p className="font-semibold text-gray-800 text-sm">International Airport</p>
                      <p className="text-xs text-gray-400 mt-0.5">{project.airportDistanceKm} km away</p>
                    </div>
                  )}
                  {project.techParkDistanceKm && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-purple-600 mb-1"><Briefcase className="w-4 h-4" /><span className="text-xs font-medium">Tech Park</span></div>
                      <p className="font-semibold text-gray-800 text-sm">Nearest Tech Hub</p>
                      <p className="text-xs text-gray-400 mt-0.5">{project.techParkDistanceKm} km away</p>
                    </div>
                  )}
                </div>

                {/* Structured nearby locations (new) */}
                {Object.keys(nearbyByCategory).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">What's Nearby</h3>
                    <div className="space-y-3">
                      {Object.entries(nearbyByCategory).map(([cat, locs]) => (
                        <div key={cat}>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            {CATEGORY_ICONS[cat] || '📌'} {cat}
                          </p>
                          <div className="space-y-1.5">
                            {locs.map((loc, i) => (
                              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
                                <span className="text-gray-700 font-medium">{loc.name}</span>
                                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 ml-2">
                                  <span>{loc.distance_km} km</span>
                                  {loc.travel_mins && <span>{loc.travel_mins} mins</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy landmarks */}
                {landmarks.length > 0 && nearbyLocations.length === 0 && (
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

                {/* Map placeholder + Google Maps link */}
                <div className="bg-gray-100 rounded-2xl h-56 flex flex-col items-center justify-center border border-gray-200 gap-3">
                  <MapPin className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">{project.location}, {project.city}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(project.address || project.location + ' ' + project.city)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-sm text-[#422D83] font-medium hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />Open in Google Maps
                  </a>
                </div>

                {Object.keys(nearbyByCategory).length === 0 && landmarks.length === 0 && (
                  <div className="text-center pt-2 space-y-3">
                    <p className="text-gray-400 text-sm">Contact us to know more about this location.</p>
                    <WAButton text={`Hi, I'd like to know about the location of ${project.name}`} />
                  </div>
                )}
              </div>
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 8 — BROCHURE
            ══════════════════════════════════════════════════ */}
            <Section id="brochure" title="Project Brochure">
              {clientUser !== undefined ? (
                <SecureDocumentViewer
                  projectSlug={project.slug}
                  docType="brochure"
                  title="Project Brochure"
                  isLoggedIn={clientUser !== null}
                  isDeviceVerified={isDeviceVerified}
                  redirectPath={`/properties/${project.slug}`}
                />
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
              )}
            </Section>

            {/* ══════════════════════════════════════════════════
                SECTION 9 — GALLERY
            ══════════════════════════════════════════════════ */}
            <Section id="gallery" title="Photo Gallery">
              {allImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => openLightbox(i)}
                      className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-gray-100">
                      <img src={img.url} alt={img.caption || project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                        <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">
                        {i + 1} / {allImages.length}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Gallery photos coming soon.</p>
              )}
            </Section>

          </div>

          {/* ── RIGHT PANEL (sticky) ── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-[120px] space-y-4">

              {/* Price / CTA card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
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
                      <span className="font-medium text-gray-700 text-xs">{project.reraNumber.length > 20 ? project.reraNumber.slice(0, 20) + '…' : project.reraNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Type</span>
                    <span className="font-medium text-gray-700">{project.projectType}</span>
                  </div>
                </div>
                <button
                  onClick={() => { if (!isLoggedIn) { showLoginModal(true, project.name); return } setEnquiryOpen(true) }}
                  className="w-full bg-[#F17322] hover:bg-[#d4621a] text-white font-semibold rounded-xl py-3 text-sm transition mb-2 shadow-sm hover:shadow-md">
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

              {/* Quick Navigation */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Explore This Property</p>
                <div className="space-y-0.5">
                  {NAV_LINKS.map(link => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left ${
                        activeSection === link.id
                          ? 'bg-[#f5f3fd] text-[#422D83] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#422D83]'
                      }`}
                    >
                      <span className="text-base leading-none">{link.icon}</span>
                      {link.label}
                    </button>
                  ))}
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
      </div>

      {/* ── FULLSCREEN GALLERY LIGHTBOX ── */}
      {galleryOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setGalleryOpen(false)}
        >
          <button onClick={e => { e.stopPropagation(); setGalleryOpen(false) }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10">
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setGalleryIdx(i => Math.max(0, i - 1)) }}
            disabled={galleryIdx === 0}
            className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition disabled:opacity-30 z-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setGalleryIdx(i => Math.min(allImages.length - 1, i + 1)) }}
            disabled={galleryIdx === allImages.length - 1}
            className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition disabled:opacity-30 z-10">
            <ChevronR className="w-5 h-5" />
          </button>
          <img
            src={allImages[galleryIdx].url}
            alt={allImages[galleryIdx].caption || project.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-sm font-medium">
            {galleryIdx + 1} / {allImages.length}
            {allImages[galleryIdx].caption && ` · ${allImages[galleryIdx].caption}`}
          </p>
          <p className="absolute bottom-10 text-white/30 text-xs">Use ← → arrows or keyboard to navigate · Esc to close</p>
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
                <button onClick={() => setEnquiryOpen(false)} className="mt-6 px-6 py-2.5 bg-[#422D83] text-white rounded-xl text-sm font-medium hover:bg-[#2d1a60] transition">Close</button>
              </div>
            ) : (
              <form onSubmit={submitEnquiry} className="p-5 space-y-3">
                <input required placeholder="Your Name *" value={enquiryForm.name}
                  onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <div className="flex gap-2">
                  <select value={enquiryForm.countryCode} onChange={e => setEnquiryForm({ ...enquiryForm, countryCode: e.target.value })}
                    className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm w-20 focus:outline-none">
                    {['+91', '+971', '+1', '+44', '+65'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input required type="tel" placeholder="Phone Number *" value={enquiryForm.phone}
                    onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                </div>
                <input type="email" placeholder="Email (optional)" value={enquiryForm.email}
                  onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <textarea placeholder="Message (optional)" value={enquiryForm.message}
                  onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })} rows={2}
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

      {/* ── REFERRAL TIMER (shown to non-logged-in visitors from share links) ── */}
      {refCode && clientUser === null && (
        <ReferralTimer
          shareCode={refCode}
          redirectPath={`/properties/${project.slug}`}
          sharerName={refSharerName ?? undefined}
          rmName={refRmName ?? undefined}
        />
      )}

      {/* ── PHONE VERIFICATION OVERLAY ── */}
      {showVerify && clientUser && (
        <PhoneVerificationScreen
          fingerprint={fpRef.current}
          userEmail={clientUser.email}
          onVerified={() => { setIsDeviceVerified(true); setShowVerify(false) }}
          onDismiss={() => setShowVerify(false)}
        />
      )}
    </div>
  )
}
