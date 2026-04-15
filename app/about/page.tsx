"use client"

import Link from "next/link"
import { Building2, Shield, TrendingUp, Users, Award, MapPin, Phone, Mail, ArrowRight, CheckCircle, Search, FileCheck } from "lucide-react"
import { LogoCompact } from "@/components/Logo"
import SharedFooter from "@/components/SharedFooter"
import ProblemsAndSolutions from "@/components/ProblemsAndSolutions"
import WhyChooseUs from "@/components/WhyChooseUs"
import TransparentFees from "@/components/TransparentFees"
import WhyInvest from "@/components/WhyInvest"
import Testimonials from "@/components/Testimonials"
import Partners from "@/components/Partners"
import OurServices from "@/components/OurServices"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <LogoCompact />
          <Link href="/properties" className="flex items-center gap-1.5 bg-[#422D83] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#2d1a60] transition">
            Browse Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center text-white px-4 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0f3d 0%, #2d1a60 50%, #422D83 100%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=60')" }}
        />
        <div className="relative max-w-3xl mx-auto py-20">
          <span className="inline-block bg-[#F17322] text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Behind Every Confident Investment
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-5 leading-tight">
            Your Trusted <span style={{ color: "#F17322" }}>Sarathi</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            PropSarathi — Sanskrit for "trusted charioteer and guide". We navigate your real estate journey from search to possession, so you never feel lost.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#F17322] hover:bg-[#d4621a] text-white font-bold px-8 py-4 rounded-xl transition text-base"
            >
              Explore Properties <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#team"
              className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-xl transition text-base"
            >
              Meet Our Team
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#f5f3fd] to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#422D83] text-center mb-4">We go beyond property sales</h2>
          <div className="w-16 h-1 bg-[#F17322] rounded-full mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                At PropSarathi, we empower buyers and investors with expert guidance, exclusive pre-launch opportunities, and seamless transactions. We treat every client's portfolio as if it were our own.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're a first-time home buyer, a seasoned investor, or an NRI looking to invest in Bangalore or Dubai — we are your strategic partners in wealth creation through real estate.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Projects Listed", value: "50+" },
                { label: "Happy Investors", value: "500+" },
                { label: "Cities", value: "2" },
                { label: "Years Experience", value: "5+" },
              ].map(s => (
                <div key={s.label} className="bg-[#422D83] text-white rounded-2xl p-5 text-center">
                  <p className="text-4xl font-black">{s.value}</p>
                  <p className="text-sm text-white/80 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#422D83] text-center mb-4">What We Stand For</h2>
          <div className="w-16 h-1 bg-[#F17322] rounded-full mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Shield className="w-6 h-6" />, title: "100% Verified", desc: "Every project personally vetted. We only list what we'd invest in.", color: "bg-blue-50 text-blue-600" },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Pre-Launch Access", desc: "First access before public launch at the best developer prices.", color: "bg-[#f5f3fd] text-[#422D83]" },
              { icon: <Users className="w-6 h-6" />, title: "Expert Advisory", desc: "Dedicated RM, portfolio planning, end-to-end support.", color: "bg-purple-50 text-purple-600" },
              { icon: <Award className="w-6 h-6" />, title: "Zero Hidden Costs", desc: "Transparent pricing. We earn from developers, not from you.", color: "bg-amber-50 text-amber-600" },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={`w-14 h-14 ${f.color} rounded-xl flex items-center justify-center mb-3`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-base text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#422D83] text-center mb-4">How We Work</h2>
            <div className="w-16 h-1 bg-[#F17322] rounded-full mx-auto mb-6" />
            <p className="text-gray-500 max-w-xl mx-auto">From confusion to clarity in 4 simple steps — a proven system that&apos;s helped 200+ investors build wealth through real estate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              {
                number: "01",
                title: "CONSULT",
                description: "We decode your goals, budget, and risk appetite — then match you with properties that actually make sense for YOUR wealth plan.",
                Icon: Search,
              },
              {
                number: "02",
                title: "CURATE",
                description: "No spam. No irrelevant listings. Just hand-picked properties with proven ROI potential and verified developers.",
                Icon: CheckCircle,
              },
              {
                number: "03",
                title: "EXECUTE",
                description: "From site visits to paperwork — we handle everything so you can focus on what matters: growing your wealth.",
                Icon: FileCheck,
              },
              {
                number: "04",
                title: "GROW",
                description: "Your investment doesn't end at purchase. We help with leasing, resale timing, and portfolio optimization for maximum returns.",
                Icon: TrendingUp,
              },
            ].map(step => (
              <div key={step.number} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#F17322] flex items-center justify-center text-white font-bold text-sm shadow">
                  {step.number}
                </div>
                <div className="w-12 h-12 bg-[#f5f3fd] text-[#422D83] rounded-xl flex items-center justify-center mb-4">
                  <step.Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#422D83] uppercase mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems & Solutions */}
      <ProblemsAndSolutions />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Transparent Fees */}
      <TransparentFees />

      {/* Why Invest */}
      <WhyInvest />

      {/* Testimonials */}
      <Testimonials />

      {/* Partners */}
      <Partners />

      {/* Our Services */}
      <OurServices />

      {/* Team */}
      <section id="team" className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#422D83] text-center mb-4">Our Leadership Team</h2>
        <div className="w-16 h-1 bg-[#F17322] rounded-full mx-auto mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Pareekshith Rawal", role: "Founder & CEO", linkedin: "https://www.linkedin.com/in/pareekshith-rawal", image: "/images/leadership/pareekshith-rawal.webp", desc: "Real estate investment strategist with expertise in Bangalore & Dubai markets." },
            { name: "Kushal Rawal", role: "Co-Founder & Head of Sales", linkedin: "https://www.linkedin.com/in/kushal-rawal", image: "/images/leadership/kushal-rawal.webp", desc: "Expert in NRI investments and luxury property advisory." },
            { name: "Varun Katti", role: "Head of Operations", linkedin: "https://www.linkedin.com/in/varun-katti", image: "/images/leadership/varun-katti.webp", desc: "Leads client experience and project partnerships across markets." },
          ].map(m => (
            <div key={m.name} className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
              <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{m.name}</h3>
              <p className="text-[#F17322] font-semibold text-sm mb-2">{m.role}</p>
              <p className="text-base text-gray-500">{m.desc}</p>
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white text-sm font-medium rounded-xl hover:bg-[#005885] transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 text-white text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #422D83, #1a0f3d)" }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#F17322] font-semibold text-sm uppercase tracking-widest mb-4">Start Your Journey</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Behind Every Confident Investment</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">Browse pre-launch and new launch projects in Bangalore & Dubai. Expert advisory, zero hidden costs.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#F17322] hover:bg-[#d4621a] text-white font-bold px-8 py-4 rounded-xl transition text-base"
            >
              Browse Properties <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-xl transition text-base"
            >
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  )
}
