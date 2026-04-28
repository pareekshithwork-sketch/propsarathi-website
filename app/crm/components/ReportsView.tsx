'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Lead } from '../types'
import { PIPELINE_STAGES } from '../constants'

export function ReportsView({ leads }: { leads: Lead[] }) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay())

  const leadsThisMonth = leads.filter(l => new Date(l.createdAt) >= startOfMonth)
  const leadsThisWeek = leads.filter(l => new Date(l.createdAt) >= startOfWeek)

  const byStatus = PIPELINE_STAGES.map(s => ({ name: s === 'Expression of Interest' ? 'EOI' : s, count: leads.filter(l => l.status === s).length })).filter(s => s.count > 0)

  const rmMap: Record<string, number> = {}
  leads.forEach(l => { const rm = l.assignedRM || 'Unassigned'; rmMap[rm] = (rmMap[rm] || 0) + 1 })
  const byRM = Object.entries(rmMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))

  const srcMap: Record<string, number> = {}
  leads.forEach(l => { const s = l.source || 'Unknown'; srcMap[s] = (srcMap[s] || 0) + 1 })
  const bySource = Object.entries(srcMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))

  const PURPLE = ['#422D83','#5b40b0','#7d65cc','#9e8ada','#c0b4e9']

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Leads', val: leads.length, bg: 'bg-[#422D83]' },
          { label: 'This Month', val: leadsThisMonth.length, bg: 'bg-indigo-500' },
          { label: 'This Week', val: leadsThisWeek.length, bg: 'bg-blue-500' },
          { label: 'Booked', val: leads.filter(l => l.status === 'Booked').length, bg: 'bg-violet-600' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 text-white ${c.bg}`}>
            <p className="text-2xl font-bold">{c.val}</p>
            <p className="text-xs opacity-80 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} />
              <Bar dataKey="count" radius={[0,4,4,0]}>
                {byStatus.map((_, i) => <Cell key={i} fill={PURPLE[i % PURPLE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by RM</h3>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {byRM.map(r => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-28 truncate">{r.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#422D83] rounded-full" style={{ width: `${Math.round(r.count / (byRM[0]?.count || 1) * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-5 text-right">{r.count}</span>
              </div>
            ))}
            {byRM.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bySource} margin={{ left: 0, right: 16, bottom: 48 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {bySource.map((_, i) => <Cell key={i} fill={PURPLE[i % PURPLE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Conversion by RM</h3>
          <div className="space-y-2.5">
            {byRM.map(r => {
              const booked = leads.filter(l => l.assignedRM === r.name && l.status === 'Booked').length
              const pct = r.count > 0 ? Math.round(booked / r.count * 100) : 0
              return (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-28 truncate">{r.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{booked}/{r.count}</span>
                </div>
              )
            })}
            {byRM.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
