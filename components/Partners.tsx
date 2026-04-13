"use client"

import type React from "react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import Image from "next/image"

interface BuilderDetails {
  name: string
  location: string
  established: string
  specialization: string
  notableProjects: string[]
  description: string
  projectImage: string
  logo: string
}

const builderDetails: Record<string, BuilderDetails> = {
  Emaar: {
    name: "Emaar Properties",
    location: "Dubai, UAE",
    established: "1997",
    specialization: "Luxury Residential & Commercial",
    notableProjects: ["Burj Khalifa", "Dubai Mall", "Dubai Marina", "Emirates Hills"],
    description:
      "Emaar Properties is a global property developer and provider of premium lifestyles, with a significant presence in the Middle East, North Africa and Asia.",
    projectImage: "/burj-khalifa-dubai-skyline-luxury.jpg",
    logo: "/images/builders/emaar-logo.png",
  },
  Damac: {
    name: "DAMAC Properties",
    location: "Dubai, UAE",
    established: "2002",
    specialization: "Luxury Residential",
    notableProjects: ["DAMAC Hills", "DAMAC Lagoons", "Aykon City", "DAMAC Bay"],
    description:
      "DAMAC Properties is a leading luxury real estate developer in the Middle East, known for its iconic residential, commercial and leisure properties.",
    projectImage: "/damac-luxury-residential-dubai-waterfront.jpg",
    logo: "/images/builders/damac-logo.png",
  },
  Nakheel: {
    name: "Nakheel",
    location: "Dubai, UAE",
    established: "2000",
    specialization: "Master Communities & Waterfront",
    notableProjects: ["Palm Jumeirah", "The World Islands", "Jumeirah Village", "Dragon City"],
    description:
      "Nakheel is a world-leading master developer whose innovative, landmark projects form an iconic portfolio of master communities and residential, retail, hospitality and leisure developments.",
    projectImage: "/palm-jumeirah-aerial-view-dubai.jpg",
    logo: "/images/builders/nakheel-logo.png",
  },
  Danube: {
    name: "Danube Properties",
    location: "Dubai, UAE",
    established: "1993",
    specialization: "Affordable Luxury",
    notableProjects: ["Glamz", "Starz", "Dreamz", "Bayz"],
    description:
      "Danube Properties is one of the leading private developers in the UAE, known for delivering quality homes with flexible payment plans.",
    projectImage: "/danube-modern-residential-towers-dubai.jpg",
    logo: "/images/builders/danube-logo.png",
  },
  Sobha: {
    name: "Sobha Realty",
    location: "Dubai, UAE & Bangalore, India",
    established: "1976",
    specialization: "Premium Residential",
    notableProjects: ["Sobha Hartland", "District One", "Sobha City", "Sobha Dream Acres"],
    description:
      "Sobha Realty is committed to redefining the art of living by building sustainable communities with world-class amenities.",
    projectImage: "/sobha-hartland-luxury-villas-dubai.jpg",
    logo: "/images/builders/sobha-logo.png",
  },
  Binghatti: {
    name: "Binghatti Developers",
    location: "Dubai, UAE",
    established: "2008",
    specialization: "Contemporary Architecture",
    notableProjects: ["Binghatti Gateway", "Binghatti Stars", "Binghatti Avenue", "Burj Binghatti Jacob & Co"],
    description:
      "Binghatti is one of the leading holding companies in the UAE, with a strong presence in real estate development and construction.",
    projectImage: "/binghatti-contemporary-architecture-dubai-towers.jpg",
    logo: "/images/builders/binghatti-logo.png",
  },
  Ellington: {
    name: "Ellington Properties",
    location: "Dubai, UAE",
    established: "2014",
    specialization: "Boutique Luxury",
    notableProjects: ["Belgravia", "DT1", "Wilton Park Residences", "The Crestmark"],
    description:
      "Ellington Properties is a boutique developer creating beautiful homes and communities in Dubai's most desirable locations.",
    projectImage: "/ellington-boutique-luxury-apartments-dubai.jpg",
    logo: "/images/builders/ellington-logo.png",
  },
  Assetz: {
    name: "Assetz Property Group",
    location: "Bangalore, India",
    established: "2006",
    specialization: "Sustainable Living",
    notableProjects: ["Assetz Marq", "Assetz 63 Degree East", "Assetz Soul & Soil", "Assetz Here & Now"],
    description:
      "Assetz Property Group is known for creating sustainable, well-designed communities with a focus on quality and customer satisfaction.",
    projectImage: "/assetz-sustainable-modern-apartments-bangalore.jpg",
    logo: "/images/builders/assetz-logo.png",
  },
  Aldar: {
    name: "Aldar Properties",
    location: "Abu Dhabi, UAE",
    established: "2004",
    specialization: "Master Planned Communities",
    notableProjects: ["Yas Island", "Al Raha Beach", "Saadiyat Island", "Alghadeer"],
    description:
      "Aldar Properties is the leading real estate developer, manager and investor in Abu Dhabi, with a diversified portfolio of residential, commercial and retail assets.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/images/builders/aldar-logo.png",
  },
  Puravankara: {
    name: "Puravankara Limited",
    location: "Bangalore, India",
    established: "1975",
    specialization: "Premium Residential",
    notableProjects: ["Purva Venezia", "Purva Atmosphere", "Purva Whitehall", "Purva Skydale"],
    description:
      "Puravankara is one of India's leading real estate developers with a strong presence in residential, commercial and retail segments.",
    projectImage: "/puravankara-premium-residential-towers-bangalore.jpg",
    logo: "/images/builders/puravankara-logo.png",
  },
  Sattva: {
    name: "Sattva Group",
    location: "Bangalore, India",
    established: "1993",
    specialization: "Integrated Communities",
    notableProjects: ["Sattva Laurel Heights", "Sattva Misty Charm", "Sattva Songbird", "Sattva Knowledge City"],
    description:
      "Sattva Group is committed to creating sustainable, integrated communities with world-class amenities and infrastructure.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/images/builders/sattva-logo.png",
  },
  Prestige: {
    name: "Prestige Group",
    location: "Bangalore, India",
    established: "1986",
    specialization: "Premium Residential & Commercial",
    notableProjects: [
      "Prestige Lakeside Habitat",
      "Prestige Shantiniketan",
      "Prestige Golfshire",
      "Prestige Tech Park",
    ],
    description:
      "Prestige Group is one of South India's leading property developers with projects spanning residential, commercial, retail, leisure and hospitality segments.",
    projectImage: "/prestige-luxury-apartments-bangalore-skyline.jpg",
    logo: "/images/builders/prestige-logo.png",
  },
  Century: {
    name: "Century Real Estate",
    location: "Bangalore, India",
    established: "1973",
    specialization: "Residential & Commercial",
    notableProjects: ["Century Ethos", "Century Breeze", "Century Renata", "Century Horizon"],
    description:
      "Century Real Estate is a trusted name in Bangalore's real estate sector, known for quality construction and timely delivery.",
    projectImage: "/century-residential-complex-bangalore.jpg",
    logo: "/images/builders/century-logo.png",
  },
  "Sobha Text": {
    name: "Sobha Limited",
    location: "Bangalore, India",
    established: "1995",
    specialization: "Luxury Residential",
    notableProjects: ["Sobha City", "Sobha Dream Acres", "Sobha Indraprastha", "Sobha Royal Pavilion"],
    description:
      "Sobha Limited is one of India's largest and only backward integrated real estate companies, known for quality and craftsmanship.",
    projectImage: "/sobha-hartland-luxury-villas-dubai.jpg",
    logo: "/images/builders/sobha-text-logo.png",
  },
  Embassy: {
    name: "Embassy Group",
    location: "Bangalore, India",
    established: "1993",
    specialization: "Commercial & Residential",
    notableProjects: ["Embassy Manyata", "Embassy TechVillage", "Embassy Lake Terraces", "Embassy Springs"],
    description:
      "Embassy Group is India's leading real estate developer with a focus on creating world-class commercial and residential spaces.",
    projectImage: "/embassy-tech-park-commercial-bangalore.jpg",
    logo: "/images/builders/embassy-logo.png",
  },
  Mana: {
    name: "Mana Projects",
    location: "Bangalore, India",
    established: "2008",
    specialization: "Luxury Residential",
    notableProjects: ["Mana Tropicale", "Mana Candolim", "Mana Dale", "Mana Uber Verdant"],
    description:
      "Mana Projects is known for creating luxury residential spaces with a focus on design excellence and quality.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/images/builders/mana-logo.png",
  },
  Brigade: {
    name: "Brigade Group",
    location: "Bangalore, India",
    established: "1986",
    specialization: "Integrated Townships",
    notableProjects: ["Brigade Orchards", "Brigade Meadows", "Brigade Gateway", "Brigade Cosmopolis"],
    description:
      "Brigade Group is a leading property developer in South India with a diversified portfolio across residential, commercial, retail, hospitality and education sectors.",
    projectImage: "/brigade-integrated-township-bangalore.jpg",
    logo: "/images/builders/brigade-logo.png",
  },
  "Select Group": {
    name: "Select Group",
    location: "Dubai, UAE",
    established: "2002",
    specialization: "Luxury High-Rise",
    notableProjects: ["The Residences at Marina Gate", "Jumeirah Living", "FIVE Hotels", "Vida Residences"],
    description:
      "Select Group is a leading real estate developer in Dubai, known for creating iconic residential and hospitality projects.",
    projectImage: "/marina-gate-luxury-high-rise-dubai.jpg",
    logo: "/placeholder.svg?height=200&width=400&text=SELECT+GROUP",
  },
  "Total Environment": {
    name: "Total Environment",
    location: "Bangalore, India",
    established: "1996",
    specialization: "Contemporary Design",
    notableProjects: ["Windmills Of Your Mind", "In That Quiet Earth", "After The Rain", "Learning To Fly"],
    description:
      "Total Environment creates contemporary homes with a focus on design, sustainability and quality of life.",
    projectImage: "/total-environment-contemporary-design-homes-bangal.jpg",
    logo: "/placeholder.svg?height=200&width=400&text=TOTAL+ENVIRONMENT",
  },
  Adarsh: {
    name: "Adarsh Developers",
    location: "Bangalore, India",
    established: "1987",
    specialization: "Premium Apartments",
    notableProjects: ["Adarsh Palm Retreat", "Adarsh Welkin Park", "Adarsh Greens", "Adarsh Premia"],
    description:
      "Adarsh Developers is a leading real estate company in Bangalore, known for creating premium residential communities.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/placeholder.svg?height=200&width=400&text=ADARSH",
  },
  Godrej: {
    name: "Godrej Properties",
    location: "Bangalore, India",
    established: "1990",
    specialization: "Residential & Commercial",
    notableProjects: ["Godrej Aqua", "Godrej Splendour", "Godrej Ananda", "Godrej Woodsville"],
    description:
      "Godrej Properties is one of India's leading real estate developers, known for innovation, sustainability and customer-centricity.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/placeholder.svg?height=200&width=400&text=GODREJ",
  },
  "Arvind Smartspaces": {
    name: "Arvind SmartSpaces",
    location: "Bangalore, India",
    established: "2017",
    specialization: "Smart Living",
    notableProjects: ["Arvind Skylands", "Arvind Forreste", "Arvind Oasis", "Arvind Expansia"],
    description:
      "Arvind SmartSpaces is committed to creating smart, sustainable living spaces with innovative design and technology.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/placeholder.svg?height=200&width=400&text=ARVIND+SMARTSPACES",
  },
  Casagrand: {
    name: "Casagrand Builder",
    location: "Bangalore, India",
    established: "2003",
    specialization: "Affordable Premium",
    notableProjects: ["Casagrand Royce", "Casagrand Supremus", "Casagrand Luxus", "Casagrand Crescendo"],
    description:
      "Casagrand is one of South India's leading residential real estate developers, known for quality construction and customer satisfaction.",
    projectImage: "/placeholder.svg?height=800&width=1200",
    logo: "/placeholder.svg?height=200&width=400&text=CASAGRAND",
  },
}

const firstRowPartners = ["Emaar", "Damac", "Nakheel", "Danube", "Sobha", "Binghatti", "Ellington"]
const secondRowPartners = [
  "Assetz",
  "Puravankara",
  "Sattva",
  "Prestige",
  "Century",
  "Sobha Text",
  "Embassy",
  "Mana",
  "Brigade",
]

const extendedFirstRow = [...firstRowPartners, ...firstRowPartners, ...firstRowPartners]
const extendedSecondRow = [...secondRowPartners, ...secondRowPartners, ...secondRowPartners]

const Partners: React.FC = () => {
  const [selectedBuilder, setSelectedBuilder] = useState<string | null>(null)

  const handleBuilderClick = (partner: string) => {
    setSelectedBuilder(partner)
  }

  const closePanel = () => {
    setSelectedBuilder(null)
  }

  const modalContent = selectedBuilder && builderDetails[selectedBuilder] && (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      onClick={closePanel}
    >
      <div
        className="relative w-full max-w-3xl max-h-[60vh] rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${builderDetails[selectedBuilder].projectImage}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90"></div>
        </div>

        <div className="relative z-10 overflow-y-auto max-h-[60vh] p-6 md:p-8">
          <button
            onClick={closePanel}
            className="absolute top-4 right-4 p-2 rounded-full bg-brand-gold/20 hover:bg-brand-gold/30 backdrop-blur-md transition-all duration-300 hover:scale-110 z-20 shadow-xl border border-brand-gold/30"
            aria-label="Close details"
          >
            <X className="w-5 h-5 text-brand-gold" />
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {builderDetails[selectedBuilder].name}
            </h1>
            <p className="text-white text-base md:text-lg font-semibold mb-2 drop-shadow-md">
              {builderDetails[selectedBuilder].location}
            </p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="backdrop-blur-md bg-white/20 p-4 rounded-xl border border-brand-gold/30 shadow-xl hover:bg-white/25 transition-all duration-300">
              <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>
                Established
              </h3>
              <p className="text-white text-2xl font-bold drop-shadow-md">
                {builderDetails[selectedBuilder].established}
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/20 p-4 rounded-xl border border-brand-gold/30 shadow-xl hover:bg-white/25 transition-all duration-300">
              <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>
                Specialization
              </h3>
              <p className="text-white text-base md:text-lg font-semibold drop-shadow-md">
                {builderDetails[selectedBuilder].specialization}
              </p>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/20 p-4 rounded-xl border border-brand-gold/30 shadow-xl mb-4">
            <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>
              About
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-md">
              {builderDetails[selectedBuilder].description}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/20 p-4 rounded-xl border border-brand-gold/30 shadow-xl">
            <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>
              Notable Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {builderDetails[selectedBuilder].notableProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="flex items-start p-3 bg-white/15 rounded-lg border border-brand-gold/20 hover:bg-white/25 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="text-brand-gold mr-2 text-base font-bold">•</span>
                  <span className="text-white text-sm font-medium drop-shadow-md">{project}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-12 bg-white overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h3
          className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6 md:mb-8 px-4"
          style={{ color: "#000000" }}
        >
          In Partnership With India & UAE's Most Trusted Developers
        </h3>

        <div className="relative w-full overflow-hidden mb-8">
          <div className="flex animate-scroll-partners gap-8 md:gap-12">
            {extendedFirstRow.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer group"
                style={{ width: "calc(100% / 5 - 2.5rem)" }}
                onClick={() => handleBuilderClick(partner)}
              >
                <div className="relative w-32 h-16 md:w-40 md:h-20 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src={builderDetails[partner].logo || "/placeholder.svg"}
                    alt={`${partner} logo`}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll-partners-reverse gap-8 md:gap-12">
            {extendedSecondRow.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer group"
                style={{ width: "calc(100% / 5 - 2.5rem)" }}
                onClick={() => handleBuilderClick(partner)}
              >
                <div className="relative w-32 h-16 md:w-40 md:h-20 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src={builderDetails[partner].logo || "/placeholder.svg"}
                    alt={`${partner} logo`}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && modalContent && createPortal(modalContent, document.body)}
    </section>
  )
}

export default Partners
