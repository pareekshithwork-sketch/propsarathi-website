"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Search, MapPin, Building2, ChevronRight,
  TrendingUp, Shield, Users, Award,
  Menu, X, User, LogOut, ArrowRight
} from "lucide-react"
import { usePortal } from "./PortalProvider"
import { formatPrice } from "@/lib/portalAuth"
import SharedFooter from "./SharedFooter"

const BANGALORE_AREAS = [
  "Devanahalli", "Devanahalli North", "Yelahanka", "Hebbal", "Hennur", "Thanisandra",
  "Kogilu", "Bagalur", "Nandi Hills Road", "Whitefield", "Marathahalli", "Sarjapur Road",
  "Sarjapur", "Outer Ring Road", "Bellandur", "Panathur", "Varthur", "Electronic City",
  "Bannerghatta Road", "JP Nagar", "Kanakapura Road", "Mysore Road", "Tumkur Road",
  "Yeshwanthpur", "Rajajinagar", "Malleswaram", "Vijayanagar", "North Bangalore",
  "South Bangalore", "East Bangalore", "West Bangalore", "Koramangala", "Indiranagar",
  "HSR Layout", "BTM Layout", "Jayanagar",
]

const DUBAI_AREAS = [
  "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "Business Bay",
  "JVC (Jumeirah Village Circle)", "JVT", "Dubai Hills Estate", "Arabian Ranches",
  "Damac Hills", "Damac Hills 2", "Dubai Creek Harbour", "Dubai South", "Al Furjan",
  "Meydan", "Mohammed Bin Rashid City", "Dubai Islands", "Jumeirah", "Al Barsha",
  "Motor City", "Sports City", "International City", "Silicon Oasis", "Deira",
  "Bur Dubai", "Arjan", "Town Square",
]

const INR_BUDGETS = [
  "Any Budget", "Under ₹30L", "₹30L-60L", "₹60L-1Cr",
  "₹1Cr-1.5Cr", "₹1.5Cr-3Cr", "₹3Cr-5Cr", "Above ₹5Cr",
]

const AED_BUDGETS = [
  "Any Budget", "Under AED 500K", "AED 500K-1M", "AED 1M-2M",
  "AED 2M-4M", "AED 4M-7M", "AED 7M-15M", "Above AED 15M",
]

const CONFIG_PILLS = ["Any", "Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "5+ BHK"]
const PLOT_SIZE_PILLS = ["Any", "Up to 1200 sqft", "1200-1500 sqft", "1500-1800 sqft", "1800-2000 sqft", "2000-2400 sqft", "2400-3000 sqft", "3000+ sqft"]
const LAND_AREA_PILLS = ["Any", "1-5 Acres", "5-20 Acres", "20-50 Acres", "50-100 Acres", "100+ Acres"]

const PROJECT_TYPES = ["All", "Apartment", "Villa", "Plots", "Farmland", "Townhouse", "Villament"]
const CITIES = ["All Cities", "Bangalore", "Dubai"]

interface Project {
  id: number; slug: string; name: string; developer: string; city: string
  location: string; projectType: string; status: string; minPrice: number
  maxPrice: number; currency: string; numUnits: number; coverImage: string
  highlights: string[]; isFeatured: boolean; possessionDate: string
}

interface Props {
  featuredProjects: Project[]
  bangaloreCount: number
  dubaiCount: number
}

const STATUS_COLOR: Record<string, string> = {
  'Pre-Launch': 'bg-amber-500',
  'Just Launched': 'bg-[#422D83]',
  'Under Construction': 'bg-blue-500',
  'Ready to Move': 'bg-purple-500',
}

export default function HomepageClient({ featuredProjects, bangaloreCount, dubaiCount }: Props) {
  const router = useRouter()
  const { viewer, isLoggedIn, showLoginModal, logout } = usePortal()
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("All Cities")
  const [type, setType] = useState("All")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [budget, setBudget] = useState("Any Budget")
  const [config, setConfig] = useState("Any")
  const suggestionRef = useRef<HTMLDivElement>(null)

  function handleLocationChange(val: string) {
    setLocation(val)
    if (val.length >= 4) {
      const pool = city === "Dubai" ? DUBAI_AREAS : BANGALORE_AREAS
      const filtered = pool.filter(a => a.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
      setLocationSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  function selectSuggestion(area: string) {
    setLocation(area)
    setShowSuggestions(false)
  }

  function handleSearch() {
    const params = new URLSearchParams()
    const q = location || search
    if (q) params.set("q", q)
    if (city !== "All Cities") params.set("city", city)
    if (type !== "All") params.set("type", type)
    if (budget && budget !== "Any Budget") params.set("budget", budget)
    if (type === "Plots") {
      if (config !== "Any") params.set("plotSize", config)
    } else if (type === "Farmland") {
      if (config !== "Any") params.set("landArea", config)
    } else {
      if (config !== "Any") params.set("config", config)
    }
    router.push(`/properties?${params.toString()}`)
  }

  const navLinks = [
    { label: "Properties", href: "/properties" },
    { label: "Blog", href: "/blog" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Partner Portal", href: "/partner-portal" },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/propsarathi-logo.png" alt="PropSarathi" width={160} height={40} className="h-9 w-auto" />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  <div className="w-6 h-6 bg-[#ede9f8] rounded-full flex items-center justify-center text-[#371f6e] text-xs font-bold">
                    {viewer?.name?.[0] || viewer?.phone?.[0]}
                  </div>
                  <span className="hidden sm:block text-gray-700">{viewer?.name || viewer?.phone}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl w-48 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">{viewer?.name || 'My Account'}</p>
                      <p className="text-xs text-gray-400">{viewer?.phone}</p>
                    </div>
                    <button onClick={() => { logout(); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" />Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => showLoginModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#422D83] hover:bg-[#2d1a60] text-white text-sm font-medium rounded-xl transition">
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {/* Mobile search */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search properties..."
                className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
              />
              <button onClick={() => { handleSearch(); setMobileMenuOpen(false) }}
                className="px-3 bg-[#422D83]">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
            {navLinks.map(link => (
              <Link key={link.label} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO / SEARCH SECTION ── */}
      <section className="pt-16 min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f3d] via-[#2d1a60] to-[#422D83]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=60')] bg-cover bg-center opacity-30" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#422D83]/20 border border-[#422D83]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[#a99de0] text-sm font-medium">Pre-Launch & New Launch Projects</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="text-[#8b78d4]"> Property</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Direct from developers. Bangalore & Dubai. Expert advisory, zero brokerage confusion.
          </p>

          {/* Main Search Card */}
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6 text-left">
            {/* Row 1: Type tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-gray-100">
              {PROJECT_TYPES.map(t => (
                <button key={t} onClick={() => { setType(t); setConfig("Any") }}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${type === t ? "bg-[#422D83] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Row 2: City / Location / Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* City */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
                <select value={city} onChange={e => { setCity(e.target.value); setBudget("Any Budget"); setLocation(""); setShowSuggestions(false) }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Location autocomplete */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Location / Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={location}
                    onChange={e => handleLocationChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={city === "Dubai" ? "Dubai Marina, Business Bay..." : "Devanahalli, Whitefield..."}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50"
                  />
                </div>
                {showSuggestions && (
                  <div ref={suggestionRef} className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {locationSuggestions.map(area => (
                      <button
                        key={area}
                        onMouseDown={() => selectSuggestion(area)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f5f3fd] hover:text-[#371f6e] transition flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Budget</label>
                <select value={budget} onChange={e => setBudget(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {(city === "Dubai" ? AED_BUDGETS : INR_BUDGETS).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Dynamic config row (only when type != All) */}
            {type !== "All" && (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {type === "Plots" ? "Plot Size" : type === "Farmland" ? "Land Area" : "Configuration"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(type === "Plots" ? PLOT_SIZE_PILLS : type === "Farmland" ? LAND_AREA_PILLS : CONFIG_PILLS).map(pill => (
                    <button
                      key={pill}
                      onClick={() => setConfig(pill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${config === pill ? "bg-[#422D83] text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-[#6b56c0] hover:text-[#422D83]"}`}>
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row 4: Search button */}
            <button onClick={handleSearch}
              className="w-full bg-[#F17322] hover:bg-[#d4621a] text-white font-semibold rounded-xl py-3.5 text-sm transition flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search Properties
            </button>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Popular:</span>
              {["Devanahalli", "Whitefield", "North Bangalore", "Dubai Marina", "Downtown Dubai"].map(loc => (
                <button key={loc} onClick={() => { setLocation(loc); router.push(`/properties?q=${loc}`) }}
                  className="text-xs text-[#422D83] hover:text-[#371f6e] hover:underline transition">
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
            {[
              { label: "Projects", value: "50+" },
              { label: "Happy Investors", value: "500+" },
              { label: "Cities", value: "2" },
            ].map(s => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Projects</h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked by our advisory team</p>
          </div>
          <Link href="/properties" className="flex items-center gap-1.5 text-[#422D83] text-sm font-medium hover:gap-2.5 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton loaders */}
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* ── EMI CALCULATOR ── */}
      <EMICalculator />

      {/* ── CITY TABS ── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore by City</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                city: "Bangalore",
                tagline: "India's Silicon Valley",
                desc: "Pre-launch & new launch projects in Devanahalli, Whitefield, Sarjapur, Hebbal & more",
                image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80",
                count: bangaloreCount > 0 ? `${bangaloreCount} Project${bangaloreCount > 1 ? 's' : ''}` : "Coming Soon",
              },
              {
                city: "Dubai",
                tagline: "World's #1 Investment Destination",
                desc: "Luxury apartments, villas & townhouses across Dubai Marina, Downtown, Palm & more",
                image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
                count: dubaiCount > 0 ? `${dubaiCount} Project${dubaiCount > 1 ? 's' : ''}` : "Coming Soon",
              }
            ].map(c => (
              <Link key={c.city} href={`/properties?city=${c.city}`}
                className="group relative overflow-hidden rounded-2xl h-64 cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${c.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="text-xs bg-[#422D83] px-2 py-0.5 rounded-full font-medium mb-2 inline-block">{c.count}</span>
                  <h3 className="text-2xl font-bold">{c.city}</h3>
                  <p className="text-[#a99de0] text-sm font-medium">{c.tagline}</p>
                  <p className="text-gray-300 text-xs mt-1">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PROPSARATHI ── */}
      <section className="py-16 px-4 max-w-7xl mx-auto" id="about">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why PropSarathi?</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">We are more than advisors — we are your trusted guide in wealth creation through real estate</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Shield className="w-6 h-6" />, title: "100% Verified Projects", desc: "Every project is personally vetted by our team. We only list what we'd invest in ourselves.", color: "bg-blue-50 text-blue-600" },
            { icon: <TrendingUp className="w-6 h-6" />, title: "Pre-Launch Access", desc: "Get first access to projects before public launch — at the best prices.", color: "bg-[#f5f3fd] text-[#422D83]" },
            { icon: <Users className="w-6 h-6" />, title: "Expert Advisory", desc: "Dedicated RM, portfolio planning, and end-to-end support from search to possession.", color: "bg-purple-50 text-purple-600" },
            { icon: <Award className="w-6 h-6" />, title: "Transparent Fees", desc: "Zero hidden charges. Developer-direct pricing. We earn from developers, not you.", color: "bg-amber-50 text-amber-600" },
          ].map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SharedFooter />
    </div>
  )
}

// ── PROJECT CARD ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/properties/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-300" />
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute top-3 left-3 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {project.status}
        </div>
        {/* City badge */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3" />{project.city}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <p className="text-xs text-[#422D83] font-medium">{project.developer}</p>
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#422D83] transition">{project.name}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>

        {/* Highlights */}
        {project.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.highlights.slice(0, 3).map((h: string) => (
              <span key={h} className="text-xs bg-[#f5f3fd] text-[#371f6e] px-2 py-0.5 rounded-full border border-[#ede9f8]">{h}</span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="font-bold text-gray-900 text-base">
              {formatPrice(project.minPrice, project.currency)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[#422D83] text-sm font-medium group-hover:gap-2 transition-all">
            View Details <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── EMI Calculator ───────────────────────────────────────────────────────────

function EMICalculator() {
  const [currency, setCurrency] = useState<'INR' | 'AED'>('INR')
  const [price, setPrice] = useState(5000000)
  const [downPct, setDownPct] = useState(20)
  const [tenure, setTenure] = useState(20)
  const [rate, setRate] = useState(8.5)

  // Separate string states for the type inputs so partial typing works
  const [priceStr, setPriceStr] = useState('5000000')
  const [downStr, setDownStr] = useState('20')
  const [tenureStr, setTenureStr] = useState('20')
  const [rateStr, setRateStr] = useState('8.5')
  const priceInputRef = useRef<HTMLInputElement>(null)
  const isAED = currency === 'AED'

  // Format with commas — used for the live display
  function formatWithCommas(raw: string) {
    const n = Number(raw.replace(/[^0-9]/g, ''))
    if (isNaN(n) || raw === '') return raw
    return n.toLocaleString(isAED ? 'en-US' : 'en-IN')
  }

  // Handle price typing — strip commas, update state, restore cursor
  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const cursorBefore = input.selectionStart ?? 0
    const oldVal = input.value
    // Count digits before cursor in old value (ignoring commas)
    const digitsBeforeCursor = oldVal.slice(0, cursorBefore).replace(/,/g, '').length

    const raw = oldVal.replace(/,/g, '').replace(/[^0-9]/g, '')
    const newFormatted = raw === '' ? '' : Number(raw).toLocaleString(isAED ? 'en-US' : 'en-IN')

    setPriceStr(raw || '0')
    const v = Number(raw)
    if (v >= PRICE_MIN && v <= PRICE_MAX) setPrice(v)

    // After React re-render, restore cursor to correct digit position
    requestAnimationFrame(() => {
      const el = priceInputRef.current
      if (!el) return
      let count = 0, pos = 0
      for (let i = 0; i < newFormatted.length; i++) {
        if (newFormatted[i] !== ',' && newFormatted[i] !== ' ') count++
        if (count === digitsBeforeCursor) { pos = i + 1; break }
        pos = i + 1
      }
      el.setSelectionRange(pos, pos)
    })
  }

  // Realistic configs
  const PRICE_MIN = isAED ? 500000 : 1000000
  const PRICE_MAX = isAED ? 30000000 : 200000000
  const PRICE_STEP = isAED ? 50000 : 50000

  // ── EMI formula (standard reducing-balance) ──────────────────────────────
  const { loanAmount, emi, totalInterest, totalPayable, downAmount } = useMemo(() => {
    const down = price * (downPct / 100)
    const loan = price - down
    const r = rate / 100 / 12
    const n = tenure * 12
    if (n === 0) return { downAmount: down, loanAmount: loan, emi: 0, totalInterest: 0, totalPayable: loan }
    const emiVal = r === 0
      ? loan / n
      : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const total = emiVal * n
    return { downAmount: down, loanAmount: loan, emi: emiVal, totalInterest: total - loan, totalPayable: total }
  }, [price, downPct, tenure, rate])

  // ── Formatting ───────────────────────────────────────────────────────────
  // For breakdowns (large numbers) — show in Cr/L or M/K
  function fmtBig(v: number) {
    if (isAED) {
      if (v >= 1000000) return `AED ${(v / 1000000).toFixed(2)}M`
      if (v >= 1000) return `AED ${(v / 1000).toFixed(0)}K`
      return `AED ${Math.round(v).toLocaleString('en-US')}`
    }
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
    return `₹${Math.round(v).toLocaleString('en-IN')}`
  }

  // For EMI — always full number with commas (never L/Cr — more intuitive monthly)
  function fmtEMI(v: number) {
    if (isAED) return `AED ${Math.round(v).toLocaleString('en-US')}`
    return `₹${Math.round(v).toLocaleString('en-IN')}`
  }

  // Slider min/max labels
  function fmtLabel(v: number, field: string) {
    if (field === 'down') return `${v}%`
    if (field === 'tenure') return `${v} yr`
    if (field === 'rate') return `${v}%`
    return fmtBig(v)
  }

  // ── Currency switch ───────────────────────────────────────────────────────
  function switchCurrency(c: 'INR' | 'AED') {
    setCurrency(c)
    if (c === 'AED') {
      setPrice(2000000); setPriceStr('2000000')
      setRate(4.5); setRateStr('4.5')
    } else {
      setPrice(5000000); setPriceStr('5000000')
      setRate(8.5); setRateStr('8.5')
    }
  }

  // ── Sync helpers ─────────────────────────────────────────────────────────
  function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

  function commitPrice(raw: string) {
    const v = clamp(Number(raw.replace(/[^0-9.]/g, '')) || price, PRICE_MIN, PRICE_MAX)
    setPrice(v); setPriceStr(String(v))
  }
  function commitDown(raw: string) {
    const v = clamp(Number(raw) || downPct, 5, 80)
    setDownPct(v); setDownStr(String(v))
  }
  function commitTenure(raw: string) {
    const v = clamp(Math.round(Number(raw) || tenure), 1, 30)
    setTenure(v); setTenureStr(String(v))
  }
  function commitRate(raw: string) {
    const v = clamp(Number(raw) || rate, 1, 20)
    setRate(Math.round(v * 10) / 10); setRateStr(String(Math.round(v * 10) / 10))
  }

  // ── Breakdown bar widths ──────────────────────────────────────────────────
  const principalPct = totalPayable > 0 ? Math.round((loanAmount / totalPayable) * 100) : 0
  const interestPct = 100 - principalPct

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#1a0f3d] to-[#2d1a60]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">EMI Calculator</h2>
          <p className="text-gray-300 text-sm">Drag the sliders or type a value — your EMI updates instantly</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8">

          {/* ── LEFT: Inputs ── */}
          <div className="space-y-6">
            {/* Currency toggle */}
            <div className="flex gap-2 bg-white/10 rounded-xl p-1 w-fit">
              {(['INR', 'AED'] as const).map(c => (
                <button key={c} onClick={() => switchCurrency(c)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition ${currency === c ? 'bg-[#422D83] text-white shadow' : 'text-gray-300 hover:text-white'}`}>
                  {c === 'INR' ? '🇮🇳 India (INR)' : '🇦🇪 Dubai (AED)'}
                </button>
              ))}
            </div>

            {/* Property Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Property Price</label>
                <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                  <span className="text-xs text-gray-400">{isAED ? 'AED' : '₹'}</span>
                  <input
                    ref={priceInputRef}
                    type="text"
                    inputMode="numeric"
                    value={formatWithCommas(priceStr)}
                    onChange={handlePriceChange}
                    onBlur={() => commitPrice(priceStr)}
                    className="w-28 bg-transparent text-white text-xs font-bold text-right focus:outline-none"
                  />
                </div>
              </div>
              <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={price}
                onChange={e => { const v = Number(e.target.value); setPrice(v); setPriceStr(String(v)) }}  // priceStr stays raw; formatWithCommas handles display
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#8b78d4]" />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>{fmtBig(PRICE_MIN)}</span>
                <span className="text-[#8b78d4] font-semibold text-xs">{fmtBig(price)}</span>
                <span>{fmtBig(PRICE_MAX)}</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Down Payment</label>
                <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={downStr}
                    min={5} max={80}
                    onChange={e => { setDownStr(e.target.value); const v = Number(e.target.value); if (v >= 5 && v <= 80) setDownPct(v) }}
                    onBlur={() => commitDown(downStr)}
                    className="w-10 bg-transparent text-white text-xs font-bold text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
              <input type="range" min={5} max={80} step={1} value={downPct}
                onChange={e => { const v = Number(e.target.value); setDownPct(v); setDownStr(String(v)) }}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#8b78d4]" />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>5%</span>
                <span className="text-[#8b78d4] font-semibold text-xs">{downPct}% = {fmtBig(downAmount)}</span>
                <span>80%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Loan Tenure</label>
                <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={tenureStr}
                    min={1} max={30}
                    onChange={e => { setTenureStr(e.target.value); const v = Math.round(Number(e.target.value)); if (v >= 1 && v <= 30) setTenure(v) }}
                    onBlur={() => commitTenure(tenureStr)}
                    className="w-8 bg-transparent text-white text-xs font-bold text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400">yrs</span>
                </div>
              </div>
              <input type="range" min={1} max={30} step={1} value={tenure}
                onChange={e => { const v = Number(e.target.value); setTenure(v); setTenureStr(String(v)) }}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#8b78d4]" />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>1 yr</span>
                <span className="text-[#8b78d4] font-semibold text-xs">{tenure} years ({tenure * 12} EMIs)</span>
                <span>30 yrs</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">Interest Rate (p.a.)</label>
                <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={rateStr}
                    min={1} max={20} step={0.1}
                    onChange={e => { setRateStr(e.target.value); const v = Number(e.target.value); if (v >= 1 && v <= 20) setRate(v) }}
                    onBlur={() => commitRate(rateStr)}
                    className="w-10 bg-transparent text-white text-xs font-bold text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
              <input type="range" min={1} max={20} step={0.1} value={rate}
                onChange={e => { const v = Number(e.target.value); setRate(v); setRateStr(String(v)) }}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#8b78d4]" />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>1%</span>
                <span className="text-[#8b78d4] font-semibold text-xs">{isAED ? 'UAE avg ~4–5%' : 'India avg ~8–9%'}</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="flex flex-col justify-center space-y-4">
            {/* EMI hero */}
            <div className="bg-gradient-to-br from-[#422D83] to-[#5b40b0] rounded-2xl p-6 text-center shadow-xl">
              <p className="text-purple-200 text-sm mb-1">Monthly EMI</p>
              <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{fmtEMI(emi)}</p>
              <p className="text-purple-300 text-xs mt-2">{tenure} years @ {rate}% p.a.</p>
            </div>

            {/* Breakdown rows */}
            {[
              { label: 'Property Price', value: price, highlight: false },
              { label: 'Down Payment', value: downAmount, highlight: false },
              { label: 'Loan Amount', value: loanAmount, highlight: true },
              { label: 'Total Interest', value: totalInterest, highlight: false },
              { label: 'Total Payable', value: totalPayable, highlight: true },
            ].map(r => (
              <div key={r.label} className={`flex justify-between items-center rounded-xl px-4 py-3 ${r.highlight ? 'bg-white/20' : 'bg-white/10'}`}>
                <span className="text-gray-300 text-sm">{r.label}</span>
                <span className={`font-bold text-sm ${r.highlight ? 'text-white' : 'text-gray-200'}`}>{fmtBig(r.value)}</span>
              </div>
            ))}

            {/* Principal vs Interest bar */}
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Principal {principalPct}%</span>
                <span>Interest {interestPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden flex">
                <div className="h-full bg-[#8b78d4] transition-all duration-300" style={{ width: `${principalPct}%` }} />
                <div className="h-full bg-orange-400 flex-1" />
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">* Indicative only. Actual EMI depends on lender terms.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
