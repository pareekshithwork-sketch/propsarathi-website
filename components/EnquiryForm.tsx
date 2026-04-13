"use client"

import type React from "react"
import { useState } from "react"
import { UnifiedEnquiryForm } from "./UnifiedEnquiryForm"
import SuccessModal from "./SuccessModal"

const EnquiryForm: React.FC = () => {
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
    <>
      <div className="max-w-3xl mx-auto bg-card glass-morphism p-6 md:p-12 rounded-lg shadow-3d card-3d">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Get in Touch</h2>
          <p className="text-muted-foreground mt-3 md:mt-4 text-sm md:text-base">
            Have a question or a specific requirement? Fill out the form below, and one of our experts will get back to
            you shortly.
          </p>
        </div>
        <UnifiedEnquiryForm
          source="Contact Us"
          onSuccess={handleFormSuccess}
          buttonText="Submit Enquiry"
          buttonClassName="bg-primary text-white font-bold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={`${submittedFormData.firstName} ${submittedFormData.lastName}`.trim() || "there"}
        city={submittedFormData.city}
        propertyType={submittedFormData.propertyType}
        budget={submittedFormData.budget}
      />
    </>
  )
}

export default EnquiryForm
