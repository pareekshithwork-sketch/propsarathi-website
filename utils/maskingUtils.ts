export function maskEmail(email: string): string {
  if (!email || email.length < 3) return email

  const [localPart, domain] = email.split("@")
  if (!domain) return email

  // Show first 2 characters and mask the rest of local part
  const maskedLocal = localPart.length > 2 ? localPart.substring(0, 2) + "***" : localPart

  // Mask domain name but show extension
  const [domainName, ...extensions] = domain.split(".")
  const maskedDomain = domainName.length > 2 ? "***" + domainName.substring(domainName.length - 2) : domainName

  return `${maskedLocal}@${maskedDomain}.${extensions.join(".")}`
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone

  // Show only last 4 digits
  const lastFour = phone.slice(-4)
  const masked = "*".repeat(phone.length - 4)

  return masked + lastFour
}
