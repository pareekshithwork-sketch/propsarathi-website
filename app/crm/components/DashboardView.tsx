'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, Users, AlertCircle, CheckCircle2, Phone, MessageCircle, Calendar, RefreshCw, Users2 } from 'lucide-react'
import { ScopeToggle, type Scope } from '@/app/crm/components/ScopeToggle'
import { v2StageLabel, v2StageBadge } from '@/app/crm/constants'

function formatScheduled(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffH / 24)
    if (diffMs > 0) {
      if (diffH < 1) return 'Just passed'
      if (diffH < 24) return `${diffH}h overdue`
      return `${diffD}d overdue`
    }
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function WorkItem({ item, accent }: { item: any; accent: string }) {
  const phoneClean = (item.lead_country_code || '+91').replace('+', '') + (item.lead_phone || '')
  const waMsg = encodeURIComponent(`Hi ${item.lead_name}, this is PropSarathi Team.`)
  return (
    <div className={`rounded-lg border ${accent} px-3 py-2 bg-white`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-900 truncate">{item.lead_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${v2StageBadge(item.stage)}`}>
              {v2StageLabel(item.stage)}
            </span>
            {item.sub_stage && <span className="text-[10px] text-gray-400 truncate">{item.sub_stage}</span>}
          </div>
          {item.scheduled_at && (
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {formatScheduled(item.scheduled_at)}
            </p>
          )}
          {item.assigned_rm && <p className="text-[10px] text-gray-400 mt-0.5">{item.assigned_rm}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href={`tel:${item.lead_country_code || '+91'}${item.lead_phone}`}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Call"
            onClick={e => e.stopPropagation()}
          >
            <Phone className="w-3 h-3" />
          </a>
          <a
            href={`https://wa.me/${phoneClean}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="p-1 text-gray-400 hover:text-green-600"
            title="WhatsApp"
            onClick={e => e.stopPropagation()}
          >
            <MessageCircle className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

function WorkColumn({
  title, count, items, emptyMsg, headerCls, accentCls,
}: {
  title: string; count: number; items: any[]; emptyMsg: string; headerCls: string; accentCls: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`px-3 py-2 flex items-center justify-between ${headerCls}`}>
        <p className="text-xs font-semibold">{title}</p>
        <span className="text-xs font-bold">{count}</span>
      </div>
      <div className="p-2 space-y-1.5 max-h-52 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">{emptyMsg}</p>
        ) : (
          items.map((item: any) => (
            <WorkItem key={item.enquiry_id} item={item} accent={accentCls} />
          ))
        )}
      </div>
    </div>
  )
}

export function DashboardView({
  loading, onNavigate, v2Dashboard, user,
}: {
  loading: boolean
  onNavigate: (v: any) => void
  v2Dashboard?: any
  user?: any
}) {
  const [scope, setScope] = useState<Scope>(() => {
    try { return (localStorage.getItem('crm_scope_preference') as Scope) || 'my' } catch { return 'my' }
  })
  const [dashData, setDashData] = useState<any>(null)
  const [dashLoading, setDashLoading] = useState(false)
  const [reEngagementPartners, setReEngagementPartners] = useState<any[]>([])

  const fetchReEngagement = useCallback(async (s: Scope) => {
    try {
      const res = await fetch(`/api/crm/v2/partners?scope=${s}&reEngagement=true&limit=20`, { credentials: 'include' })
      const d = await res.json()
      if (d.success) setReEngagementPartners(d.partners)
    } catch {}
  }, [])

  const fetchDashboard = useCallback(async (s: Scope) => {
    setDashLoading(true)
    try {
      const res = await fetch(`/api/crm/v2/dashboard?scope=${s}`, { credentials: 'include' })
      const d = await res.json()
      if (d.success) setDashData(d)
    } catch {}
    finally { setDashLoading(false) }
  }, [])

  useEffect(() => { fetchDashboard(scope) }, [scope, fetchDashboard])
  useEffect(() => { fetchReEngagement(scope) }, [scope, fetchReEngagement])

  const dash = dashData ?? v2Dashboard
  const scopeLabel = scope === 'org' ? 'All' : scope === 'team' ? 'Team' : 'My'
  const ms = dash?.myStats
  const pipeline = dash?.pipelineStats ?? {}
  const sources: { source: string; count: number }[] = dash?.sourceStats ?? []
  const byRM: any[] = dash?.byRM ?? []
  const totalLeads = ms?.totalLeads ?? 0

  if (loading && !dash) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  const pipelineTiles = [
    { label: 'New',       value: pipeline['New'] ?? 0,                    color: 'border-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   icon: '🆕' },
    { label: 'Callback',  value: pipeline['Callback'] ?? 0,               color: 'border-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  icon: '📞' },
    { label: 'Meeting',   value: pipeline['Schedule Meeting'] ?? 0,       color: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '📅' },
    { label: 'Site Visit',value: pipeline['Schedule Site Visit'] ?? 0,    color: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: '📍' },
    { label: 'EOI',       value: pipeline['Expression Of Interest'] ?? 0, color: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', icon: '⭐' },
    { label: 'Booked',    value: pipeline['Book'] ?? 0,                   color: 'border-violet-500', bg: 'bg-violet-50', text: 'text-violet-700', icon: '🏆' },
    { label: 'Not Int.',  value: pipeline['Not Interested'] ?? 0,         color: 'border-gray-400',   bg: 'bg-gray-50',   text: 'text-gray-600',   icon: '🚫' },
    { label: 'Drop',      value: pipeline['Drop'] ?? 0,                   color: 'border-red-400',    bg: 'bg-red-50',    text: 'text-red-600',    icon: '❌' },
  ]

  const socialSources = ['Facebook', 'LinkedIn', 'Google Ads', 'Gmail', 'WhatsApp', 'YouTube']
  const thirdPartySources = ['IVR', 'Magic Bricks', '99 Acres', 'Housing.com', 'Website']
  const otherSources = ['Direct', 'Referral', 'Walk In', 'Cold Call', 'Partner Portal']

  function getSourceCount(key: string) {
    if (key === 'Partner Portal') {
      return sources.filter(s => s.source === 'Partner Portal' || s.source?.startsWith('Partner:')).reduce((a, s) => a + s.count, 0)
    }
    return sources.find(s => s.source === key)?.count ?? 0
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">

      {/* TODAY'S WORK */}
      {dash && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="text-base">📋</span> Today&apos;s Work
            </h2>
            <div className="flex items-center gap-2">
              <ScopeToggle
                scope={scope}
                role={user?.role || 'rm'}
                onChange={s => {
                  setScope(s)
                  try { localStorage.setItem('crm_scope_preference', s) } catch {}
                }}
              />
              <button
                onClick={() => fetchDashboard(scope)}
                className={`p-1.5 ${dashLoading ? 'text-[#422D83]' : 'text-gray-400 hover:text-gray-600'}`}
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${dashLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: `${scopeLabel} Leads`,      value: ms?.totalLeads ?? 0,          bg: 'bg-[#422D83]' },
              { label: 'Unassigned',               value: ms?.unassignedLeads ?? 0,     bg: 'bg-amber-500' },
              { label: 'Booked This Month',        value: ms?.bookedThisMonth ?? 0,     bg: 'bg-green-600' },
              { label: 'Site Visits / Month',      value: ms?.siteVisitsThisMonth ?? 0, bg: 'bg-cyan-500' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} text-white rounded-xl px-4 py-3`}>
                <p className="text-2xl font-bold leading-tight">{s.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 3-column work sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <WorkColumn
              title="🔴 Overdue"
              count={dash.overdueEnquiries?.length ?? 0}
              items={dash.overdueEnquiries || []}
              emptyMsg="No overdue tasks"
              headerCls="bg-red-50 text-red-700 border-b border-red-100"
              accentCls="border-red-200"
            />
            <WorkColumn
              title="🟡 Due Today"
              count={dash.dueTodayEnquiries?.length ?? 0}
              items={dash.dueTodayEnquiries || []}
              emptyMsg="Nothing due today"
              headerCls="bg-amber-50 text-amber-700 border-b border-amber-100"
              accentCls="border-amber-200"
            />
            <WorkColumn
              title="🔵 Site Visits Today"
              count={dash.siteVisitsToday?.length ?? 0}
              items={dash.siteVisitsToday || []}
              emptyMsg="No site visits today"
              headerCls="bg-cyan-50 text-cyan-700 border-b border-cyan-100"
              accentCls="border-cyan-200"
            />
          </div>

          {/* Pipeline Overview */}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Leads by Source</h2>
              <div className="space-y-4">
                {[
                  { group: 'Social',     keys: socialSources },
                  { group: '3rd Party', keys: thirdPartySources },
                  { group: 'Others',    keys: otherSources },
                ].map(({ group, keys }) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group}</p>
                    <div className="space-y-1.5">
                      {keys.map(k => {
                        const c = getSourceCount(k)
                        const pct = totalLeads > 0 ? Math.round((c / totalLeads) * 100) : 0
                        return (
                          <div key={k} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-28 truncate flex-shrink-0">{k}</span>
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

            {byRM.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Team Performance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Agent', 'Total', 'New', 'Callback', 'Meeting', 'Site Visit', 'EOI', 'Booked'].map(h => (
                          <th key={h} className="text-left pb-2 pr-3 font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {byRM.map((rm: any) => (
                        <tr key={rm.name} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-3 font-medium text-gray-800 whitespace-nowrap">{rm.name}</td>
                          <td className="py-2 pr-3 font-bold text-blue-600">{rm.total}</td>
                          <td className="py-2 pr-3">{rm.new_count}</td>
                          <td className="py-2 pr-3">{rm.callbacks}</td>
                          <td className="py-2 pr-3">{rm.meetings}</td>
                          <td className="py-2 pr-3">{rm.site_visits}</td>
                          <td className="py-2 pr-3 text-orange-600">{rm.eoi}</td>
                          <td className="py-2 pr-3 text-green-600 font-medium">{rm.booked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {(dash.recentActivity || []).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Recent Activity</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dash.recentActivity.map((a: any) => (
                  <div key={a.id} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#422D83]/40 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 font-medium truncate">{a.title}</p>
                      {a.description && <p className="text-[10px] text-gray-400 truncate">{a.description}</p>}
                      <p className="text-[10px] text-gray-400">{a.performed_by} · {a.lead_id}</p>
                    </div>
                    <p className="text-[10px] text-gray-300 flex-shrink-0">
                      {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partner Activity Feed */}
          {(dash.partnerActivity || []).length > 0 && (
            <div className="bg-white rounded-xl border border-violet-200 p-3">
              <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1.5">
                🤝 Partner Activity
              </p>
              <div className="space-y-1.5">
                {dash.partnerActivity.map((a: any, i: number) => {
                  const actionLabel =
                    a.activity_type === 'enquiry_referred' ? 'referred a new enquiry' :
                    a.activity_type === 'listing_referred' ? 'referred a new listing' :
                    a.activity_type === 'note_added' ? 'added a note' :
                    a.activity_type
                  return (
                    <div key={a.id || i} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium text-gray-800 truncate">{a.partner_name}</span>
                          {a.partner_tier && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{a.partner_tier}</span>
                          )}
                          <span className="text-[10px] text-gray-400">{actionLabel}</span>
                        </div>
                        {a.lead_id && <p className="text-[10px] text-gray-400 mt-0.5">{a.lead_id}</p>}
                      </div>
                      <p className="text-[10px] text-gray-300 flex-shrink-0">
                        {a.created_at ? new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Partner Re-engagement */}
          {reEngagementPartners.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-200 p-3">
              <p className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5" /> Partner Re-engagement Needed
              </p>
              <div className="space-y-1.5">
                {reEngagementPartners.slice(0, 5).map((p: any) => {
                  const days = Math.floor(Number(p.days_since_last_referral))
                  return (
                    <div key={p.partner_id} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 last:border-0">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-gray-800">{p.name}</span>
                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1 rounded">{p.tier}</span>
                      </div>
                      <span className={`text-xs font-semibold ${days >= 30 ? 'text-red-600' : days >= 20 ? 'text-orange-500' : 'text-yellow-600'}`}>
                        {days}d inactive
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!dash && !loading && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No dashboard data available
        </div>
      )}
    </div>
  )
}
