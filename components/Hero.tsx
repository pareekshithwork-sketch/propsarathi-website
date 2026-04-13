"use client"

import type React from "react"
import { useState } from "react"
import { UnifiedEnquiryForm } from "./UnifiedEnquiryForm"
import SuccessModal from "./SuccessModal"

const Hero: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedData, setSubmittedData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    propertyType: "",
    budget: "",
  })

  const handleFormSuccess = (data: any) => {
    setShowSuccessModal(true)
    setSubmittedData(data)
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-12 md:pb-16 px-4 overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/dubai-skyline-at-night-with-illuminated-skyscraper.jpg')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-primary/60"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          <div className="text-white text-center lg:text-left w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight animate-slide-in-bounce text-white drop-shadow-lg">
              Your Strategic Navigator in Global Real Estate Investments
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mb-6 md:mb-8 text-gray-100 animate-fade-in-up mx-auto lg:mx-0 drop-shadow-md">
              Wealth isn't just built—it's guided. We craft opportunities and build trust, delivering transformation
              through strategic investments in Dubai & Bangalore.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end w-full pointer-events-auto relative z-30">
            <div
              className="glass-morphism-strong p-5 sm:p-6 md:p-8 rounded-2xl shadow-3d hover-lift w-full max-w-md lg:max-w-lg animate-scale-bounce pointer-events-auto"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-6 text-center">
                Quick Enquiry
              </h3>
              <UnifiedEnquiryForm
                source="Hero Section Form"
                onSuccess={handleFormSuccess}
                buttonText="Submit Enquiry"
                buttonClassName="bg-primary text-white font-bold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 hover-glow"
              />
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={`${submittedData.firstName} ${submittedData.lastName}`.trim() || "there"}
        city={submittedData.city}
        propertyType={submittedData.propertyType}
        budget={submittedData.budget}
      />
    </section>
  )
}

export default Hero
