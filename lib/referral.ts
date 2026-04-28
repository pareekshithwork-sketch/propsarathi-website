// CLIENT-SIDE ONLY — no next/headers import

const REF_COOKIE = 'ps_ref'
const REF_TTL_DAYS = 30

/** Client-side: read referral code from document.cookie */
export function getReferralCodeClient(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)ps_ref=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Client-side: set referral cookie */
export function captureReferral(code: string): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + REF_TTL_DAYS * 864e5).toUTCString()
  document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)};expires=${expires};path=/;SameSite=Lax`
}

/** Client-side: clear referral cookie */
export function clearReferral(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${REF_COOKIE}=;max-age=0;path=/`
}
