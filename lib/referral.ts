import { cookies } from 'next/headers'

const REF_COOKIE = 'ps_ref'
const REF_TTL_DAYS = 30

/** Server-side: read referral code from cookie */
export async function getReferralCode(): Promise<string | null> {
  const store = await cookies()
  return store.get(REF_COOKIE)?.value ?? null
}

/** Server-side: clear referral cookie (call in response) */
export function clearReferralHeader(): { name: string; value: string; maxAge: number } {
  return { name: REF_COOKIE, value: '', maxAge: 0 }
}

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
