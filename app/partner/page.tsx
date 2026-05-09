'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, IndianRupee, TrendingUp, Star, ArrowRight, AlertCircle } from 'lucide-react'

interface Stats {
  totalReferred: number
  totalEnquiries: number
  totalListings: number
  totalBookings: number
  conversionRate: number
  commissionPending: number
  commissionApproved: number
  commissionPaid: number
  lastReferralDate: string | null
  tier: string
  recentActivity: { id: number; activity_type: string; title: string; description: string; created_at: string }[]
}

const STATUS_INFO: Record<string, { label: string; color: string; message: string }> = {
  Active: { label: 'Active', color: 'bg-green-50 border-green-200 text-green-800', message: '' },
  'Training Pending': {
    label: 'Training Pending',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    message: 'Please complete your onboarding training to start referring clients.',
  },
  'KYC Pending': {
    label: 'KYC Pending',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    message: 'Your KYC verification is pending. Submit your documents to activate your account.',
  },
  Pending: {
    label: 'Pending Approval',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    message: 'Your account is pending approval. Your RM will reach out shortly.',
  },
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

export default function PartnerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [partnerStatus, setPartnerStatus] = useState('Active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/stats').then((r) => r.json()),
      fetch('/api/partner/auth/me').then((r) => r.json()),
    ])
      .then(([s, m]) => {
        if (s.success) setStats(s.stats)
        if (m.success && m.partner) setPartnerStatus(m.partner.status || 'Active')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const statusInfo = STATUS_INFO[partnerStatus] || STATUS_INFO.Active

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Your partner performance overview</p>
      </div>

      {/* Status banner */}
      {partnerStatus !== 'Active' && statusInfo.message && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${statusInfo.color}`}>
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{statusInfo.label}</p>
            <p className="text-sm mt-0.5">{statusInfo.message}</p>
            {partnerStatus === 'KYC Pending' && (
              <Link href="/partner/kyc" className="text-sm underline font-medium mt-1 inline-block">
                Complete KYC →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-violet-600" />
            <span className="text-xs text-gray-500 font-medium">Total Referred</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalReferred ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats?.totalEnquiries ?? 0} enquiries · {stats?.totalListings ?? 0} listings</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500 font-medium">Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats?.conversionRate ?? 0}% conversion</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="h-4 w-4 text-green-600" />
            <span className="text-xs text-gray-500 font-medium">Commission Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(stats?.commissionPaid ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{fmt(stats?.commissionPending ?? 0)} pending</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">Tier</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.tier ?? 'Bronze'}</p>
          <p className="text-xs text-gray-400 mt-1">Partner level</p>
        </div>
      </div>

      {/* Recent activity */}
      {stats && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/partner/referrals" className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="px-5 py-3">
                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary CTA — Refer a Client */}
      <Link
        href="/partner/referrals?refer=1"
        className="flex items-center justify-between bg-violet-600 hover:bg-violet-700 text-white rounded-2xl p-5 transition-colors shadow-md"
      >
        <div>
          <p className="text-base font-bold">Refer a Client</p>
          <p className="text-sm text-white/70 mt-0.5">Submit a new referral in under 30 seconds</p>
        </div>
        <div className="bg-white/20 rounded-full p-2.5">
          <ArrowRight className="h-5 w-5" />
        </div>
      </Link>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/partner/projects"
          className="bg-white border border-gray-200 text-gray-700 rounded-xl p-4 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          Browse Projects
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/partner/referrals"
          className="bg-white border border-gray-200 text-gray-700 rounded-xl p-4 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          My Referrals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
