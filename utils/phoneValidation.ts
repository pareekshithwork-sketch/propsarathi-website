export const COUNTRY_PHONE_LENGTHS: Record<string, number> = {
  "+1": 10, // USA/Canada
  "+91": 10, // India
  "+971": 9, // UAE
  "+966": 9, // Saudi Arabia
  "+974": 8, // Qatar
  "+965": 8, // Kuwait
  "+973": 8, // Bahrain
  "+968": 8, // Oman
  "+44": 10, // UK
  "+61": 9, // Australia
  "+65": 8, // Singapore
  "+60": 9, // Malaysia
  "+86": 11, // China
  "+81": 10, // Japan
  "+82": 10, // South Korea
}

export const validatePhoneNumber = (phone: string, countryCode: string): { isValid: boolean; message: string } => {
  const numericPhone = phone.replace(/\D/g, "")

  if (!/^\d+$/.test(numericPhone)) {
    return { isValid: false, message: "Phone number must contain only digits" }
  }

  // Get expected length for country code
  const expectedLength = COUNTRY_PHONE_LENGTHS[countryCode] || 10

  // Validate length
  if (numericPhone.length !== expectedLength) {
    return {
      isValid: false,
      message: `Phone number must be exactly ${expectedLength} digits for ${countryCode}`,
    }
  }

  return { isValid: true, message: "" }
}

export const formatPhoneInput = (value: string, countryCode?: string): string => {
  // Only allow numeric characters, no spaces or formatting
  const numericValue = value.replace(/\D/g, "")

  // Limit to max length based on country code
  const maxLength = countryCode ? COUNTRY_PHONE_LENGTHS[countryCode] || 10 : 15
  return numericValue.slice(0, maxLength)
}
