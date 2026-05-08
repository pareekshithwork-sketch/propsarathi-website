'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Building2,
  IndianRupee,
  UserCircle,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface PartnerProfile {
  partnerId: string
  name: string
  email: string
  status: string
  tier: string
}

const AUTH_BYPASS = ['/partner/login', '/partner/setup']

const NAV_ITEMS = [
  { href: '/partner', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/partner/referrals', label: 'My Referrals', icon: Users },
  { href: '/partner/projects', label: 'Projects', icon: Building2 },
  { href: '/partner/commission', label: 'Commission', icon: IndianRupee },
  { href: '/partner/profile', label: 'My Profile', icon: UserCircle },
  { href: '/partner/kyc', label: 'KYC', icon: FileText },
]

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-orange-100 text-orange-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-blue-100 text-blue-700',
}

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0]
  pathname: string
  onClick?: () => void
}) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-violet-100 text-violet-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

export default function PartnerPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const bypass = AUTH_BYPASS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (bypass) { setLoading(false); return }
    fetch('/api/partner/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.partner) setPartner(d.partner)
        else router.replace('/partner/login')
      })
      .catch(() => router.replace('/partner/login'))
      .finally(() => setLoading(false))
  }, [bypass, router])

  if (bypass) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!partner) return null

  const tierColor = TIER_COLORS[partner.tier] || TIER_COLORS.Bronze

  async function handleLogout() {
    await fetch('/api/partner/auth/logout', { method: 'POST' })
    router.replace('/partner/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Image src="/logo.png" alt="PropSarathi" width={28} height={28} className="rounded" />
          <span className="text-base font-semibold text-gray-900">PropSarathi</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Partner info + logout */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">{partner.name}</p>
            <p className="text-xs text-gray-500 truncate">{partner.email}</p>
            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${tierColor}`}>
              {partner.tier}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="PropSarathi" width={24} height={24} className="rounded" />
          <span className="text-sm font-semibold text-gray-900">PropSarathi</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-100 space-y-2">
              <p className="text-sm font-medium text-gray-900 truncate">{partner.name}</p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${tierColor}`}>
                {partner.tier}
              </span>
              <div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-violet-700' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label.split(' ')[0]}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
