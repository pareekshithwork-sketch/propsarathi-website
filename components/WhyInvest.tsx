"use client"

import { useState } from "react"
import { Building2, MapPin, TrendingUp, Shield, Globe, Award } from "lucide-react"

const dubaiFeatures = [
  { icon: Shield, text: "World-Class Safety: Top 5 safest countries" },
  { icon: TrendingUp, text: "Zero Personal Taxation: No income, capital gains, or inheritance tax" },
  { icon: Building2, text: "High Rental Yields: 6%–9% annual gross returns" },
  { icon: Globe, text: "100% Foreign Ownership: Allowed in freehold and free zones" },
  { icon: Award, text: "Golden Visa: Residency via investment (AED 2M+)" },
  { icon: MapPin, text: "Global Connectivity: Nonstop flights to 250+ cities" },
]

const dubaiPartners = ["Emaar", "Damac", "Nakheel", "Danube", "Sobha", "Binghatti", "Ellington", "Select Group"]

const bangaloreFeatures = [
  "North Bangalore booming with BIAL ITIR, PRR, STRR",
  "Aerospace Park development",
  "Steady rental absorption from tech professionals",
  "Metro expansion and suburban rail",
  "RERA-compliant trusted builders",
]

const bangalorePartners = [
  "Prestige",
  "Brigade",
  "Sobha",
  "Assetz",
  "Puravankara",
  "Embassy",
  "Century",
  "Total Environment",
  "Adarsh",
  "Sattva",
  "Mana",
  "Godrej",
  "Arvind Smartspaces",
  "Casagrand",
]

export default function WhyInvest() {
  const [activeTab, setActiveTab] = useState<"dubai" | "bangalore">("dubai")

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white">
      {/* Dynamic Background Images */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            activeTab === "dubai" ? "opacity-20" : "opacity-0"
          }`}
          style={{
            backgroundImage: "url(/luxury-dubai-skyscrapers-modern-architecture.jpg)",
          }}
        />
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            activeTab === "bangalore" ? "opacity-20" : "opacity-0"
          }`}
          style={{
            backgroundImage: "url(/bangalore-skyline-tech-city.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/90 to-white/95" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4" style={{ color: "#000000" }}>
            Why Invest With Us?
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: "#333333" }}>
            Strategic locations. Proven returns. Future-ready destinations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab("dubai")}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === "dubai" ? "bg-primary text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🇦🇪 Dubai/UAE
            </button>
            <button
              onClick={() => setActiveTab("bangalore")}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === "bangalore" ? "bg-secondary text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🇮🇳 Bangalore
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {/* Dubai Content */}
          {activeTab === "dubai" && (
            <div className="animate-fade-in">
              {/* Hero Banner */}
              <div className="bg-primary rounded-2xl p-8 md:p-12 mb-8 text-white shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Why Dubai/UAE?</h3>
                <p className="text-base md:text-lg leading-relaxed opacity-95">
                  Dubai offers one of the most business-friendly, tax-free property ecosystems. A magnet for global
                  capital with world-class infrastructure, lifestyle, and investment protection.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dubaiFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary cursor-pointer hover:-translate-y-2"
                    >
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">{feature.text}</p>
                    </div>
                  )
                })}
              </div>

              {/* Developer Partners */}
              <div className="bg-gradient-to-br from-gray-50 to-primary/5 rounded-2xl p-8 md:p-10 shadow-lg">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                  Our Dubai Developer Partners
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {dubaiPartners.map((partner, index) => (
                    <span
                      key={index}
                      className="px-6 py-3 bg-white rounded-full text-sm md:text-base font-semibold text-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm md:text-base text-gray-600 mt-6">
                  Exclusive access to pre-launch inventory, developer benefits, and flexible payment plans.
                </p>
              </div>
            </div>
          )}

          {/* Bangalore Content */}
          {activeTab === "bangalore" && (
            <div className="animate-fade-in">
              {/* Hero Banner */}
              <div className="bg-secondary rounded-2xl p-8 md:p-12 mb-8 text-white shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Why Bangalore?</h3>
                <p className="text-base md:text-lg leading-relaxed opacity-95">
                  India's Silicon Valley is now the nation's investment hotspot. Strategic infrastructure, tech-driven
                  growth, and trusted RERA-compliant developments.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {bangaloreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary cursor-pointer hover:-translate-y-2"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed pt-2">{feature}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Developer Network */}
              <div className="bg-gradient-to-br from-gray-50 to-secondary/5 rounded-2xl p-8 md:p-10 shadow-lg mb-8">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                  Our Bangalore Developer Network
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {bangalorePartners.map((partner, index) => (
                    <span
                      key={index}
                      className="px-6 py-3 bg-white rounded-full text-sm md:text-base font-semibold text-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-secondary"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm md:text-base text-gray-600 mt-6">
                  Partnering with RERA-compliant builders with proven track records and clean titles.
                </p>
              </div>

              {/* Trust Badge */}
              <div className="bg-gradient-to-br from-gray-50 to-secondary/5 rounded-2xl p-8 md:p-10 shadow-lg text-center">
                <Shield className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">RERA-Compliant Builders Only</h4>
                <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto">
                  We work exclusively with trusted builders who have clean titles and proven execution track records.
                  Your investment is protected.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
