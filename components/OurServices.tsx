"use client"

import type React from "react"
import { useState, useRef } from "react"
import PortfolioIcon from "./icons/PortfolioIcon"
import BuyIcon from "./icons/BuyIcon"
import SellIcon from "./icons/SellIcon"
import RentIcon from "./icons/RentIcon"
import ResidentialIcon from "./icons/ResidentialIcon"
import CommercialIcon from "./icons/CommercialIcon"
import AgricultureIcon from "./icons/AgricultureIcon"
import IndustrialIcon from "./icons/IndustrialIcon"
import CardDetailModal from "./CardDetailModal"

const services = [
  {
    title: "Portfolio Management",
    icon: <PortfolioIcon />,
    description: "Strategic planning and management of your real estate portfolio",
  },
  { title: "Buy", icon: <BuyIcon />, description: "Find and acquire your perfect property investment" },
  { title: "Sell", icon: <SellIcon />, description: "Maximize returns on your property sales" },
  { title: "Rent", icon: <RentIcon />, description: "Hassle-free rental management services" },
]

const propertyTypes = [
  { title: "Residential", icon: <ResidentialIcon />, description: "Apartments, villas, and homes" },
  { title: "Commercial", icon: <CommercialIcon />, description: "Offices, retail, and business spaces" },
  { title: "Agriculture", icon: <AgricultureIcon />, description: "Farmland and agricultural properties" },
  { title: "Industrial", icon: <IndustrialIcon />, description: "Warehouses and industrial facilities" },
]

const ServiceCard: React.FC<{
  title: string
  icon: React.ReactNode
  description: string
  onShowDetails: (rect: DOMRect) => void
}> = ({ title, icon, description, onShowDetails }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      onShowDetails(rect)
    }
  }

  return (
    <div
      ref={cardRef}
      className="group relative p-6 glass-card rounded-xl hover-lift overflow-hidden"
      onMouseEnter={handleMouseEnter}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-md">
          {icon}
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-secondary transition-colors duration-300">
          {title}
        </h4>
        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/60 to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  )
}

const OurServices: React.FC = () => {
  const [showEnquiryPopup, setShowEnquiryPopup] = useState(false)
  const [selectedService, setSelectedService] = useState<{ title: string; description: string } | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const [userCountry, setUserCountry] = useState<"india" | "uae" | "other">("other")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    confirmEmail: "",
    phone: "",
    confirmPhone: "",
    countryCode: "+91",
    city: "",
    propertyType: "",
    budget: "",
    requirement: "",
  })
  const [emailMatch, setEmailMatch] = useState<boolean | null>(null)
  const [phoneMatch, setPhoneMatch] = useState<boolean | null>(null)

  const getCurrencySymbol = () => {
    if (userCountry === "india") return "₹"
    if (userCountry === "uae") return "د.إ"
    return "$"
  }

  const getBudgetOptions = () => {
    const symbol = getCurrencySymbol()
    if (userCountry === "india") {
      return [
        { value: "< 50L", label: `< ${symbol}50 Lakhs` },
        { value: "50L - 1Cr", label: `${symbol}50L - ${symbol}1 Crore` },
        { value: "1Cr - 3Cr", label: `${symbol}1Cr - ${symbol}3 Crore` },
        { value: "3Cr+", label: `${symbol}3 Crore+` },
      ]
    } else if (userCountry === "uae") {
      return [
        { value: "< 1M", label: `< ${symbol}1M` },
        { value: "1M - 2M", label: `${symbol}1M - ${symbol}2M` },
        { value: "2M - 5M", label: `${symbol}2M - ${symbol}5M` },
        { value: "5M+", label: `${symbol}5M+` },
      ]
    } else {
      return [
        { value: "< $500K", label: "< $500K" },
        { value: "$500K - $1M", label: "$500K - $1M" },
        { value: "$1M - $3M", label: "$1M - $3M" },
        { value: "$3M+", label: "$3M+" },
      ]
    }
  }

  const countryCodes = [
    { code: "+91", flag: "🇮🇳", country: "India" },
    { code: "+971", flag: "🇦🇪", country: "UAE" },
    { code: "+1", flag: "🇺🇸", country: "USA" },
    { code: "+44", flag: "🇬🇧", country: "UK" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))

    if (name === "confirmEmail") {
      setEmailMatch(value === formData.email && value !== "")
    }
    if (name === "email" && formData.confirmEmail) {
      setEmailMatch(value === formData.confirmEmail && value !== "")
    }

    if (name === "confirmPhone") {
      setPhoneMatch(value === formData.phone && value !== "")
    }
    if (name === "phone" && formData.confirmPhone) {
      setPhoneMatch(value === formData.phone && value !== "")
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.email !== formData.confirmEmail) {
      alert("Email addresses do not match!")
      return
    }
    if (formData.phone !== formData.confirmPhone) {
      alert("Phone numbers do not match!")
      return
    }

    alert(`Thank you, ${formData.name}! Your enquiry has been submitted.`)
    setShowEnquiryPopup(false)
  }

  const serviceDetails: Record<string, { fullDescription: string; benefits: string[] }> = {
    "Portfolio Management": {
      fullDescription:
        "Our comprehensive portfolio management service helps you build, maintain, and optimize your real estate investments for maximum returns and minimal risk.",
      benefits: [
        "Strategic asset allocation across markets",
        "Regular performance monitoring and reporting",
        "Risk assessment and mitigation strategies",
        "Rebalancing recommendations based on market conditions",
        "Tax optimization strategies",
      ],
    },
    Buy: {
      fullDescription:
        "Navigate the property buying process with confidence. We help you find and acquire properties that align with your investment goals and budget.",
      benefits: [
        "Access to exclusive off-market properties",
        "Detailed market analysis and property evaluation",
        "Negotiation support for best pricing",
        "Legal and documentation assistance",
        "Post-purchase support and guidance",
      ],
    },
    Sell: {
      fullDescription:
        "Maximize your property's value with our expert selling services. We handle everything from valuation to closing.",
      benefits: [
        "Professional property valuation",
        "Strategic marketing and exposure",
        "Qualified buyer screening",
        "Expert negotiation for optimal pricing",
        "Complete transaction management",
      ],
    },
    Rent: {
      fullDescription:
        "Hassle-free rental management services that ensure steady income and well-maintained properties.",
      benefits: [
        "Tenant screening and verification",
        "Rent collection and management",
        "Property maintenance coordination",
        "Legal compliance and documentation",
        "Regular property inspections",
      ],
    },
    Residential: {
      fullDescription:
        "From luxury apartments to spacious villas, we offer a wide range of residential properties to suit every lifestyle and budget.",
      benefits: [
        "Apartments in prime locations",
        "Luxury villas with modern amenities",
        "Townhouses and row houses",
        "Penthouses with premium features",
        "Gated community properties",
      ],
    },
    Commercial: {
      fullDescription:
        "Invest in high-yield commercial properties including offices, retail spaces, and mixed-use developments.",
      benefits: [
        "Grade A office spaces",
        "Retail and shopping complexes",
        "Co-working spaces",
        "Mixed-use developments",
        "High-traffic commercial locations",
      ],
    },
    Agriculture: {
      fullDescription: "Explore agricultural land investments with high growth potential and sustainable returns.",
      benefits: [
        "Fertile farmland in developing areas",
        "Managed farmland options",
        "Organic farming opportunities",
        "Government-approved agricultural zones",
        "Long-term appreciation potential",
      ],
    },
    Industrial: {
      fullDescription:
        "Industrial properties including warehouses, manufacturing units, and logistics facilities for business growth.",
      benefits: [
        "Strategically located warehouses",
        "Manufacturing facilities",
        "Logistics and distribution centers",
        "Industrial parks and SEZ units",
        "Built-to-suit options available",
      ],
    },
  }

  const handleShowServiceDetails = (title: string, description: string, rect: DOMRect) => {
    setSelectedService({ title, description })
    setOriginRect(rect)
  }

  return (
    <section id="services" className="py-12 md:py-16 relative overflow-hidden glass-section">
      <div className="absolute inset-0 bg-white/50"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Everything You Need to Build Wealth Through Real Estate
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            From finding the perfect property to managing it for maximum returns—we handle it all so you don't have to.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-12 bg-secondary rounded"></div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Core Offerings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" onMouseLeave={() => setSelectedService(null)}>
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  icon={service.icon}
                  description={service.description}
                  onShowDetails={(rect) => handleShowServiceDetails(service.title, service.description, rect)}
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-12 bg-secondary rounded"></div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Property Types We Handle</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" onMouseLeave={() => setSelectedService(null)}>
              {propertyTypes.map((type) => (
                <ServiceCard
                  key={type.title}
                  title={type.title}
                  icon={type.icon}
                  description={type.description}
                  onShowDetails={(rect) => handleShowServiceDetails(type.title, type.description, rect)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:hidden my-12 flex items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => setShowEnquiryPopup(true)}
            className="bg-primary text-white font-bold py-4 px-12 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover-glow"
          >
            Enquire Now
          </button>
        </div>
      </div>

      <CardDetailModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title || ""}
        originRect={originRect}
      >
        {selectedService && serviceDetails[selectedService.title] && (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">{serviceDetails[selectedService.title].fullDescription}</p>

            <div className="space-y-3">
              <h4 className="font-bold text-lg text-gray-900">Key Benefits</h4>
              <ul className="space-y-2">
                {serviceDetails[selectedService.title].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-secondary mt-1 text-xl">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setShowEnquiryPopup(true)
                setSelectedService(null)
              }}
              className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        )}
      </CardDetailModal>

      {showEnquiryPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowEnquiryPopup(false)}
          ></div>
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="glass-morphism-strong rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-gray-900">Get in Touch</h3>
                <button
                  onClick={() => setShowEnquiryPopup(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                Have a question or a specific requirement? Fill out the form below, and one of our experts will get back
                to you shortly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      City of Interest
                    </option>
                    <option value="Dubai">Dubai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="relative">
                    <input
                      type="email"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleChange}
                      placeholder="Re-enter Email Address"
                      required
                      className={`w-full bg-input text-gray-900 px-4 py-3 rounded-md border ${
                        emailMatch === null ? "border-gray-300" : emailMatch ? "border-secondary" : "border-red-500"
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {emailMatch !== null && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailMatch ? (
                          <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-7.293a1 1 0 00-1.414-1.414L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-32 bg-input text-gray-900 px-2 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      required
                      className="flex-1 bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      name="confirmPhone"
                      value={formData.confirmPhone}
                      onChange={handleChange}
                      placeholder="Re-enter Phone Number"
                      required
                      className={`w-full bg-input text-gray-900 px-4 py-3 rounded-md border ${
                        phoneMatch === null ? "border-gray-300" : phoneMatch ? "border-secondary" : "border-red-500"
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {phoneMatch !== null && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneMatch ? (
                          <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-7.293a1 1 0 00-1.414-1.414L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Property Type
                    </option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Budget
                    </option>
                    {getBudgetOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  placeholder="Tell us about your requirement..."
                  rows={4}
                  required
                  className="w-full bg-input text-gray-900 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 px-12 rounded-md hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                  >
                    Submit Enquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default OurServices
