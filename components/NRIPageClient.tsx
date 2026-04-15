"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, MapPin, TrendingUp, Shield, Globe, ArrowRight, CheckCircle, Phone, ChevronRight } from "lucide-react"
import SharedFooter from "@/components/SharedFooter"
import { LogoCompact } from "@/components/Logo"
import { formatPrice } from "@/lib/portalAuth"

const NRI_COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "UAE",
  "Singapore", "Germany", "France", "Netherlands", "Switzerland",
  "New Zealand", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain",
  "Oman", "Japan", "Hong Kong", "South Africa", "Other",
]

const STATUS_COLOR: Record<string, string> = {
  'Pre-Launch': 'bg-amber-500',
  'Just Launched': 'bg-[#422D83]',
  'Under Construction': 'bg-blue-500',
  'Ready to Move': 'bg-green-500',
}

interface Project {
  id: number; slug: string; name: string; developer: string; city: string
  location: string; status: string; minPrice: number; maxPrice: number
  currency: string; projectType: string; coverImage?: string; highlights: string[]
}

export default function NRIPageClient({ dubaiProjects, bangaloreProjects }: { dubaiProjects: Project[]; bangaloreProjects: Project[] }) {
  const [form, setForm] = useState({ name: '', country: '', phone: '', interest: 'Both', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms/nri-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <LogoCompact />
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/properties" className="text-gray-500 hover:text-[#422D83]">Properties</Link>
            <Link href="/about" className="text-gray-500 hover:text-[#422D83]">About</Link>
            <Link href="/contact" className="text-gray-500 hover:text-[#422D83]">Contact</Link>
          </nav>
          <a href="#nri-enquiry" className="bg-[#422D83] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#2d1a60] transition">
            Get Free Advice
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a0f3d] via-[#2d1a60] to-[#422D83] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=60')] bg-cover bg-center opacity-15" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm text-gray-300">
            <Globe className="w-4 h-4" /> For Indians Living Abroad
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Invest in India & Dubai<br />
            <span className="text-[#8b78d4]">From Anywhere in the World</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Leverage the currency advantage. Build generational wealth. PropSarathi handles everything — from property selection to paperwork to rental management.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#nri-enquiry" className="bg-white text-[#422D83] font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition flex items-center gap-2">
              Get Free NRI Consultation <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/properties" className="border border-white/40 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '500+', label: 'NRI Investors Served' },
            { val: '₹200+ Cr', label: 'Assets Advised' },
            { val: '7–12%', label: 'Avg Rental Yield (India)' },
            { val: '6–8%', label: 'Avg Rental Yield (Dubai)' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-bold text-[#422D83]">{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Invest */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">Why NRIs Choose PropSarathi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUp className="w-6 h-6 text-[#422D83]" />,
                title: 'Currency Advantage',
                body: 'Your USD, GBP, AED, or SGD buys significantly more real estate in India today. ₹1 Cr in Bangalore equals ~$120,000 — a fraction of what equivalent property costs in your country.',
              },
              {
                icon: <Shield className="w-6 h-6 text-[#422D83]" />,
                title: 'Rental Yields',
                body: 'Bangalore tech corridors deliver 7–12% rental yields. Dubai delivers 6–8% with zero property tax and no capital gains tax. Both cities have strong demand from young professionals.',
              },
              {
                icon: <Globe className="w-6 h-6 text-[#422D83]" />,
                title: 'End-to-End Support',
                body: 'FEMA compliance, NRE/NRO account guidance, Power of Attorney setup, property registration, rental management, and repatriation advice — all handled by our NRI specialists.',
              },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-[#f5f3fd] rounded-xl flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dubai Projects */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🇦🇪 Dubai Projects</h2>
              <p className="text-gray-500 text-sm mt-1">Zero property tax · 100% foreign ownership · 6–8% yields</p>
            </div>
            <Link href="/properties?city=Dubai" className="text-[#422D83] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {dubaiProjects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {dubaiProjects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Dubai projects coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Bangalore Projects */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🇮🇳 Bangalore Projects</h2>
              <p className="text-gray-500 text-sm mt-1">India's fastest growing city · 7–12% yields · Pre-launch pricing</p>
            </div>
            <Link href="/properties?city=Bangalore" className="text-[#422D83] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {bangaloreProjects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {bangaloreProjects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Bangalore projects coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* NRI Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">NRI Investment — Key Facts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'FEMA Compliance',
                points: [
                  'NRIs can buy residential and commercial property in India without RBI approval',
                  'Agricultural land, plantation property, and farmhouses require RBI approval',
                  'Funds must flow through NRE / NRO / FCNR accounts',
                  'PropSarathi connects you with FEMA-compliant legal partners',
                ],
              },
              {
                title: 'Tax Benefits',
                points: [
                  'DTAA (Double Tax Avoidance Agreement) prevents double taxation',
                  'Home loan interest deduction up to ₹2 lakh under Section 24(b)',
                  'Principal repayment under Section 80C up to ₹1.5 lakh',
                  'Long-term capital gains with indexation benefit on sale',
                ],
              },
              {
                title: 'Repatriation',
                points: [
                  'Up to $1M per year can be repatriated from NRO account',
                  'Rental income and sale proceeds from NRE account are freely repatriable',
                  'TDS is deducted at source (buyer deducts 20% + surcharge on sale)',
                  'Our CA partners help you claim TDS refunds efficiently',
                ],
              },
              {
                title: 'Dubai for NRIs',
                points: [
                  '100% foreign ownership in designated freehold zones',
                  'No property tax, no capital gains tax, no inheritance tax',
                  'Residency visa eligibility with property purchase above AED 750K',
                  'Rental yields of 6–8%, paid in AED — strong stable currency',
                ],
              },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">{s.title}</h3>
                <ul className="space-y-2">
                  {s.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#422D83] shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="nri-enquiry" className="py-16 px-4 bg-gradient-to-br from-[#1a0f3d] to-[#422D83]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Get a Free NRI Consultation</h2>
            <p className="text-gray-300 text-sm">Our NRI specialist will call you within 24 hours</p>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-[#422D83] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Enquiry Received!</h3>
                <p className="text-gray-500 text-sm">Our NRI advisor will contact you within 24 hours.</p>
                <Link href="/properties" className="mt-6 inline-flex items-center gap-2 bg-[#422D83] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d1a60] transition">
                  Browse Properties <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Country of Residence *</label>
                    <select required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-white">
                      <option value="">Select country</option>
                      {NRI_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone / WhatsApp *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 or country code"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Interested In</label>
                    <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-white">
                      <option>Both</option>
                      <option>India (Bangalore)</option>
                      <option>Dubai</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message (optional)</label>
                  <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Budget, timeline, specific requirements..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] resize-none" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#422D83] hover:bg-[#2d1a60] text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Phone className="w-4 h-4" />}
                  {loading ? 'Submitting...' : 'Request Free Consultation'}
                </button>
                <p className="text-xs text-center text-gray-400">We respect your privacy. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/properties/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-44 bg-gray-100">
        {project.coverImage
          ? <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-200" /></div>
        }
        <div className={`absolute top-3 left-3 ${STATUS_COLOR[project.status] || 'bg-gray-500'} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {project.status}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#422D83] font-medium">{project.developer}</p>
        <h3 className="font-bold text-gray-900 mt-0.5 group-hover:text-[#422D83] transition">{project.name}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 mb-3">
          <MapPin className="w-3 h-3 shrink-0" />{project.location}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting</p>
            <p className="font-bold text-gray-900 text-sm">{formatPrice(project.minPrice, project.currency)}</p>
          </div>
          <span className="text-xs text-[#422D83] font-medium">View →</span>
        </div>
      </div>
    </Link>
  )
}
