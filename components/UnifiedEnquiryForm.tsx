"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm } from "@/lib/api"
import { CountryCodeSelect } from "./CountryCodeSelect"
import { formatPhoneInput } from "../utils/phoneValidation"
import { capitalizeFirstLetter, capitalizeSentences } from "../utils/textCapitalization"
import { CheckCircle2, XCircle, Sparkles, Loader2 } from "lucide-react"

interface UnifiedEnquiryFormProps {
  source: "Hero Section Form" | "Popup Form" | "Floating Button" | "Contact Us" | "Other"
  onSuccess?: (data: {
    firstName: string
    lastName: string
    city: string
    propertyType: string
    budget: string
  }) => void
  buttonText?: string
  buttonClassName?: string
}

export function UnifiedEnquiryForm({
  source,
  onSuccess,
  buttonText = "Submit Enquiry",
  buttonClassName = "",
}: UnifiedEnquiryFormProps) {
  useEffect(() => {
    console.log("=== UnifiedEnquiryForm MOUNTED ===")
    console.log("Source:", source)
    return () => {
      console.log("=== UnifiedEnquiryForm UNMOUNTED ===")
    }
  }, [source])

  const [userCountry, setUserCountry] = useState<"india" | "uae" | "other">("other")
  const [ipDetectionDone, setIpDetectionDone] = useState(false)
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [showMaskedEmail, setShowMaskedEmail] = useState(false)
  const [showMaskedPhone, setShowMaskedPhone] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (ipDetectionDone) return

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
        setIpDetectionDone(true)
      })
      .catch((error) => {
        setUserCountry("other")
        setIpDetectionDone(true)
      })
  }, [ipDetectionDone])

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

  const handlePaste = (e: React.ClipboardEvent, fieldName: string) => {
    const pastedText = e.clipboardData.getData("text")

    if (fieldName === "confirmEmail") {
      // Let the paste happen, then validate
      setTimeout(() => {
        setEmailMatch(pastedText === formData.email && pastedText !== "")
      }, 0)
    }

    if (fieldName === "confirmPhone") {
      // Let the paste happen, then validate
      setTimeout(() => {
        const formattedPasted = formatPhoneInput(pastedText, formData.countryCode)
        setPhoneMatch(formattedPasted === formData.phone && formattedPasted !== "")
      }, 0)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "firstName" || name === "lastName") {
      const alphabeticValue = value.replace(/[^A-Za-z\s]/g, "")
      const capitalizedValue = capitalizeFirstLetter(alphabeticValue)
      setFormData((prevState) => ({ ...prevState, [name]: capitalizedValue }))
      return
    }

    if (name === "phone" || name === "confirmPhone") {
      const formattedValue = formatPhoneInput(value, formData.countryCode)
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

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    setFocusedField(null)

    if (fieldName === "email" && formData.email) {
      setShowMaskedEmail(true)
    }
    if (fieldName === "phone" && formData.phone) {
      setShowMaskedPhone(true)
    }
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)

    if (fieldName === "email") {
      setShowMaskedEmail(false)
    }
    if (fieldName === "phone") {
      setShowMaskedPhone(false)
    }
  }

  const handleSubmit = async () => {
    console.log("🔥 SUBMIT HANDLER CALLED!")

    if (isSubmitting) {
      console.log("Already submitting")
      return
    }

    const now = Date.now()
    if (now - lastSubmitTime < 2000) {
      console.log("Too soon after last submit")
      return
    }

    console.log("Form data:", formData)
    setFieldErrors({})

    // Validate all required fields
    if (!formData.firstName || !formData.lastName) {
      setFieldErrors({ firstName: "First name is required", lastName: "Last name is required" })
      return
    }

    // Email validation with @ check
    if (!formData.email || !formData.confirmEmail) {
      setFieldErrors({ email: "Email is required", confirmEmail: "Confirm email is required" })
      return
    }

    if (!formData.email.includes("@")) {
      setFieldErrors({ email: "Email must contain @ symbol" })
      return
    }

    if (!formData.confirmEmail.includes("@")) {
      setFieldErrors({ confirmEmail: "Email must contain @ symbol" })
      return
    }

    if (formData.email !== formData.confirmEmail) {
      setFieldErrors({ confirmEmail: "Emails do not match" })
      return
    }

    if (!formData.phone || !formData.confirmPhone) {
      setFieldErrors({ phone: "Phone is required", confirmPhone: "Confirm phone is required" })
      return
    }

    if (formData.phone !== formData.confirmPhone) {
      setFieldErrors({ confirmPhone: "Phone numbers do not match" })
      return
    }

    if (!formData.city || !formData.propertyType || !formData.budget) {
      setFieldErrors({
        city: !formData.city ? "City is required" : "",
        propertyType: !formData.propertyType ? "Property type is required" : "",
        budget: !formData.budget ? "Budget is required" : "",
      })
      return
    }

    setIsSubmitting(true)
    setLastSubmitTime(now)

    try {
      console.log("Submitting to API...")
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        city: formData.city,
        propertyType: formData.propertyType,
        budget: formData.budget,
        message: formData.message,
        source: source,
      }

      const result = await submitContactForm(submissionData)
      console.log("API result:", result)

      if (result.success) {
        console.log("✅ SUCCESS!")
        setShowSuccessMessage(true)

        if (onSuccess) {
          onSuccess({
            firstName: formData.firstName,
            lastName: formData.lastName,
            city: formData.city,
            propertyType: formData.propertyType,
            budget: formData.budget,
          })
        }

        setTimeout(() => {
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
          setTouchedFields({})
          setShowMaskedEmail(false)
          setShowMaskedPhone(false)
          setShowSuccessMessage(false)
        }, 3000)
      } else {
        console.log("❌ Backend error:", result.message)
        setFieldErrors({ submit: result.message || "Failed to submit form" })
      }
    } catch (error) {
      console.error("❌ Submission error:", error)
      setFieldErrors({ submit: "An error occurred. Please try again." })
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)
    }
  }

  const maskEmail = (email: string): string => {
    if (!email || email.length < 3) return email
    const [localPart, domain] = email.split("@")
    if (!domain) return email
    const maskedLocal = localPart.substring(0, 2) + "•".repeat(Math.max(localPart.length - 2, 3))
    return `${maskedLocal}@${domain}`
  }

  const maskPhone = (phone: string): string => {
    if (!phone || phone.length < 4) return phone
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length < 4) return phone
    return "•".repeat(cleaned.length - 4) + cleaned.slice(-4)
  }

  return (
    <div className="space-y-4 md:space-y-5 w-full relative z-10 form-light-beam">
      {showSuccessMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 text-green-700 px-4 py-3 rounded-xl animate-in slide-in-from-top-2 duration-300 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 animate-bounce" />
          <span className="font-semibold text-base">
            Success! Your enquiry has been submitted. We'll contact you soon!
          </span>
        </div>
      )}

      {fieldErrors.submit && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-top-2 duration-300 flex items-center gap-3 shadow-lg">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{fieldErrors.submit}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="relative group">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={() => handleBlur("firstName")}
            onFocus={() => handleFocus("firstName")}
            className={`transition-all duration-300 ${
              fieldErrors.firstName
                ? "border-red-500 focus:ring-red-500 focus:ring-2"
                : touchedFields.firstName && formData.firstName
                  ? "border-green-500 focus:ring-green-500 focus:ring-2"
                  : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            } ${focusedField === "firstName" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
            required
          />
          {touchedFields.firstName && formData.firstName && !fieldErrors.firstName && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
          )}
          {fieldErrors.firstName && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.firstName}
            </p>
          )}
        </div>
        <div className="relative group">
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={() => handleBlur("lastName")}
            onFocus={() => handleFocus("lastName")}
            className={`transition-all duration-300 ${
              fieldErrors.lastName
                ? "border-red-500 focus:ring-red-500 focus:ring-2"
                : touchedFields.lastName && formData.lastName
                  ? "border-green-500 focus:ring-green-500 focus:ring-2"
                  : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            } ${focusedField === "lastName" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
            required
          />
          {touchedFields.lastName && formData.lastName && !fieldErrors.lastName && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
          )}
          {fieldErrors.lastName && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="relative group">
        <Input
          type="email"
          name="email"
          placeholder="Email Address"
          value={showMaskedEmail ? maskEmail(formData.email) : formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          onFocus={() => handleFocus("email")}
          autoComplete="email"
          className={`transition-all duration-300 ${
            fieldErrors.email
              ? "border-red-500 focus:ring-red-500 focus:ring-2"
              : touchedFields.email && formData.email
                ? "border-green-500 focus:ring-green-500 focus:ring-2"
                : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
          } ${focusedField === "email" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
          required
        />
        {touchedFields.email && formData.email && !fieldErrors.email && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
        )}
        {fieldErrors.email && (
          <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">{fieldErrors.email}</p>
        )}
      </div>

      {showConfirmEmail && (
        <div className="relative group animate-in slide-in-from-top-4 duration-500 ease-out">
          <Input
            type="email"
            name="confirmEmail"
            placeholder="Re-enter Email Address"
            value={formData.confirmEmail}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmEmail")}
            onFocus={() => handleFocus("confirmEmail")}
            onPaste={(e) => handlePaste(e, "confirmEmail")}
            autoComplete="off"
            className={`transition-all duration-300 ${
              fieldErrors.confirmEmail
                ? "border-red-500 focus:ring-red-500 focus:ring-2"
                : emailMatch === true
                  ? "border-green-500 focus:ring-green-500 focus:ring-2"
                  : emailMatch === false
                    ? "border-red-500 focus:ring-red-500 focus:ring-2"
                    : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            } ${focusedField === "confirmEmail" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
            required
          />
          {emailMatch === true && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300 pointer-events-none" />
          )}
          {emailMatch === false && (
            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-in zoom-in duration-300 pointer-events-none" />
          )}
          {emailMatch === false && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
              <XCircle className="w-4 h-4" />
              Email addresses do not match
            </p>
          )}
          {emailMatch === true && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Email addresses match
            </p>
          )}
          {fieldErrors.confirmEmail && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.confirmEmail}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-row gap-2 md:gap-3 items-start">
        <div className="w-[110px] sm:w-[130px] flex-shrink-0">
          <CountryCodeSelect
            value={formData.countryCode}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, countryCode: value }))
            }}
            className="transition-all duration-300 hover:shadow-md w-full h-[44px]"
          />
        </div>
        <div className="relative group flex-1">
          <Input
            type="tel"
            name="phone"
            placeholder="Mobile Number"
            value={showMaskedPhone ? maskPhone(formData.phone) : formData.phone}
            onChange={handleChange}
            onBlur={() => handleBlur("phone")}
            onFocus={() => handleFocus("phone")}
            autoComplete="tel"
            inputMode="numeric"
            className={`transition-all duration-300 h-[44px] ${
              fieldErrors.phone
                ? "border-red-500 focus:ring-red-500 focus:ring-2"
                : touchedFields.phone && formData.phone
                  ? "border-green-500 focus:ring-green-500 focus:ring-2"
                  : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            } ${focusedField === "phone" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
            required
          />
          {touchedFields.phone && formData.phone && !fieldErrors.phone && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
          )}
          {fieldErrors.phone && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">{fieldErrors.phone}</p>
          )}
        </div>
      </div>

      {showConfirmPhone && (
        <div className="relative group animate-in slide-in-from-top-4 duration-500 ease-out">
          <Input
            type="tel"
            name="confirmPhone"
            placeholder="Re-enter Mobile Number"
            value={formData.confirmPhone}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmPhone")}
            onFocus={() => handleFocus("confirmPhone")}
            onPaste={(e) => handlePaste(e, "confirmPhone")}
            autoComplete="off"
            inputMode="numeric"
            className={`transition-all duration-300 ${
              fieldErrors.confirmPhone
                ? "border-red-500 focus:ring-red-500 focus:ring-2"
                : phoneMatch === true
                  ? "border-green-500 focus:ring-green-500 focus:ring-2"
                  : phoneMatch === false
                    ? "border-red-500 focus:ring-red-500 focus:ring-2"
                    : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            } ${focusedField === "confirmPhone" ? "scale-[1.01] shadow-lg" : "hover:shadow-md"}`}
            required
          />
          {phoneMatch === true && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in duration-300 pointer-events-none" />
          )}
          {phoneMatch === false && (
            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-in zoom-in duration-300 pointer-events-none" />
          )}
          {phoneMatch === false && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
              <XCircle className="w-4 h-4" />
              Phone numbers do not match
            </p>
          )}
          {phoneMatch === true && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Phone numbers match
            </p>
          )}
          {fieldErrors.confirmPhone && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.confirmPhone}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm md:text-base text-muted-foreground font-medium min-w-[160px]">
          Select Interested City:
        </label>
        <div className="flex-1 group">
          <Select value={formData.city} onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}>
            <SelectTrigger
              className={`transition-all duration-300 hover:shadow-md min-h-[44px] ${
                fieldErrors.city ? "border-red-500" : "hover:border-primary/50"
              } ${formData.city ? "border-green-500" : ""}`}
            >
              <SelectValue placeholder="Click to select" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Dubai">Dubai</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.city && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">{fieldErrors.city}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm md:text-base text-muted-foreground font-medium min-w-[160px]">Property Type:</label>
        <div className="flex-1 group">
          <Select
            value={formData.propertyType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
          >
            <SelectTrigger
              className={`transition-all duration-300 hover:shadow-md min-h-[44px] ${
                fieldErrors.propertyType ? "border-red-500" : "hover:border-primary/50"
              } ${formData.propertyType ? "border-green-500" : ""}`}
            >
              <SelectValue placeholder="Click to select" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.propertyType && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.propertyType}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm md:text-base text-muted-foreground font-medium min-w-[160px]">Budget Range:</label>
        <div className="flex-1 group">
          <Select
            value={formData.budget}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
          >
            <SelectTrigger
              className={`transition-all duration-300 hover:shadow-md min-h-[44px] ${
                fieldErrors.budget ? "border-red-500" : "hover:border-primary/50"
              } ${formData.budget ? "border-green-500" : ""}`}
            >
              <SelectValue placeholder="Click to select" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              {getBudgetOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.budget && (
            <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.budget}
            </p>
          )}
        </div>
      </div>

      <div className="group">
        <Textarea
          name="message"
          placeholder="Your requirements..."
          value={formData.message}
          onChange={handleChange}
          onBlur={() => handleBlur("message")}
          onFocus={() => handleFocus("message")}
          rows={3}
          className={`transition-all duration-300 resize-none min-h-[80px] ${
            focusedField === "message"
              ? "scale-[1.01] shadow-lg ring-2 ring-primary/20 border-primary"
              : "hover:shadow-md hover:border-primary/50"
          }`}
        />
      </div>

      <div className="pt-2 pb-2 relative z-50">
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log("🎯 Button onClick fired!")
            handleSubmit()
          }}
          disabled={isSubmitting || showSuccessMessage}
          className={`w-full min-h-[52px] md:min-h-[56px] text-base md:text-lg font-semibold transition-all duration-300 relative overflow-hidden group ${buttonClassName} ${
            isSubmitting
              ? "bg-primary/70 cursor-wait"
              : showSuccessMessage
                ? "bg-green-600 hover:bg-green-600"
                : "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          }`}
          style={{
            pointerEvents: isSubmitting || showSuccessMessage ? "none" : "auto",
            zIndex: 100,
            position: "relative",
            touchAction: "manipulation",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {!isSubmitting && !showSuccessMessage && (
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3 relative z-10">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Submitting Your Enquiry...</span>
            </span>
          ) : showSuccessMessage ? (
            <span className="flex items-center justify-center gap-3 relative z-10 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <span className="font-bold">Submitted Successfully!</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              {buttonText}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

export default UnifiedEnquiryForm
