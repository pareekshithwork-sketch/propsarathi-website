export function calculateTier(bookingCount: number): string {
  if (bookingCount >= 25) return 'Platinum'
  if (bookingCount >= 10) return 'Gold'
  if (bookingCount >= 3) return 'Silver'
  return 'Bronze'
}

export const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-slate-100 text-slate-600',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-purple-100 text-[#422D83]',
}
