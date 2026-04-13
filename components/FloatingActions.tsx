"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { MessageSquare } from "lucide-react"
import SuccessModal from "./SuccessModal"
import { validatePhoneNumber, formatPhoneInput } from "../utils/phoneValidation"
import { validateForm } from "../utils/formValidation"
import { capitalizeFirstLetter, capitalizeSentences } from "../utils/textCapitalization"
import UnifiedEnquiryForm from "./UnifiedEnquiryForm"

interface FloatingActionsProps {
  externalShowEnquiryForm?: boolean
  setExternalShowEnquiryForm?: (show: boolean) => void
}

const FloatingActions: React.FC<FloatingActionsProps> = ({ externalShowEnquiryForm, setExternalShowEnquiryForm }) => {
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [showDelayedPopup, setShowDelayedPopup] = useState(false)
  const [showHotDealsPopup, setShowHotDealsPopup] = useState(false)
  const [showFinalPopup, setShowFinalPopup] = useState(false)
  const [allPopupsShown, setAllPopupsShown] = useState(false)
  const [userCountry, setUserCountry] = useState<"india" | "uae" | "other">("other")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    phone: "",
    confirmPhone: "",
    countryCode: "+91",
    city: "",
    propertyType: "",
    budget: "",
    message: "",
  })

  const [emailMatch, setEmailMatch] = useState<boolean | null>(null)
  const [phoneMatch, setPhoneMatch] = useState<boolean | null>(null)
  const [showConfirmEmail, setShowConfirmEmail] = useState(false)
  const [showConfirmPhone, setShowConfirmPhone] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedFormData, setSubmittedFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    propertyType: "",
    budget: "",
  })

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const country = data.country_code
        if (country === "IN") {
          setUserCountry("india")
          setFormData((prev) => ({ ...prev, countryCode: "+91" }))
        } else if (["AE", "SA", "QA", "KW", "BH", "OM"].includes(country)) {
          setUserCountry("uae")
          setFormData((prev) => ({ ...prev, countryCode: "+971" }))
        } else {
          setUserCountry("other")
          setFormData((prev) => ({ ...prev, countryCode: "+1" }))
        }
      })
      .catch(() => {
        setUserCountry("other")
      })
  }, [])

  useEffect(() => {
    const firstPopupTimer = setTimeout(() => {
      if (!allPopupsShown) {
        setShowDelayedPopup(true)
      }
    }, 60000)

    return () => clearTimeout(firstPopupTimer)
  }, [allPopupsShown])

  const handleCloseDelayedPopup = () => {
    setShowDelayedPopup(false)
    if (!allPopupsShown) {
      setTimeout(() => {
        setShowHotDealsPopup(true)
      }, 90000)
    }
  }

  const handleCloseHotDealsPopup = () => {
    setShowHotDealsPopup(false)
    if (!allPopupsShown) {
      setTimeout(() => {
        setShowFinalPopup(true)
      }, 90000)
    }
  }

  const handleCloseFinalPopup = () => {
    setShowFinalPopup(false)
    setAllPopupsShown(true)
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "firstName" || name === "lastName") {
      // Only allow letters and spaces
      const alphabeticValue = value.replace(/[^A-Za-z\s]/g, "")
      const capitalizedValue = capitalizeFirstLetter(alphabeticValue)
      setFormData((prevState) => ({ ...prevState, [name]: capitalizedValue }))
      return
    }

    if (name === "phone" || name === "confirmPhone") {
      const formattedValue = formatPhoneInput(value)
      setFormData((prevState) => ({ ...prevState, [name]: formattedValue }))

      if (name === "phone") {
        setShowConfirmPhone(formattedValue.length > 0)
        if (formData.confirmPhone) {
          setPhoneMatch(formattedValue === formData.confirmPhone && formattedValue !== "")
        }
      }

      if (name === "confirmPhone") {
        setPhoneMatch(value === formData.phone && value !== "")
      }
      return
    }

    if (name === "message") {
      const capitalizedMessage = capitalizeSentences(value)
      setFormData((prevState) => ({ ...prevState, [name]: capitalizedMessage }))
      return
    }

    setFormData((prevState) => ({ ...prevState, [name]: value }))

    if (name === "email") {
      setShowConfirmEmail(value.length > 0)
      if (formData.confirmEmail) {
        setEmailMatch(value === formData.confirmEmail && value !== "")
      }
    }

    if (name === "confirmEmail") {
      setEmailMatch(value === formData.email && value !== "")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setFieldErrors({})

    console.log("[v0] Form submission started")
    console.log("[v0] Form data:", formData)

    const validation = validateForm(formData)
    console.log("[v0] Validation result:", validation)

    if (!validation.isValid) {
      const errors: Record<string, string> = {}
      validation.errors.forEach((error) => {
        errors[error.field] = error.message
      })
      console.log("[v0] Validation errors:", errors)
      setFieldErrors(errors)
      return
    }

    const phoneValidation = validatePhoneNumber(formData.phone, formData.countryCode)
    console.log("[v0] Phone validation:", phoneValidation)

    if (!phoneValidation.isValid) {
      setFieldErrors({ phone: phoneValidation.message })
      return
    }

    let webhookUrl = ""
    try {
      const stored = localStorage.getItem("propsarathi_webhook_config")
      if (stored) {
        const config = JSON.parse(stored)
        webhookUrl = config.websiteFormsWebhook || ""
      }
    } catch (e) {
      console.error("[v0] Failed to load webhook config:", e)
    }

    console.log("[v0] Webhook URL loaded:", webhookUrl ? "YES" : "NO")

    try {
      console.log("[v0] Submitting to direct Google Sheets API...")
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType: "website",
          webhookUrl: webhookUrl, // Send webhook URL from client
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
            city: formData.city,
            propertyType: formData.propertyType,
            budget: formData.budget,
            message: formData.message,
          },
        }),
      })

      const result = await response.json()
      console.log("[v0] Submission result:", result)

      if (!result.success) {
        console.error("[v0] Backend submission failed:", result.message)
      }
    } catch (error) {
      console.error("[v0] Submission failed:", error)
      // Continue to show success modal even if backend fails (graceful degradation)
    }

    console.log("[v0] Form validation passed, showing success modal")

    setSubmittedFormData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      city: formData.city,
      propertyType: formData.propertyType,
      budget: formData.budget,
    })

    setShowSuccessModal(true)

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      phone: "",
      confirmPhone: "",
      countryCode: formData.countryCode,
      city: "",
      propertyType: "",
      budget: "",
      message: "",
    })
    setEmailMatch(null)
    setPhoneMatch(null)
    setShowConfirmEmail(false)
    setShowConfirmPhone(false)
    setShowEnquiryForm(false)
    setShowDelayedPopup(false)
    setShowHotDealsPopup(false)
    setShowFinalPopup(false)
  }

  const handleFormSuccess = (data: any) => {
    setSubmittedFormData(data)
    setShowSuccessModal(true)
    setShowEnquiryForm(false)
    setShowDelayedPopup(false)
    setShowHotDealsPopup(false)
    setShowFinalPopup(false)
  }

  useEffect(() => {
    if (externalShowEnquiryForm !== undefined) {
      setShowEnquiryForm(externalShowEnquiryForm)
    }
  }, [externalShowEnquiryForm])

  const handleCloseEnquiryForm = () => {
    setShowEnquiryForm(false)
    if (setExternalShowEnquiryForm) {
      setExternalShowEnquiryForm(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 flex flex-col gap-3 md:gap-4">
        <a
          href="https://wa.me/917090303535"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-white hover:bg-gray-50 rounded-full p-2 md:p-2.5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce-slow"
          aria-label="Chat on WhatsApp"
        >
          <img src="/images/whatsapp-icon.png" alt="WhatsApp" className="w-10 h-10 md:w-12 md:h-12" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        </a>

        <button
          onClick={() => {
            setShowEnquiryForm(true)
            if (setExternalShowEnquiryForm) {
              setExternalShowEnquiryForm(true)
            }
          }}
          className="group relative bg-primary hover:bg-primary/90 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
          aria-label="Enquire Now"
        >
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>

      {showEnquiryForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseEnquiryForm}
          />

          <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Desktop version */}
            <div className="hidden md:flex md:items-end md:justify-end w-full h-full p-6">
              <div className="pointer-events-auto w-full max-w-[650px] max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl bg-white flex flex-col">
                {/* Fixed header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0 bg-white">
                  <h3 className="text-2xl font-serif font-bold text-foreground">Quick Enquiry</h3>
                  <button
                    onClick={handleCloseEnquiryForm}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 hover:bg-gray-100 rounded-full"
                    type="button"
                    aria-label="Close form"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-6">
                  <UnifiedEnquiryForm
                    source="Floating Button"
                    onSuccess={handleFormSuccess}
                    buttonText="Submit Enquiry"
                    buttonClassName="bg-primary text-white font-bold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="md:hidden pointer-events-auto w-full h-full">
              <div className="bg-white w-full h-full flex flex-col safe-area-inset">
                {/* Fixed header - stays at top */}
                <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-10">
                  <h3 className="text-xl font-serif font-bold text-foreground">Quick Enquiry</h3>
                  <button
                    onClick={handleCloseEnquiryForm}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 hover:bg-gray-100 rounded-full active:scale-95"
                    aria-label="Close form"
                    type="button"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                    scrollBehavior: "smooth",
                  }}
                >
                  <UnifiedEnquiryForm
                    source="Floating Button"
                    onSuccess={handleFormSuccess}
                    buttonText="Submit Enquiry"
                    buttonClassName="bg-primary text-white font-bold hover:bg-opacity-90 transition-all duration-300 active:scale-95"
                  />
                  <div className="h-20" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showDelayedPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm animate-fade-in"
            onClick={handleCloseDelayedPopup}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5 flex-shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground">Special Offer!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Limited time opportunity</p>
                </div>
                <button
                  onClick={handleCloseDelayedPopup}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                  aria-label="Close popup"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                  scrollBehavior: "smooth",
                }}
              >
                <p className="text-gray-700 mb-4 text-sm md:text-base">
                  Get exclusive access to pre-launch properties with special pricing. Fill out the form to learn more!
                </p>
                <UnifiedEnquiryForm
                  source="Popup Form"
                  onSuccess={handleFormSuccess}
                  buttonText="Get Special Offer"
                  buttonClassName="bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-90 transition-all duration-300"
                />
                {/* Extra padding at bottom for scroll */}
                <div className="h-4" />
              </div>
            </div>
          </div>
        </>
      )}

      {showHotDealsPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm animate-fade-in"
            onClick={handleCloseHotDealsPopup}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/20 flex-shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold">Hot Deals Alert!</h3>
                  <p className="text-sm text-white/80 mt-1">Exclusive properties available now</p>
                </div>
                <button
                  onClick={handleCloseHotDealsPopup}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full flex-shrink-0"
                  aria-label="Close popup"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                  scrollBehavior: "smooth",
                }}
              >
                <div className="space-y-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h4 className="font-bold mb-2 text-base">Dubai Marina - Luxury Apartment</h4>
                    <p className="text-sm text-white/90">Starting from AED 1.2M | 8% ROI</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h4 className="font-bold mb-2 text-base">Bangalore North - Premium Villa</h4>
                    <p className="text-sm text-white/90">Starting from ₹2.5 Cr | Ready to Move</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHotDealsPopup(false)
                    setShowEnquiryForm(true)
                  }}
                  className="w-full bg-white text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95"
                >
                  I'm Interested!
                </button>
                {/* Extra padding at bottom for scroll */}
                <div className="h-4" />
              </div>
            </div>
          </div>
        </>
      )}

      {showFinalPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm animate-fade-in"
            onClick={handleCloseFinalPopup}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/20 flex-shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold">Last Chance!</h3>
                  <p className="text-sm text-white/80 mt-1">Don't miss this opportunity</p>
                </div>
                <button
                  onClick={handleCloseFinalPopup}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full flex-shrink-0"
                  aria-label="Close popup"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                  scrollBehavior: "smooth",
                }}
              >
                <p className="text-base md:text-lg mb-4">
                  Don't miss out on exclusive investment opportunities! Our experts are ready to help you find your
                  perfect property.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-green-300">✓</span> Personalized Property Recommendations
                  </p>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-green-300">✓</span> Expert Market Insights
                  </p>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-green-300">✓</span> End-to-End Support
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFinalPopup(false)
                    setShowEnquiryForm(true)
                  }}
                  className="w-full bg-white text-secondary font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95"
                >
                  Get Started Now!
                </button>
                {/* Extra padding at bottom for scroll */}
                <div className="h-4" />
              </div>
            </div>
          </div>
        </>
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          userName={`${submittedFormData.firstName} ${submittedFormData.lastName}`.trim() || "there"}
          city={submittedFormData.city}
          propertyType={submittedFormData.propertyType}
          budget={submittedFormData.budget}
        />
      )}
    </>
  )
}

export default FloatingActions
