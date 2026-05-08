'use client'

import { useEffect, useState } from 'react'
import { IndianRupee, Clock, CheckCircle, Banknote } from 'lucide-react'

interface Commission {
  commission_id: number
  lead_name: string
  deal_value: number
  commission_amount: number
  commission_type: string
  split_percentage: number | null
  milestone: string
  status: string
  created_at: string
  approved_at: string | null
  paid_at: string | null
  payment_reference: string | null
}

function fmt(n: number) {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function fmtDate(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function PartnerCommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/partner/commissions')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCommissions(d.commissions) })
      .finally(() => setLoading(false))
  }, [])

  const pending = commissions.filter((c) => c.status === 'Pending').reduce((s, c) => s + Number(c.commission_amount), 0)
  const approved = commissions.filter((c) => c.status === 'Approved').reduce((s, c) => s + Number(c.commission_amount), 0)
  const paid = commissions.filter((c) => c.status === 'Paid').reduce((s, c) => s + Number(c.commission_amount), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Commission</h1>
        <p className="text-sm text-gray-500">Track your earnings and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-xs text-yellow-700 font-medium">Pending</span>
          </div>
          <p className="text-lg font-bold text-yellow-800">{fmt(pending)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Approved</span>
          </div>
          <p className="text-lg font-bold text-blue-800">{fmt(approved)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Banknote className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Paid</span>
          </div>
          <p className="text-lg font-bold text-green-800">{fmt(paid)}</p>
        </div>
      </div>

      {/* Table */}
      {commissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No commissions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Client</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Milestone</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Commission</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commissions.map((c) => (
                  <tr key={c.commission_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.lead_name}</p>
                      {c.deal_value > 0 && <p className="text-xs text-gray-400">Deal: {fmt(Number(c.deal_value))}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.milestone}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(Number(c.commission_amount))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.paid_at ? fmtDate(c.paid_at) : c.approved_at ? fmtDate(c.approved_at) : fmtDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
