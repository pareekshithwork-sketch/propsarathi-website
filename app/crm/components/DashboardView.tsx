'use client'

import React from 'react'
import { Loader2, Users, AlertCircle, CheckCircle2, Database } from 'lucide-react'
import type { Lead, HistoryEntry } from '../types'

export function DashboardView({ stats, loading, leads, onNavigate }: { stats: any; loading: boolean; leads: Lead[]; onNavigate: (v: any) => void }) {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  const sourceCounts: { source: string; count: number }[] = stats.sourceCounts || []
  const totalLeads = stats.totalLeads || 0

  // Map sources to display groups
  const socialSources = [
    { name: "Facebook", key: "Facebook" },
    { name: "LinkedIn", key: "LinkedIn" },
    { name: "Google Ads", key: "Google Ads" },
    { name: "Gmail", key: "Gmail" },
    { name: "WhatsApp", key: "WhatsApp" },
    { name: "YouTube", key: "YouTube" },
  ]
  const thirdPartySources = [
    { name: "IVR", key: "IVR" },
    { name: "Magic Bricks", key: "Magic Bricks" },
    { name: "99 Acres", key: "99 Acres" },
    { name: "Housing.com", key: "Housing.com" },
    { name: "QuikrHomes", key: "QuikrHomes" },
    { name: "JustLead", key: "JustLead" },
    { name: "Website", key: "Website" },
    { name: "Partner Portal", key: "__partner__" },
  ]
  const otherSources = [
    { name: "Direct", key: "Direct" },
    { name: "Referral", key: "Referral" },
    { name: "Walk In", key: "Walk In" },
    { name: "Cold Call", key: "Cold Call" },
  ]

  function getCount(key: string) {
    if (key === "__partner__") {
      return sourceCounts.filter(s => s.source?.startsWith("Partner:")).reduce((acc, s) => acc + s.count, 0)
    }
    return sourceCounts.find(s => s.source === key)?.count || 0
  }

  const pipelineTiles = [
    { label: "New", value: stats.newLeads, color: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", icon: "🆕" },
    { label: "Pending", value: stats.callbackLeads, color: "border-amber-500", bg: "bg-amber-50", text: "text-amber-700", icon: "⏰" },
    { label: "Callbacks", value: stats.callbackLeads, color: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", icon: "📞" },
    { label: "Meetings", value: stats.meetings, color: "border-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", icon: "📅" },
    { label: "Site Visits", value: stats.siteVisits, color: "border-purple-500", bg: "bg-purple-50", text: "text-purple-700", icon: "📍" },
    { label: "Overdue", value: stats.overdue, color: "border-red-500", bg: "bg-red-50", text: "text-red-700", icon: "🔴" },
    { label: "EOI", value: stats.eoi, color: "border-orange-500", bg: "bg-orange-50", text: "text-orange-700", icon: "⭐" },
    { label: "Booked", value: stats.booked, color: "border-violet-500", bg: "bg-violet-50", text: "text-violet-700", icon: "🏆" },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.totalLeads, sub: `${stats.activeLeads} active`, icon: Users, color: "bg-blue-500" },
          { label: "Unassigned", value: stats.unassigned, sub: "Needs assignment", icon: AlertCircle, color: "bg-amber-500" },
          { label: "Booked", value: stats.booked, sub: "Closed deals", icon: CheckCircle2, color: "bg-green-500" },
          { label: "Total Data", value: stats.totalData, sub: `${stats.convertedData} converted`, icon: Database, color: "bg-indigo-500" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline tiles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Overview</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {pipelineTiles.map(tile => (
            <div key={tile.label} className={`border-l-4 ${tile.color} ${tile.bg} rounded-r-lg p-2 text-center`}>
              <p className="text-lg">{tile.icon}</p>
              <p className={`text-xl font-bold ${tile.text}`}>{tile.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{tile.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source breakdown + RM table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Leads by Source</h2>
          <div className="space-y-4">
            {[
              { group: "Social", sources: socialSources },
              { group: "3rd Party", sources: thirdPartySources },
              { group: "Others", sources: otherSources },
            ].map(({ group, sources }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group}</p>
                <div className="space-y-1.5">
                  {sources.map(s => {
                    const c = getCount(s.key)
                    const pct = totalLeads > 0 ? Math.round((c / totalLeads) * 100) : 0
                    return (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-28 truncate flex-shrink-0">{s.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{c}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(stats.recentActivity || []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              (stats.recentActivity || []).map((h: HistoryEntry, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium truncate">{h.action}</p>
                    <p className="text-xs text-gray-400">{h.changedBy} · {h.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RM Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Team Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Agent", "Total", "New", "Pending", "Overdue", "EOI", "Callbacks", "Meetings", "Site Visits", "Booked"].map(h => (
                  <th key={h} className="text-left pb-2 pr-3 font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.byRM || []).map((rm: any) => (
                <tr key={rm.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium text-gray-800 whitespace-nowrap">{rm.name}</td>
                  <td className="py-2 pr-3 font-bold text-blue-600">{rm.total}</td>
                  <td className="py-2 pr-3">{rm.new}</td>
                  <td className="py-2 pr-3 text-amber-600">{rm.pending}</td>
                  <td className="py-2 pr-3 text-red-600">{rm.overdue}</td>
                  <td className="py-2 pr-3 text-orange-600">{rm.eoi}</td>
                  <td className="py-2 pr-3">{rm.callbacks}</td>
                  <td className="py-2 pr-3">{rm.meetings}</td>
                  <td className="py-2 pr-3">{rm.siteVisits}</td>
                  <td className="py-2 pr-3 text-green-600 font-medium">{rm.booked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
