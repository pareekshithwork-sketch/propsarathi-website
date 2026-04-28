'use client'

import React from 'react'
import { STATUS_COLORS } from '../constants'

export function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    "MND-1": "bg-purple-600 text-white",
    "DC": "bg-blue-600 text-white",
    "SVND-1": "bg-indigo-600 text-white",
    "Hot": "bg-red-500 text-white",
    "Warm": "bg-orange-500 text-white",
    "Cold": "bg-blue-400 text-white",
    "Escalated": "bg-yellow-500 text-white",
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[tag] || "bg-gray-200 text-gray-700"}`}>
      {tag}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {status}
    </span>
  )
}

export function RMInitial({ name, color = "bg-blue-500" }: { name: string; color?: string }) {
  if (!name) return null
  return (
    <span title={name} className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0 ${color}`}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      {children}
    </select>
  )
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    />
  )
}
