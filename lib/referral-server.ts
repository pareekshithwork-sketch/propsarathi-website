import { cookies } from 'next/headers'

const REF_COOKIE = 'ps_ref'

/** Server-side: read referral code from cookie */
export async function getReferralCode(): Promise<string | null> {
  const store = await cookies()
  return store.get(REF_COOKIE)?.value ?? null
}

/** Server-side: clear referral cookie */
export function clearReferralHeader(): { name: string; value: string; maxAge: number } {
  return { name: REF_COOKIE, value: '', maxAge: 0 }
}
