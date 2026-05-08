'use client'

import React from 'react'
import { Users, Building2, TrendingUp, AlertCircle } from 'lucide-react'
import { TIER_COLORS } from '@/lib/partnerTier'

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  'KYC Pending': 'bg-blue-100 text-blue-700',
  'Training Pending': 'bg-indigo-100 text-indigo-700',
  Inactive: 'bg-gray-100 text-gray-500',
  Suspended: 'bg-red-100 text-red-700',
}

function ReEngagementDot({ days }: { days: number }) {
  if (days < 10 || days >= 9999) return null
  const color = days >= 25 ? 'bg-red-500' : days >= 15 ? 'bg-orange-500' : 'bg-yellow-400'
  const urgent = days >= 30
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />
      <span className={urgent ? 'text-red-600 font-semibold' : 'text-gray-500'}>
        {days >= 9999 ? '' : `${Math.floor(days)}d inactive${urgent ? ' · Follow up' : ''}`}
      </span>
    </span>
  )
}

function Avatar({ name, image }: { name: string; image?: string }) {
  if (image) return <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
  const initials = name.trim().split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div className="w-9 h-9 rounded-full bg-[#422D83]/15 text-[#422D83] flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

export function PartnersList({
  partners, loading, onSelect,
}: {
  partners: any[]
  loading: boolean
  onSelect: (p: any) => void
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading partners…
      </div>
    )
  }
  if (partners.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 py-12">
        <Users className="w-10 h-10 opacity-30" />
        <p className="text-sm">No partners found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {partners.map((p: any) => {
        const days = Number(p.days_since_last_referral) || 9999
        const pendingAmt = Number(p.total_commission_pending) || 0
        return (
          <div
            key={p.partner_id}
            onClick={() => onSelect(p)}
            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Avatar name={p.name} image={p.profile_image} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate">{p.name}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{p.partner_id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[p.tier] || TIER_COLORS.Bronze}`}>
                  {p.tier}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500">{p.profession_type}</span>
                {p.assigned_rm_name && (
                  <span className="text-xs text-gray-400">· {p.assigned_rm_name}</span>
                )}
                {p.city && <span className="text-xs text-gray-400">· {p.city}</span>}
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <Building2 className="w-3 h-3" /> {p.total_enquiries_referred ?? 0} enq
                </span>
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" /> {p.total_bookings ?? 0} booked
                </span>
                {pendingAmt > 0 && (
                  <span className="text-xs text-amber-600 font-medium">
                    ₹{pendingAmt.toLocaleString('en-IN')} pending
                  </span>
                )}
                <ReEngagementDot days={days} />
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-500'}`}>
                {p.status}
              </span>
              {days >= 30 && days < 9999 && (
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
