"use client"

import type React from "react"
import { useState } from "react"
import BriefcaseIcon from "./icons/BriefcaseIcon"
import DollarIcon from "./icons/DollarIcon"
import MegaphoneIcon from "./icons/MegaphoneIcon"
import { UnifiedEnquiryForm } from "./UnifiedEnquiryForm"
import SuccessModal from "./SuccessModal"

const PartnerBenefit: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
    <div className="flex items-center justify-center h-16 w-16 mx-auto mb-6 rounded-full bg-brand-primary/10 text-brand-primary">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">{title}</h3>
    <p className="text-brand-muted text-sm">{description}</p>
  </div>
)

const PartnerPortalPage: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedFormData, setSubmittedFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    propertyType: "",
    budget: "",
  })

  const handleFormSuccess = (data: any) => {
    setSubmittedFormData(data)
    setShowSuccessModal(true)
  }

  return (
    <div className="pt-24 bg-brand-light">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-brand-primary text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(https://picsum.photos/seed/partner-bg/1920/1080)" }}
        ></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold">Partner with PropSarathi</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mt-4 text-gray-300">
            Join our network of trusted professionals and unlock access to exclusive real estate opportunities and
            unparalleled support.
          </p>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-brand-dark">Why Partner With Us?</h2>
            <p className="text-brand-muted max-w-2xl mx-auto mt-4">
              Collaborate with a forward-thinking real estate portfolio management firm and grow your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PartnerBenefit
              icon={<BriefcaseIcon />}
              title="Exclusive Inventory Access"
              description="Offer your clients a curated portfolio of high-yield, vetted properties from top-tier developers in Dubai and Bangalore."
            />
            <PartnerBenefit
              icon={<DollarIcon />}
              title="Attractive Commission Structure"
              description="Benefit from a competitive, transparent, and timely commission model designed to reward your hard work and success."
            />
            <PartnerBenefit
              icon={<MegaphoneIcon />}
              title="Marketing & Sales Support"
              description="Leverage our market intelligence, promotional materials, and dedicated support team to close deals faster and more effectively."
            />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-brand-bg-alt">
        <div className="container mx-auto px-6">
          <div className="w-full max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-2xl">
            <h3 className="text-3xl font-serif font-bold text-brand-dark mb-6 text-center">Become a Partner</h3>
            <UnifiedEnquiryForm
              source="Other"
              onSuccess={handleFormSuccess}
              buttonText="Submit Partnership Request"
              buttonClassName="bg-brand-secondary text-brand-primary font-bold hover:bg-opacity-90 transition-transform hover:scale-105"
            />
          </div>
        </div>
      </section>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={`${submittedFormData.firstName} ${submittedFormData.lastName}`.trim() || "there"}
        city={submittedFormData.city}
        propertyType={submittedFormData.propertyType}
        budget={submittedFormData.budget}
      />
    </div>
  )
}

export default PartnerPortalPage
