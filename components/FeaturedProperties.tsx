"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Property } from "../types"
import CardDetailModal from "./CardDetailModal"
import { Bed, Bath, Maximize, MapPin, DollarSign } from "lucide-react"

const propertiesData: Property[] = [
  {
    id: 1,
    title: "Burj Khalifa View Apartment",
    location: "Downtown Dubai, UAE",
    price: "AED 4,500,000",
    image: "https://picsum.photos/seed/dubai1/600/400",
    beds: 2,
    baths: 3,
    sqft: 1500,
  },
  {
    id: 2,
    title: "Luxury Villa with Private Pool",
    location: "Indiranagar, Bangalore",
    price: "₹ 8.2 Cr",
    image: "https://picsum.photos/seed/bangalore1/600/400",
    beds: 4,
    baths: 5,
    sqft: 4800,
  },
  {
    id: 3,
    title: "Palm Jumeirah Signature Villa",
    location: "Palm Jumeirah, Dubai, UAE",
    price: "AED 25,000,000",
    image: "https://picsum.photos/seed/dubai2/600/400",
    beds: 6,
    baths: 7,
    sqft: 7000,
  },
  {
    id: 5,
    title: " Villa with Private Pool",
    location: "Indiranagar, Bangalore",
    price: "₹ 16.2 Cr",
    image: "https://picsum.photos/seed/bangalore1/600/400",
    beds: 4,
    baths: 5,
    sqft: 4800,
  },
]

const extendedProperties = [...propertiesData, ...propertiesData, ...propertiesData]

const PropertyCard: React.FC<{
  property: Property
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onShowDetails: (rect: DOMRect) => void
}> = ({ property, isHovered, onHover, onLeave, onShowDetails }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleViewDetails = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in ${property.title} located at ${property.location}. Price: ${property.price}. Can you provide more details?`,
    )
    const whatsappUrl = `https://wa.me/971588660220?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleMouseEnter = () => {
    onHover()
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      onShowDetails(rect)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-lg overflow-hidden hover-lift group h-full ${isHovered ? "scale-110 z-10" : "scale-100"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.image || "/placeholder.svg"}
          alt={property.title}
          className={`w-full h-48 sm:h-56 object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-secondary text-white text-xs sm:text-sm font-bold px-2 py-1 md:px-3 rounded-full">
          {property.price}
        </div>
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 mb-1">{property.title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 md:mb-4">{property.location}</p>
        <div className="flex justify-between items-center mb-3 md:mb-4 text-gray-600 text-xs sm:text-sm border-t border-b border-gray-200 py-2 md:py-3">
          <span>{property.beds} Beds</span>
          <span>{property.baths} Baths</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>
        <div className="flex justify-end items-center">
          <button
            onClick={handleViewDetails}
            className="bg-secondary/10 text-secondary font-semibold py-2 px-3 md:px-4 rounded-md hover:bg-secondary hover:text-white transition-all duration-300 text-xs sm:text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

const FeaturedProperties: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userScrolling, setUserScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return // Skip auto-scroll on mobile

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0

    const scroll = () => {
      if (!isPaused && !userScrolling && scrollContainer) {
        scrollPosition += 0.5
        scrollContainer.scrollLeft = scrollPosition

        if (scrollPosition >= scrollContainer.scrollWidth / 3) {
          scrollPosition = 0
        }
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused, isMobile, userScrolling])

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      setUserScrolling(true)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setUserScrolling(false)
      }, 1000)
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleShowDetails = (property: Property, rect: DOMRect) => {
    if (!isMobile) {
      setSelectedProperty(property)
      setOriginRect(rect)
    }
  }

  return (
    <section id="properties" className="py-10 md:py-14 relative overflow-hidden glass-section">
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12 px-4 md:px-6 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3" style={{ color: "#000000" }}>
            Properties That Sell Out Fast (Here's Why)
          </h2>
          <p className="max-w-2xl mx-auto mt-3 md:mt-4 text-sm md:text-base" style={{ color: "#333333" }}>
            These aren't just properties—they're wealth-building opportunities in Dubai & Bangalore's hottest growth
            zones. Our clients lock these in before they hit the open market.
          </p>
        </div>
        <div
          ref={scrollRef}
          className="relative w-full overflow-x-auto overflow-y-visible scrollbar-hide"
          onMouseEnter={() => !isMobile && setIsPaused(true)}
          onMouseLeave={() => {
            if (!isMobile) {
              setIsPaused(false)
              setSelectedProperty(null)
            }
          }}
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          <div className="flex gap-4 md:gap-6 px-4 md:px-6 py-4">
            {extendedProperties.map((property, index) => (
              <div key={`${property.id}-${index}`} className="flex-shrink-0 w-72 sm:w-80 md:w-96">
                <PropertyCard
                  property={property}
                  isHovered={hoveredId === index}
                  onHover={() => setHoveredId(index)}
                  onLeave={() => setHoveredId(null)}
                  onShowDetails={(rect) => handleShowDetails(property, rect)}
                />
              </div>
            ))}
          </div>
        </div>

        <CardDetailModal
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          title={selectedProperty?.title || ""}
          originRect={originRect}
        >
          {selectedProperty && (
            <div className="space-y-6">
              <img
                src={selectedProperty.image || "/placeholder.svg"}
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span className="text-sm">{selectedProperty.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-secondary" />
                  <span className="text-lg font-bold text-primary">{selectedProperty.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-brand-light/30 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Bed className="w-6 h-6 text-secondary" />
                  <span className="text-sm font-semibold">{selectedProperty.beds} Beds</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Bath className="w-6 h-6 text-secondary" />
                  <span className="text-sm font-semibold">{selectedProperty.baths} Baths</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Maximize className="w-6 h-6 text-secondary" />
                  <span className="text-sm font-semibold">{selectedProperty.sqft.toLocaleString()} sqft</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-lg text-gray-900">Property Highlights</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Prime location with excellent connectivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Modern amenities and facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>High ROI potential and rental yield</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Developed by trusted builders</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hi, I'm interested in ${selectedProperty.title} located at ${selectedProperty.location}. Price: ${selectedProperty.price}. Can you provide more details?`,
                  )
                  const whatsappUrl = `https://wa.me/971588660220?text=${message}`
                  window.open(whatsappUrl, "_blank")
                }}
                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                Contact Us on WhatsApp
              </button>
            </div>
          )}
        </CardDetailModal>
      </div>
    </section>
  )
}

export default FeaturedProperties
