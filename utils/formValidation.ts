export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateForm(formData: {
  firstName: string
  lastName: string
  email: string
  confirmEmail: string
  phone: string
  confirmPhone: string
  countryCode: string
  city: string
  propertyType: string
  budget: string
  message?: string
}): FormValidationResult {
  const errors: ValidationError[] = []

  // First Name validation - only alphabets allowed, auto-capitalized
  if (!formData.firstName || formData.firstName.trim() === "") {
    errors.push({ field: "firstName", message: "First name is required" })
  } else if (formData.firstName.trim().length < 2) {
    errors.push({ field: "firstName", message: "First name must be at least 2 characters" })
  } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
    errors.push({ field: "firstName", message: "First name should contain only letters" })
  }

  // Last Name validation - only alphabets allowed, auto-capitalized
  if (!formData.lastName || formData.lastName.trim() === "") {
    errors.push({ field: "lastName", message: "Last name is required" })
  } else if (formData.lastName.trim().length < 2) {
    errors.push({ field: "lastName", message: "Last name must be at least 2 characters" })
  } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
    errors.push({ field: "lastName", message: "Last name should contain only letters" })
  }

  // Email validation - mandatory field
  if (!formData.email || formData.email.trim() === "") {
    errors.push({ field: "email", message: "Email address is required" })
  } else if (!formData.email.includes("@")) {
    errors.push({ field: "email", message: "Email must contain @ symbol" })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.push({ field: "email", message: "Please enter a valid email address" })
  }

  // Confirm Email validation - mandatory when email is provided
  if (formData.email && formData.email.trim() !== "") {
    if (!formData.confirmEmail || formData.confirmEmail.trim() === "") {
      errors.push({ field: "confirmEmail", message: "Please re-enter your email address to confirm" })
    } else if (!formData.confirmEmail.includes("@")) {
      errors.push({ field: "confirmEmail", message: "Email must contain @ symbol" })
    } else if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase()) {
      errors.push({ field: "confirmEmail", message: "Email addresses do not match" })
    }
  }

  // Phone validation - mandatory field, only digits
  if (!formData.phone || formData.phone.trim() === "") {
    errors.push({ field: "phone", message: "Mobile number is required" })
  } else {
    const cleanedPhone = formData.phone.replace(/\D/g, "")
    if (cleanedPhone.length < 7) {
      errors.push({ field: "phone", message: "Mobile number must be at least 7 digits" })
    } else if (cleanedPhone.length > 15) {
      errors.push({ field: "phone", message: "Mobile number cannot exceed 15 digits" })
    }
  }

  // Confirm Phone validation - mandatory when phone is provided
  if (formData.phone && formData.phone.trim() !== "") {
    if (!formData.confirmPhone || formData.confirmPhone.trim() === "") {
      errors.push({ field: "confirmPhone", message: "Please re-enter your mobile number to confirm" })
    } else {
      const cleanedPhone = formData.phone.replace(/\D/g, "")
      const cleanedConfirmPhone = formData.confirmPhone.replace(/\D/g, "")
      if (cleanedPhone !== cleanedConfirmPhone) {
        errors.push({ field: "confirmPhone", message: "Mobile numbers do not match" })
      }
    }
  }

  // City validation - mandatory field
  if (!formData.city || formData.city === "" || formData.city === "Click to select") {
    errors.push({ field: "city", message: "Please select a city of interest" })
  }

  // Property Type validation - mandatory field
  if (!formData.propertyType || formData.propertyType === "" || formData.propertyType === "Click to select") {
    errors.push({ field: "propertyType", message: "Please select a property type" })
  }

  // Budget validation - mandatory field
  if (!formData.budget || formData.budget === "" || formData.budget === "Click to select") {
    errors.push({ field: "budget", message: "Please select your budget range" })
  }

  // Message is optional - no validation needed

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getErrorMessage(errors: ValidationError[], field: string): string | null {
  const error = errors.find((e) => e.field === field)
  return error ? error.message : null
}

export function formatErrorMessages(errors: ValidationError[]): string {
  if (errors.length === 0) return ""
  if (errors.length === 1) return errors[0].message

  return "Please fix the following errors:\n\n" + errors.map((e, index) => `${index + 1}. ${e.message}`).join("\n")
}
