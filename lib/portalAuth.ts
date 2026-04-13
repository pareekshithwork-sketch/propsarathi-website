import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'propsarathi-portal-secret-2026'

export function generatePortalToken(viewer: { id: number; phone: string; countryCode: string; name?: string }) {
  return jwt.sign(
    { id: viewer.id, phone: viewer.phone, countryCode: viewer.countryCode, name: viewer.name || '' },
    SECRET,
    { expiresIn: '30d' }
  )
}

export function verifyPortalToken(token: string): any {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Format price for display
export function formatPrice(price: number, currency: string = 'INR'): string {
  if (currency === 'AED') {
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K`
    return `AED ${price}`
  }
  // INR
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`
  return `₹${price}`
}
