"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Search, MapPin, Building2, SlidersHorizontal, X, ChevronDown,
  Menu, User, LogOut, ArrowLeft, Grid3X3, List
} from "lucide-react"
import { usePortal } from "./PortalProvider"
import { formatPrice } from "@/lib/portalAuth"
import SavePropertyButton from "@/components/SavePropertyButton"

const CITIES = ["All Cities", "Bangalore", "Dubai"]
const PROJECT_TYPES = ["All Types", "Apartment", "Villa", "Plots", "Farmland", "Townhouse", "Villament", "Commercial"]
const STATUSES = ["All Status", "Pre-Launch", "Just Launched", "Under Construction", "Ready to Move"]
const BEDROOM_OPTIONS = ["Any", "1", "2", "3", "4", "5+"]
const BUDGET_RANGES_INR = [
  { label: "Any Budget", min: 0, max: 0 },
  { label: "Under ₹50L", min: 0, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹3Cr", min: 10000000, max: 30000000 },
  { label: "₹3Cr+", min: 30000000, max: 0 },
]
const BUDGET_RANGES_AED = [
  { label: "Any Budget", min: 0, max: 0 },
  { label: "Under AED 1M", min: 0, max: 1000000 },
  { label: "AED 1M – 3M", min: 1000000, max: 3000000 },
  { label: "AED 3M – 5M", min: 3000000, max: 5000000 },
  { label: "AED 5M+", min: 5000000, max: 0 },
]
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
]

const STATUS_COLOR: Record<string, string> = {
  'Pre-Launch': 'bg-amber-500',
  'Just Launched': 'bg-[#422D83]',
  'Under Construction': 'bg-blue-500',
  'Ready to Move': 'bg-purple-500',
}

export default function PropertiesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { viewer, isLoggedIn, showLoginModal, logout } = usePortal()

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || 'All Cities')
  const [type, setType] = useState(searchParams.get('type') || 'All Types')
  const [status, setStatus] = useState(searchParams.get('status') || 'All Status')
  const [bedrooms, setBedrooms] = useState('Any')
  const [budgetIdx, setBudgetIdx] = useState(0)
  const [sort, setSort] = useState('newest')

  const budgetRanges = city === 'Dubai' ? BUDGET_RANGES_AED : BUDGET_RANGES_INR

  useEffect(() => { loadProjects() }, [city, type, status, search, budgetIdx, sort])

  async function loadProjects() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (city !== 'All Cities') params.set('city', city)
      if (type !== 'All Types') params.set('type', type)
      if (status !== 'All Status') params.set('status', status)
      const budget = budgetRanges[budgetIdx]
      if (budget.min) params.set('minPrice', budget.min.toString())
      if (budget.max) params.set('maxPrice', budget.max.toString())

      const res = await fetch(`/api/properties?${params}`)
      const data = await res.json()
      if (data.success) {
        let results = data.projects
        if (sort === 'price_asc') results = [...results].sort((a: any, b: any) => (a.minPrice || 0) - (b.minPrice || 0))
        else if (sort === 'price_desc') results = [...results].sort((a: any, b: any) => (b.minPrice || 0) - (a.minPrice || 0))
        setProjects(results)
      }
    } catch {}
    setLoading(false)
  }

  function clearFilters() {
    setSearch(''); setCity('All Cities'); setType('All Types')
    setStatus('All Status'); setBedrooms('Any'); setBudgetIdx(0); setSort('newest')
  }

  const activeFilterCount = [
    city !== 'All Cities', type !== 'All Types', status !== 'All Status',
    bedrooms !== 'Any', budgetIdx !== 0, search !== '', sort !== 'newest'
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <Image src="/propsarathi-logo.png" alt="PropSarathi" width={160} height={40} className="h-9 w-auto" />
          </Link>

          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadProjects()}
                placeholder="Search projects, locations, developers..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition ${filtersOpen ? 'border-[#422D83] bg-[#f5f3fd] text-[#371f6e]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#422D83] text-white rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 transition ${viewMode === 'grid' ? 'bg-[#f5f3fd] text-[#422D83]' : 'text-gray-400 hover:bg-gray-50'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 transition ${viewMode === 'list' ? 'bg-[#f5f3fd] text-[#422D83]' : 'text-gray-400 hover:bg-gray-50'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            {isLoggedIn ? (
              <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                <div className="w-5 h-5 bg-[#ede9f8] rounded-full flex items-center justify-center text-[#371f6e] text-xs font-bold">
                  {viewer?.name?.[0] || viewer?.phone?.[0]}
                </div>
              </button>
            ) : (
              <button onClick={() => showLoginModal(false)} className="flex items-center gap-1.5 px-3 py-2 bg-[#422D83] text-white text-sm font-medium rounded-xl hover:bg-[#2d1a60] transition">
                <User className="w-4 h-4" />Login
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {filtersOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">City</label>
                <select value={city} onChange={e => setCity(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bedrooms</label>
                <div className="flex gap-1">
                  {BEDROOM_OPTIONS.map(b => (
                    <button key={b} onClick={() => setBedrooms(b)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium border transition ${bedrooms === b ? 'bg-[#422D83] text-white border-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#6b56c0]'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Budget</label>
                <select value={budgetIdx} onChange={e => setBudgetIdx(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {budgetRanges.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-gray-50">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button onClick={clearFilters} className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
                    <X className="w-3.5 h-3.5" />Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
            {city !== 'All Cities' && <span> in <strong>{city}</strong></span>}
          </p>
          <p className="text-xs text-gray-400 hidden sm:block">
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
          </p>
        </div>

        {loading ? (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
            <button onClick={clearFilters} className="px-6 py-2 bg-[#422D83] text-white rounded-xl text-sm font-medium hover:bg-[#2d1a60] transition">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}>
            {projects.map(project => (
              viewMode === 'grid'
                ? <ProjectCardGrid key={project.id} project={project} />
                : <ProjectCardList key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ProjectCardGrid({ project }: { project: any }) {
  return (
    <Link href={`/properties/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {project.coverImage
          ? <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-gray-200" /></div>
        }
        <div className={`absolute top-3 left-3 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {project.status}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3" />{project.city}
        </div>
        <div className="absolute bottom-3 right-3">
          <SavePropertyButton slug={project.slug} />
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#422D83] font-medium">{project.developer}</p>
        <h3 className="font-bold text-gray-900 text-base mt-0.5 mb-1 group-hover:text-[#422D83] transition">{project.name}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{project.location}</span>
        </div>
        {project.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.highlights.slice(0, 2).map((h: string) => (
              <span key={h} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{h}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting</p>
            <p className="font-bold text-gray-900">{formatPrice(project.minPrice, project.currency)}</p>
          </div>
          <span className="text-xs text-[#422D83] font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  )
}

function ProjectCardList({ project }: { project: any }) {
  return (
    <Link href={`/properties/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex gap-0">
      <div className="relative w-48 shrink-0 bg-gray-100">
        {project.coverImage
          ? <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-200" /></div>
        }
        <div className={`absolute top-3 left-3 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
          {project.status}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-[#422D83] font-medium">{project.developer}</p>
          <h3 className="font-bold text-gray-900 text-base group-hover:text-[#422D83] transition">{project.name}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <MapPin className="w-3 h-3" />{project.location}, {project.city}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="font-bold text-gray-900">{formatPrice(project.minPrice, project.currency)}</p>
          </div>
          <span className="text-xs font-medium text-gray-400">{project.projectType} · {project.numUnits} units</span>
          <div className="flex items-center gap-2">
            <SavePropertyButton slug={project.slug} />
            <span className="text-sm text-[#422D83] font-medium">View →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
